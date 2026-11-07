import express from 'express';
import db from '../database.js'; // ajuste o caminho conforme a localização do seu módulo de conexão com o banco

const router = express.Router();

// ============================
// ROTAS DE FREQUENCIA
// ============================
 //Página: carrega só as oficinas; o resto vem via fetch
router.get('/frequencia', async (req, res) => {
  if (!req.session.usuario) {
    return res.redirect('/login');
  }

  try {
    const [oficinas] = await db.query(
      'SELECT idOficina, titulo FROM oficina ORDER BY titulo'
    );

    res.render('telaFrequencia', {
      layout: 'layouts/telasNavegacao',
      oficinas
    });
  } catch (error) {
    console.error('ERRO:', error);
    res.status(500).send('Erro ao carregar a página de frequência.');
  }
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
  if (!req.session.usuario) {
    return res.status(401).json({ erro: 'Sessão expirada. Faça login novamente.' });
  }

  const { idOficina, data, registros } = req.body;

  if (!idOficina || !data || !Array.isArray(registros) || registros.length === 0) {
    return res.status(400).json({ erro: 'Dados inválidos.' });
  }

  try {
    // confirma que a oficina realmente acontece nesse dia
    const [dia] = await db.query(
      `SELECT 1 FROM oficina_acontece_dia
        WHERE oficina_idOficina = ? AND dia_dtOficinaDia = ?`,
      [idOficina, data]
    );
    if (dia.length === 0) {
      return res.status(400).json({ erro: 'Esta oficina não acontece na data escolhida.' });
    }

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

    res.json({ ok: true, mensagem: 'Frequência salva com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao salvar a frequência.' });
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