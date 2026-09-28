import express from 'express';
import db from '../database.js'; // ajuste o caminho conforme a localização do seu módulo de conexão com o banco

const router = express.Router();


// ROTA DE CADASTRO ATIVIDADES
    router.get('/cadastroat', (req, res) => {
    if (req.session.usuario) {
        res.render('telaCadastroA', { layout: 'layouts/mainLogado' });
    } else {
        res.redirect('/mainLogado');
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
