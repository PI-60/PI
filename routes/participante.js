import express from 'express';
import db from '../database.js'; // ajuste o caminho conforme a localização do seu módulo de conexão com o banco

const router = express.Router();

// ============================
// ROTAS DE FREQUENCIA
// ============================
router.get('/frequencia', async (req, res) => {
  try {
    const [participantes] = await db.execute(
      'SELECT idParticipante, nome FROM participante'
    );

    console.log('PARTICIPANTES:', participantes);

    res.render('telaFrequencia', {
      layout: 'layouts/mainLogado',
      participantes: participantes
    });

  } catch (error) {
    console.error('ERRO:', error);
    res.status(500).send('Erro ao carregar participantes.');
  }
});
// ============================
// ROTAS DE PARTICPANTE
// ============================
router.get('/participantes', async (req, res) => {

  if (req.session.usuario) {
    res.render('telaParticipante', {
      layout: 'layouts/mainLogado'
       
    });
  } else {
    res.redirect('/login');
  }

});
 router.post('/participantes', async (req, res) => {

    const termo = req.query.q || '';
    // comando no msql db.consulta = traz os dados em linhas
    const [rows] = await db.query(              // so pesquisa pelo nome
        'SELECT nome, telefone, cpf FROM participantes WHERE nome LIKE ?'
        [`${termo}%`]   // começa com o termo digitado ou seja se esrtiver pesquisando ANA MARIA e escrecver MARIA nao vai escontrar
        //  e % = tudo que vem deppois
    );
    res.json(rows);
});


export default router;
