
import express from 'express';
import db from '../database.js';

import {
    exigirLogin,
    exigirCoordenador,
    exigirAdministrador
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

        res.render('telaUsuario', {
            layout: 'layouts/mainLogado',
            usuarios
        });
    } catch (erro) {
        console.error('Erro ao listar usuários:', erro);
        res.status(500).send('Erro ao carregar a lista de usuários.');
    }
});

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
            return res.status(400).send(
                'Informe o SIAPE do coordenador.'
            );
        }

        let conexao;

        try {
            conexao = await db.getConnection();
            await conexao.beginTransaction();

            await conexao.execute(
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
                await conexao.execute(
                    `INSERT INTO coordenador (email, SIAPE)
                     VALUES (?, ?)`,
                    [email.trim(), siape.trim()]
                );
            }

            if (tipo === 'bolsista') {
                await conexao.execute(
                    'INSERT INTO bolsista (email) VALUES (?)',
                    [email.trim()]
                );
            }

            if (tipo === 'administrador') {
                await conexao.execute(
                    'INSERT INTO administrador (email) VALUES (?)',
                    [email.trim()]
                );
            }

            await conexao.commit();

            return res.redirect('/usuarios');

        } catch (erro) {
            if (conexao) {
                await conexao.rollback();
            }

            console.error('Erro ao cadastrar usuário:', erro);

            if (erro.code === 'ER_DUP_ENTRY') {
                return res.status(409).send(
                    'Já existe um cadastro com esse e-mail ou SIAPE.'
                );
            }

            return res.status(500).send(
                'Erro ao cadastrar usuário.'
            );
        } finally {
            if (conexao) {
                conexao.release();
            }
        }
    }
);

// ========================================
// CADASTRO DE MINISTRANTE
// Somente administradores
// ========================================

router.post(
    '/usuarios/ministrantes/cadastrar',
    exigirAdministrador,
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

            return res.redirect('/usuarios');

        } catch (erro) {
            console.error('Erro ao cadastrar ministrante:', erro);

            if (erro.code === 'ER_DUP_ENTRY') {
                return res.status(409).send(
                    'Já existe um ministrante com esse e-mail.'
                );
            }

            return res.status(500).send(
                'Erro ao cadastrar ministrante.'
            );
        }
    }
);

export default router;
