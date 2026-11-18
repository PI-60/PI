import express from 'express';
import db from '../database.js';


const router = express.Router();

// ============================
// ROTAS DE FREQUENCIA
// ============================
// GET /frequencia
router.get('/frequencia', async (req, res) => {
  if (!req.session.usuario) return res.redirect('/login');

  try {
    // Participantes (a pesquisa agora é feita no front)
    const [participantes] = await db.query(
      'SELECT idParticipante, nome FROM participante ORDER BY nome'
    );

    // Oficinas + dias em que acontecem
    const [linhas] = await db.query(
      `SELECT o.idOficina,
              o.titulo,
              DATE_FORMAT(d.dia_dtOficinaDia, '%Y-%m-%d') AS data,
              DATE_FORMAT(d.dia_dtOficinaDia, '%d/%m/%Y') AS dataBr
         FROM oficina_acontece_dia d
         JOIN oficina o ON o.idOficina = d.oficina_idOficina
        ORDER BY o.titulo, d.dia_dtOficinaDia`
    );

    const opcoes = linhas.map(l => ({
      valor: `${l.idOficina}|${l.data}`,
      rotulo: `${l.titulo} - ${l.dataBr}`
    }));

    res.render('telaFrequencia', {
      layout: 'layouts/telasNavegacao',
      participantes,
      opcoes
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).send('Erro ao carregar a tela de frequência');
  }
});

// POST /frequencia
router.post('/frequencia', async (req, res) => {
  
    console.log('BODY:', req.body);

  if (!req.session.usuario) {
    return res.status(401).json({ erro: 'Não autenticado' });
  }

  const { idOficina, data, registros } = req.body;

  if (!idOficina || !data || !Array.isArray(registros) || registros.length === 0) {
    return res.status(400).json({ erro: 'Dados incompletos.' });
  }

  try {
    // Garante que a oficina realmente acontece nesse dia
    const [existe] = await db.query(
      `SELECT 1 FROM oficina_acontece_dia
        WHERE oficina_idOficina = ? AND dia_dtOficinaDia = ?`,
      [idOficina, data]
    );
    if (existe.length === 0) {
      return res.status(400).json({ erro: 'Essa oficina não acontece nesse dia.' });
    }

    // Um único INSERT com todas as linhas (atômico por natureza)
    const valores = registros.map(r => [
      r.idParticipante,
      data,
      idOficina,
      r.presente ? 1 : 0
    ]);

    await db.query(
      `INSERT INTO participa
         (idParticipante, dia_dtOficinaDia, oficina_idOficina, frequencia)
       VALUES ?
       ON DUPLICATE KEY UPDATE frequencia = VALUES(frequencia)`,
      [valores]
    );

    //freqsalva res.redirect('/atividades?mensagem=atividadeCadastrada');

    return res.json({ mensagem: 'Frequência salva com sucesso!' });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Não foi possível salvar a frequência.' });
  }
});
// ============================
// ROTAS DE PARTICPANTE
// ============================
router.get('/participantes', async (req, res) => {

    if (!req.session.usuario) {
       return res.redirect('/login');
    }
    // pesquisar
    try {
       const termo = req.query.termo || '';

        const [participantes] = await db.query(
            'SELECT idParticipante, nome, telefone, CPF FROM participante WHERE nome LIKE ?',
                [`%${termo}%`]
        );

          res.render('telaParticipante', {
           layout: 'layouts/telasNavegacao',
          participantes
      });

    } catch (erro) {
        console.error(erro);
        res.status(500).send('Erro ao buscar participantes');
    }
});


// ============================
// EXCLUIR PARTICIPANTE
// ============================
router.post('/participantes/:id/excluir', async (req, res) => {

    if (!req.session.usuario) {
       return res.redirect('/login');
    }
    try {
        // apaga primeiro a frequência (tabela participa), por causa da chave estrangeira
        await db.beginTransaction();
        await db.query('DELETE FROM participa WHERE idParticipante = ?', [req.params.id]);
        await db.query('DELETE FROM participante WHERE idParticipante = ?', [req.params.id]);
        await db.commit();

        // pra redirecionar junto com  a msg
        return res.redirect(
          '/participantes?mensagem=participanteExcluido'
        );
   } catch (erro) {
    await db.rollback();
    console.error(erro);
     return res.redirect(
        '/participantes?mensagem=erro'
    );
}
});


export default router;




/* router.get('/frequencia', async (req, res) => {
  const [rows] = await db.query(
    `SELECT o.idOficina, o.titulo,
            DATE_FORMAT(d.dia_dtOficinaDia, '%Y-%m-%d') AS data,
            DATE_FORMAT(d.dia_dtOficinaDia, '%d/%m')    AS dataBR
     FROM oficina_acontece_dia d
     JOIN oficina o ON o.idOficina = d.oficina_idOficina
     ORDER BY o.titulo, d.dia_dtOficinaDia`
  );

  const opcoes = rows.map(r => ({
    valor:  `${r.idOficina}|${r.data}`,   // oficina e dia juntos
    rotulo: `${r.titulo} - ${r.dataBR}`
  }));

  res.render('telaFrequencia', { layout: 'layouts/mainLogado', opcoes });
});


// Dias em que a oficina acontece
router.get('/frequencia/dias', async (req, res) => {
  if (!req.session.usuario) {
    return res.status(401).json({ erro: 'Sessão expirada. Faça login novamente.' });
  }

  const { oficina } = req.query;
  if (!oficina) {
    return res.status(400).json({ erro: 'Informe a oficina.' });
  }

  try {
    // DATE_FORMAT evita o problema de fuso horário do objeto Date do JS
    const [dias] = await db.query(
      `SELECT DATE_FORMAT(dia_dtOficinaDia, '%Y-%m-%d') AS valor,
              DATE_FORMAT(dia_dtOficinaDia, '%d/%m/%Y') AS texto
         FROM oficina_acontece_dia
        WHERE oficina_idOficina = ?
        ORDER BY dia_dtOficinaDia`,
      [oficina]
    );
    res.json(dias);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao buscar as datas.' });
  }
});

// Participantes + frequência já salva na oficina/data
router.get('/frequencia/lista', async (req, res) => {
  if (!req.session.usuario) {
    return res.status(401).json({ erro: 'Sessão expirada. Faça login novamente.' });
  }

  const { oficina, data } = req.query;
  if (!oficina || !data) {
    return res.status(400).json({ erro: 'Informe a oficina e a data.' });
  }

  try {
    const [lista] = await db.query(
      `SELECT p.idParticipante,
              TRIM(p.nome) AS nome,
              pa.frequencia
         FROM participante p
         LEFT JOIN participa pa
                ON pa.idParticipante = p.idParticipante
               AND pa.oficina_idOficina = ?
               AND pa.dia_dtOficinaDia = ?
        ORDER BY p.nome`,
      [oficina, data]
    );
    res.json(lista);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao buscar os participantes.' });
  }
});

// Salvar (insere ou atualiza)
  router.post('/frequencia', async (req, res) => {
  const [idOficina, data] = (req.body.dia || '').split('|');
  const presencas = req.body.presenca || {};   // presenca[idParticipante] = 1 ou 0

  try {
    await db.beginTransaction();
    for (const [idParticipante, valor] of Object.entries(presencas)) {
      await db.execute(
        `INSERT INTO participa
         (idParticipante, dia_dtOficinaDia, oficina_idOficina, frequencia)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE frequencia = VALUES(frequencia)`,
        [idParticipante, data, idOficina, Number(valor)]
      );
    }
    await db.commit();
    res.redirect('/frequencia?mensagem=frequenciaSalva');
  } catch (erro) {
    await db.rollback();
    console.error(erro);
    res.redirect('/frequencia?mensagem=erro');
  }
}); */ 