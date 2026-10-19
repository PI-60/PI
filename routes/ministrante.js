import express from 'express';
import db from '../database.js'; // ajuste o caminho conforme a localização do seu módulo de conexão com o banco

const router = express.Router();

// ============================
// ROTAS DE PARTICPANTE
// ============================
router.get('/ministrantes', async (req, res) => {

    if (!req.session.usuario) {
       return res.redirect('/login');
    }
    try {
       const termo = req.query.termo || '';

        const [ministrantes] = await db.query(
            'SELECT email, nome, telefone FROM ministrante WHERE nome LIKE ?',
                [`%${termo}%`]
        );

          res.render('telaMinistrante', {
           layout: 'layouts/mainLogado',
          ministrantes
      });

    } catch (erro) {
        console.error(erro);
        res.status(500).send('Erro ao buscar ministrantes');
    }
});

export default router;