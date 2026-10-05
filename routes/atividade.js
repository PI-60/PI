import express from 'express';
import db from '../database.js'; // ajuste o caminho conforme a localização do seu módulo de conexão com o banco

const router = express.Router();


// ROTA DE CADASTRO ATIVIDADES
router.get('/cadastroat', async (req, res) => {
    const [bolsista] = await db.query(
        //selecione email de bolsista e nome do bolsista(usuario) da tabela bolsita 
        `SELECT bolsista.email, usuario.nome FROM bolsista
         JOIN usuario WHERE bolsista.email = usuario.email
        `
          //join tabela usuaeio quando o eail dobolsita for = email do usuariio
              
     );
         const [ministrante] = await db.query(
        //selecione  emael e  nome da tabela ministrantes
         'SELECT email, nome FROM ministrante'
      
    );
    res.render('telaCadastroA', {
        bolsista,
        ministrante
    });

});



router.post('/cadastroat', async (req, res) => {

    const {
        titulo,
        emailM,
        descricao,
        local,
        dataInicio,
        dataTermino,
        bolsista1,
        bolsista2,
        bolsista3
    } = req.body;

    try {

        //  Cadastra a oficina
        const sql = `
            INSERT INTO oficina
            ( ministrante_email, titulo, descricao, local, dt_inicio, dt_termino)
            VALUES ( ?, ?, ?, ?, ?, ?)
        `;


        const [resultado] = await db.execute(sql, [
            emailM,
            titulo,
            descricao,
            local,
            dataInicio,
            dataTermino

        ]);

        // Pega o ID da oficina que acabou de ser cadastrada
        const idOficina = resultado.insertId;


        //  cadastra os bolsistas da oficina
        const sqlBolsista = `
            INSERT INTO usuario_monitora_oficina
            (usuario_email, oficina_idOficina)
            VALUES (?, ?)
        `;

       

        // Bolsista 1
        if (bolsista1) {
            await db.execute(sqlBolsista, [
                bolsista1,
                idOficina
            ]);
        }


        // Bolsista 2
        if (bolsista2) {
            await db.execute(sqlBolsista, [
                bolsista2,
                idOficina
            ]);
        }


        // Bolsista 3
        if (bolsista3) {
            await db.execute(sqlBolsista, [
                bolsista3,
                idOficina
            ]);
        }

        res.redirect('/inicioLogado');

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensagem: 'Erro ao cadastrar oficina',
            erro: error.message
        });
    }

});



// ROTA DE LISTAGEM 
router.get('/atividades', async (req, res) => {
  if (!req.session.usuario) {
       return res.redirect('/login');
    }
    try {

        // pesquisar
      const termo = req.query.termo || '';

        const [atividades] = await db.query(
            'SELECT ministrante_email, titulo, descricao, local, dt_inicio, dt_termino FROM oficina  WHERE titulo LIKE ?',
                [`%${termo}%`]
        );


          res.render('telaAtividades', {
           layout: 'layouts/mainLogado',
        //   atividades
    

           
      });

    } catch (erro) {
        console.error(erro);
        res.status(500).send('Erro ao buscar atividades');
    }
        
});

router.post('/atividades', async (req, res) => {

});

export default router;
/* 

    router.get('/atividades', (req, res) => {
    if (req.session.usuario) {
        res.render('telaAtividades', { layout: 'layouts/mainLogado' });
    } else {
        res.redirect('/inicioLogado');
    }*/ 

       