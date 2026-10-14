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
      const letra = req.query.letra || '';

        const [atividades] = await db.query(
            'SELECT idOficina,  titulo, local, dt_inicio FROM oficina  WHERE titulo LIKE ?',
                [`%${letra}%`]
        );


          res.render('telaAtividades', {
           layout: 'layouts/mainLogado',
           atividades:atividades
      
      });

    } catch (erro) {
        console.error(erro);
        res.status(500).send('Erro ao buscar atividades');
    }
        
});
// botao excluir
router.post('/atividades/:id/excluir', async (req, res) => {

    if (!req.session.usuario) {
       return res.redirect('/login');
    }
    try {
        await db.beginTransaction();
        // deleta da tabela usurario monitora onde o id da oficina for tal..
        await db.query('DELETE FROM usuario_monitora_oficina WHERE oficina_idOficina = ?',[req.params.id]);
        // deleta da tabela ofcina acontece dua onde for a id da ofocina..
         await db.query('DELETE FROM oficina_acontece_dia WHERE oficina_idOficina = ?',[req.params.id]);
         // por final aafar a oficina da tabela ofiicna
        await db.query('DELETE FROM oficina WHERE idOficina = ?', [req.params.id]);
        await db.commit();

        res.redirect('/atividades');

    } catch (erro) {
        await db.rollback();
        console.error(erro);
        res.status(500).send('Erro ao excluir atividade');
    }
});

// modal
router.get('/atividade/:id', async (req, res) => {
    try {
        const id = req.params.id;

        const [oficinas] = await db.execute(
            `SELECT idOficina, ministrante_email, titulo, descricao, local, dt_inicio, dt_termino FROM oficina WHERE idOficina = ?`,
            [id]
        );

        // pra ver se tem oficina se nao vai dar erro 404 = nao encontrado
        if (oficinas.length === 0) {
            return res.status(404).json({
                erro: 'Oficina não encontrada'
            });
        }

        const [bolsistas] = await db.execute(
            `SELECT usuario_email FROM usuario_monitora_oficina WHERE oficina_idOficina = ?`,
            [id]
        );

        /* oficinas = um array que contem as oficinas encontradas
            o [0] acessa o primeiro elemento
              (...)  chamados de operador spread eles copiam as propriedades do primeiro objeto de oficinas para o novo objeto
               as propriedades id, nome etc  que vaoser retornado s*/
        res.json({
            ...oficinas[0],
            bolsistas: bolsistas
        });

    } catch (erro) {
        console.error('Erro ao buscar oficina:', erro);

        res.status(500).json({
            erro: 'Erro ao consultar oficina'
        });
    }
});
 

export default router;

       