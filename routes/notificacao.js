import express from 'express';
import db from '../database.js';

const router = express.Router();

// cria uma notificação quando um bolsista é vinculado a uma atividade (oficina)
export async function notificarBolsistaAdicionado(oficinaId, bolsistaEmail, tituloAtividade) {
    const [[bolsistaInfo]] = await db.query(
        'SELECT nome FROM usuario WHERE email = ?',
        [bolsistaEmail]
    );
    const nomeBolsista = bolsistaInfo ? bolsistaInfo.nome : bolsistaEmail;

    await db.execute(
        `INSERT INTO notificacao (oficina_idOficina, bolsista_email, mensagem)
         VALUES (?, ?, ?)`,
        [oficinaId, bolsistaEmail, `${nomeBolsista} foi adicionado(a) à atividade "${tituloAtividade}"`]
    );
}

// lista as notificações mais recentes
router.get('/notificacoes', async (req, res) => {
    if (!req.session.usuario) {
        return res.status(401).json({ erro: 'Não autenticado' });
    }

    try {
        const [notificacoes] = await db.query(
            `SELECT idNotificacao, mensagem, criado_em, lida, oficina_idOficina
             FROM notificacao
             ORDER BY criado_em DESC
             LIMIT 20`
        );

        const [[{ naoLidas }]] = await db.query(
            'SELECT COUNT(*) AS naoLidas FROM notificacao WHERE lida = 0'
        );

        res.json({ notificacoes, naoLidas });

    } catch (erro) {
        console.error('Erro ao buscar notificações:', erro);
        res.status(500).json({ erro: 'Erro ao buscar notificações' });
    }
});

// marca todas as notificações como lidas
router.post('/notificacoes/marcar-lidas', async (req, res) => {
    if (!req.session.usuario) {
        return res.status(401).json({ erro: 'Não autenticado' });
    }

    try {
        await db.query('UPDATE notificacao SET lida = 1 WHERE lida = 0');
        res.json({ sucesso: true });

    } catch (erro) {
        console.error('Erro ao marcar notificações como lidas:', erro);
        res.status(500).json({ erro: 'Erro ao marcar notificações como lidas' });
    }
});

export default router;
