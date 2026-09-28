import express from 'express';
import db from '../database.js'; // ajuste o caminho conforme a localização do seu módulo de conexão com o banco

const router = express.Router();


// ROTA DE CADASTRO ATIVIDADES
router.get('/cadastroat', async (req, res) => {
    const [bolsista] = await db.query(
        //puxa
        `SELECT bolsista.email, usuario.nome FROM bolsista
         JOIN usuario WHERE bolsista.email = usuario.email
        `
    );
    res.render('telaCadastroA', {
        bolsista
    });
});

router.post('/cadastroat', async (req, res) => {

   const { titulo, emailM, descricao, local, bolsista1, bolsista2, bolsista3 } = req.body;

   try {
        let sql;
         sql = 'INSERT INTO oficina ( titulo, emailM, descricao, local, bolsista1, bolsista2, bolsista3 ) VALUES (?, ?, ?, ?, ?, ?, ?)';
        await db.execute(sql, [titulo, emailM, descricao, local, bolsista1, bolsista2, bolsista3]);
    }
       catch (error) {
        console.error(error);

        res.status(500).json({
            mensagem: 'Erro ao cadastrar oficina',
            erro: error.message
        });
    }
 
});



// ROTA DE LISTAGEM 
router.get('/atividades', (req, res) => {
    if (req.session.usuario) {
        res.render('telaAtividades', { layout: 'layouts/mainLogado' });
    } else {
        res.redirect('/mainLogado');
    }
});

export default router;
