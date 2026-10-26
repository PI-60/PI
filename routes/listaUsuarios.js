
import express from 'express';
import db from '../database.js';

import {
    exigirLogin,
    exigirCoordenador,
    exigirAdministrador,
    exigirCoordenadorOuAdministrador
} from '../middleware/permissoes.js';

const router = express.Router();

// ========================================
// LISTAGEM DE USUÁRIOS E MINISTRANTES
// ========================================

router.get('/usuarios', exigirLogin, async (req, res) => {
    try {
        const [usuarios] = await db.execute(`
            SELECT
                u.email,
                u.nome,
                u.telefone,
                u.CPF,
                CASE WHEN a.email IS NOT NULL THEN 1 ELSE 0 END AS administrador,
                CASE WHEN c.email IS NOT NULL THEN 1 ELSE 0 END AS coordenador,
                CASE WHEN b.email IS NOT NULL THEN 1 ELSE 0 END AS bolsista,
                0 AS ministrante
            FROM usuario u
            LEFT JOIN administrador a ON a.email = u.email
            LEFT JOIN coordenador c ON c.email = u.email
            LEFT JOIN bolsista b ON b.email = u.email

            UNION ALL

            SELECT
                m.email,
                m.nome,
                m.telefone,
                NULL AS CPF,
                0 AS administrador,
                0 AS coordenador,
                0 AS bolsista,
                1 AS ministrante
            FROM ministrante m
            WHERE NOT EXISTS (
                SELECT 1
                FROM usuario u
                WHERE u.email = m.email
            )

            ORDER BY nome
        `);

        return res.render('telaUsuario', {
            layout: 'layouts/mainLogado',
            usuarios
        });
    } catch (erro) {
        console.error('Erro ao listar usuários:', erro);
        return res.status(500).send('Erro ao carregar a lista de usuários.');
    }
});


 // ========================================
 // VISUALIZAR USUÁRIO OU MINISTRANTE
 // ========================================

router.get('/usuarios/visualizar/:email', exigirLogin, async (req, res) => {
    try {
        const email = req.params.email;

        const [usuarios] = await db.execute(
            `SELECT
                u.email,
                u.nome,
                u.telefone,
                u.CPF,
                CASE WHEN a.email IS NOT NULL THEN 1 ELSE 0 END AS administrador,
                CASE WHEN c.email IS NOT NULL THEN 1 ELSE 0 END AS coordenador,
                CASE WHEN b.email IS NOT NULL THEN 1 ELSE 0 END AS bolsista,
                0 AS ministrante
             FROM usuario u
             LEFT JOIN administrador a ON a.email = u.email
             LEFT JOIN coordenador c ON c.email = u.email
             LEFT JOIN bolsista b ON b.email = u.email
             WHERE u.email = ?

             UNION ALL

             SELECT
                m.email,
                m.nome,
                m.telefone,
                NULL AS CPF,
                0 AS administrador,
                0 AS coordenador,
                0 AS bolsista,
                1 AS ministrante
             FROM ministrante m
             WHERE m.email = ?
             AND NOT EXISTS (
                 SELECT 1 FROM usuario u WHERE u.email = m.email
             )`,
            [email, email]
        );

        if (usuarios.length === 0) {
            return res.status(404).send('Cadastro não encontrado.');
        }

        return res.render('telaVisualizarUsuario', {
            layout: 'layouts/mainLogado',
            usuario: usuarios[0]
        });
    } catch (erro) {
        console.error('Erro ao visualizar cadastro:', erro);
        return res.status(500).send('Erro ao carregar os dados.');
    }
});


// ========================================
// ABRIR FORMULÁRIO DE EDIÇÃO DE USUÁRIO
// Somente coordenadores
// ========================================

router.get(
    '/usuarios/editar/:email',
    exigirCoordenador,
    async (req, res) => {
        try {
            const email = req.params.email;

            const [usuarios] = await db.execute(
                `SELECT
                    u.email,
                    u.nome,
                    u.telefone,
                    u.CPF,
                    CASE
                        WHEN a.email IS NOT NULL THEN 'administrador'
                        WHEN c.email IS NOT NULL THEN 'coordenador'
                        WHEN b.email IS NOT NULL THEN 'bolsista'
                        ELSE 'usuario'
                    END AS tipo
                 FROM usuario u
                 LEFT JOIN administrador a ON a.email = u.email
                 LEFT JOIN coordenador c ON c.email = u.email
                 LEFT JOIN bolsista b ON b.email = u.email
                 WHERE u.email = ?`,
                [email]
            );

            if (usuarios.length === 0) {
                return res.status(404).send('Usuário não encontrado.');
            }

            return res.render('telaCadastroB', {
                layout: 'layouts/cadastro',
                usuario: usuarios[0],
                editandoUsuario: true
            });
        } catch (erro) {
            console.error('Erro ao abrir edição de usuário:', erro);
            return res.status(500).send('Erro ao abrir o cadastro.');
        }
    }
);

// ========================================
// ABRIR FORMULÁRIO DE EDIÇÃO DE MINISTRANTE
// Coordenadores e administradores
// ========================================

router.get(
    '/usuarios/ministrantes/editar/:email',
    exigirCoordenadorOuAdministrador,
    async (req, res) => {
        try {
            const email = req.params.email;

            const [ministrantes] = await db.execute(
                `SELECT email, nome, telefone
                 FROM ministrante
                 WHERE email = ?`,
                [email]
            );

            if (ministrantes.length === 0) {
                return res.status(404).send('Ministrante não encontrado.');
            }

            return res.render('telaCadastroB', {
                layout: 'layouts/cadastro',
                usuario: {
                    ...ministrantes[0],
                    tipo: 'ministrante',
                    CPF: null
                },
                editandoUsuario: true,
                editandoMinistrante: true
            });
        } catch (erro) {
            console.error('Erro ao abrir edição de ministrante:', erro);
            return res.status(500).send('Erro ao abrir o cadastro.');
        }
    }
);

// ========================================
// SALVAR EDIÇÃO DE USUÁRIO
// Somente coordenadores
// ========================================

router.post(
    '/usuarios/editar/:email',
    exigirCoordenador,
    async (req, res) => {
        const email = req.params.email;
        const { nome, telefone, cpf } = req.body;

        if (!nome?.trim()) {
            return res.status(400).send('O nome é obrigatório.');
        }

        try {
            const [usuarios] = await db.execute(
                'SELECT email FROM usuario WHERE email = ?',
                [email]
            );

            if (usuarios.length === 0) {
                return res.status(404).send('Usuário não encontrado.');
            }

            await db.execute(
                `UPDATE usuario
                 SET nome = ?, telefone = ?, CPF = ?
                 WHERE email = ?`,
                [
                    nome.trim(),
                    telefone?.trim() || null,
                    cpf?.trim() || null,
                    email
                ]
            );

            return res.redirect('/usuarios?mensagem=usuarioEditado');
        } catch (erro) {
            console.error('Erro ao editar usuário:', erro);
            return res.status(500).send('Erro ao salvar a edição do usuário.');
        }
    }
);

// ========================================
// SALVAR EDIÇÃO DE MINISTRANTE
// Coordenadores e administradores
// ========================================

router.post(
    '/usuarios/ministrantes/editar/:email',
    exigirCoordenadorOuAdministrador,
    async (req, res) => {
        const email = req.params.email;
        const { nome, telefone } = req.body;

        if (!nome?.trim()) {
            return res.status(400).send('O nome é obrigatório.');
        }

        try {
            const [ministrantes] = await db.execute(
                'SELECT email FROM ministrante WHERE email = ?',
                [email]
            );

            if (ministrantes.length === 0) {
                return res.status(404).send('Ministrante não encontrado.');
            }

            await db.execute(
                `UPDATE ministrante
                 SET nome = ?, telefone = ?
                 WHERE email = ?`,
                [
                    nome.trim(),
                    telefone?.trim() || null,
                    email
                ]
            );

            return res.redirect('/usuarios?mensagem=usuarioEditado');
        } catch (erro) {
            console.error('Erro ao editar ministrante:', erro);
            return res.status(500).send('Erro ao salvar a edição do ministrante.');
        }
    }
);

// ========================================
// CADASTRO DE USUÁRIO
// Somente coordenadores
// ========================================

router.post(
    '/usuarios/cadastrar',
    exigirCoordenador,
    async (req, res) => {
        const { nome, email, senha, telefone, cpf, tipo, siape } = req.body;

        const tiposPermitidos = [
            'coordenador',
            'bolsista',
            'administrador'
        ];

        if (!nome?.trim() || !email?.trim() || !senha || !tipo) {
            return res.status(400).send(
                'Preencha nome, e-mail, senha e tipo de usuário.'
            );
        }

        if (!tiposPermitidos.includes(tipo)) {
            return res.status(400).send('Tipo de usuário inválido.');
        }

        if (tipo === 'coordenador' && !siape?.trim()) {
            return res.status(400).send('Informe o SIAPE do coordenador.');
        }

        try {
            await db.execute(
                `INSERT INTO usuario
                    (email, nome, senha, telefone, CPF)
                 VALUES (?, ?, ?, ?, ?)`,
                [
                    email.trim(),
                    nome.trim(),
                    senha,
                    telefone?.trim() || null,
                    cpf?.trim() || null
                ]
            );

            if (tipo === 'coordenador') {
                await db.execute(
                    `INSERT INTO coordenador (email, SIAPE)
                     VALUES (?, ?)`,
                    [email.trim(), siape.trim()]
                );
            }

            if (tipo === 'bolsista') {
                await db.execute(
                    'INSERT INTO bolsista (email) VALUES (?)',
                    [email.trim()]
                );
            }

            if (tipo === 'administrador') {
                await db.execute(
                    'INSERT INTO administrador (email) VALUES (?)',
                    [email.trim()]
                );
            }

            return res.redirect('/usuarios?mensagem=usuarioCadastrado');
        } catch (erro) {
            console.error('Erro ao cadastrar usuário:', erro);

            if (erro.code === 'ER_DUP_ENTRY') {
                return res.status(409).send(
                    'Já existe um cadastro com esse e-mail ou SIAPE.'
                );
            }

            return res.redirect('/usuarios?mensagem=erro');
        }
    }
);

// ========================================
// CADASTRO DE MINISTRANTE
// Coordenadores e administradores
// ========================================

router.post(
    '/usuarios/ministrantes/cadastrar',
    exigirCoordenadorOuAdministrador,
    async (req, res) => {
        const { nome, email, telefone } = req.body;

        if (!nome?.trim() || !email?.trim()) {
            return res.status(400).send(
                'Preencha nome e e-mail do ministrante.'
            );
        }

        try {
            await db.execute(
                `INSERT INTO ministrante (email, nome, telefone)
                 VALUES (?, ?, ?)`,
                [
                    email.trim(),
                    nome.trim(),
                    telefone?.trim() || null
                ]
            );

            return res.redirect('/usuarios?mensagem=usuarioCadastrado');
        } catch (erro) {
            console.error('Erro ao cadastrar ministrante:', erro);

            if (erro.code === 'ER_DUP_ENTRY') {
                return res.status(409).send(
                    'Já existe um ministrante com esse e-mail.'
                );
            }

            return res.redirect('/usuarios?mensagem=erro');
        }
    }
);

// ========================================
// EXCLUIR USUÁRIO
// Somente coordenadores
// ========================================

router.post(
    '/usuarios/excluir/:email',
    exigirCoordenador,
    async (req, res) => {
        const email = req.params.email;

        try {
            const [encontrados] = await db.execute(
                'SELECT email FROM usuario WHERE email = ?',
                [email]
            );

            if (encontrados.length === 0) {
                return res.status(404).send('Usuário não encontrado.');
            }

            // Impede que o coordenador exclua a própria conta.
            if (req.session.usuario.email === email) {
                return res.status(403).send(
                    'Você não pode excluir a própria conta.'
                );
            }

            await db.beginTransaction();

            try {
                await db.execute(
                    'DELETE FROM administrador WHERE email = ?',
                    [email]
                );
                await db.execute(
                    'DELETE FROM coordenador WHERE email = ?',
                    [email]
                );
                await db.execute(
                    'DELETE FROM bolsista WHERE email = ?',
                    [email]
                );
                await db.execute(
                    'DELETE FROM usuario WHERE email = ?',
                    [email]
                );

                await db.commit();

                return res.redirect('/usuarios?mensagem=usuarioExcluido');
            } catch (erro) {
                await db.rollback();
                throw erro;
            }
        } catch (erro) {
            console.error('Erro ao excluir usuário:', erro);
            return res.status(500).send('Erro ao excluir usuário.');
        }
    }
);

// ========================================
// EXCLUIR MINISTRANTE
// Coordenadores e administradores
// ========================================


router.post(
    '/usuarios/ministrantes/excluir/:email',
    exigirCoordenadorOuAdministrador,
    async (req, res) => {
        const email = req.params.email;

        try {
            // Verifica se o ministrante existe
            const [ministrantes] = await db.execute(
                'SELECT email FROM ministrante WHERE email = ?',
                [email]
            );

            if (ministrantes.length === 0) {
                return res.status(404).send(
                    'Ministrante não encontrado.'
                );
            }

            // Verifica se existem oficinas vinculadas
            const [oficinas] = await db.execute(
                'SELECT 1 FROM oficina WHERE ministrante_email = ? LIMIT 1',
                [email]
            );

            if (oficinas.length > 0) {
                return res.status(409).send(
                    'Não é possível excluir este ministrante porque ele está vinculado a uma ou mais oficinas. Remova ou altere o vínculo com as oficinas antes de excluir o cadastro.'
                );
            }

            // Exclui somente se não houver oficinas vinculadas
            await db.execute(
                'DELETE FROM ministrante WHERE email = ?',
                [email]
            );

            return res.redirect('/usuarios?mensagem=usuarioExcluido');

        } catch (erro) {
            console.error('Erro ao excluir ministrante:', erro);

            return res.status(500).send(
                'Erro ao excluir ministrante.'
            );
        }
    }
);

export default router;
