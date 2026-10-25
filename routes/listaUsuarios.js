
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
// ABRIR FORMULÁRIO DE EDIÇÃO DE USUÁRIO
// Somente coordenadores
// ========================================


router.get(
    '/usuarios/editar/:email',
    exigirCoordenador,
    async (req, res) => {
        try {
            const emailOriginal = req.params.email;

            // Primeiro, procura na tabela de usuários
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
                [emailOriginal]
            );

            if (usuarios.length > 0) {
                return res.render('telaCadastroB', {
                    layout: 'layouts/cadastro',
                    usuario: usuarios[0],
                    editandoUsuario: true
                });
            }

            // Se não encontrou, procura na tabela de ministrantes
            const [ministrantes] = await db.execute(
                `SELECT email, nome, telefone
                 FROM ministrante
                 WHERE email = ?`,
                [emailOriginal]
            );

            if (ministrantes.length > 0) {
                return res.render('telaCadastroB', {
                    layout: 'layouts/cadastro',
                    usuario: {
                        ...ministrantes[0],
                        tipo: 'ministrante',
                        CPF: null
                    },
                    editandoUsuario: true
                });
            }

            return res.status(404).send('Usuário não encontrado.');
        } catch (erro) {
            console.error('Erro ao abrir edição:', erro);
            return res.status(500).send(
                'Erro ao abrir a edição do usuário.'
            );
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
        const emailOriginal = req.params.email;
        const { nome, telefone, cpf } = req.body;

        if (!nome?.trim()) {
            return res.status(400).send(
                'O nome é obrigatório.'
            );
        }

        try {
            // Verifica se o cadastro existe na tabela usuario
            const [usuarios] = await db.execute(
                'SELECT email FROM usuario WHERE email = ?',
                [emailOriginal]
            );

            if (usuarios.length > 0) {
                await db.execute(
                    `UPDATE usuario
                     SET nome = ?, telefone = ?, CPF = ?
                     WHERE email = ?`,
                    [
                        nome.trim(),
                        telefone?.trim() || null,
                        cpf?.trim() || null,
                        emailOriginal
                    ]
                );

                return res.redirect('/usuarios');
            }

            // Se não for usuário, verifica se é ministrante
            const [ministrantes] = await db.execute(
                'SELECT email FROM ministrante WHERE email = ?',
                [emailOriginal]
            );

            if (ministrantes.length > 0) {
                await db.execute(
                    `UPDATE ministrante
                     SET nome = ?, telefone = ?
                     WHERE email = ?`,
                    [
                        nome.trim(),
                        telefone?.trim() || null,
                        emailOriginal
                    ]
                );

                return res.redirect('/usuarios');
            }

            return res.status(404).send(
                'Usuário não encontrado.'
            );
        } catch (erro) {
            console.error('Erro ao editar usuário:', erro);
            return res.status(500).send(
                'Erro ao salvar as alterações.'
            );
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
            return res.status(400).send(
                'Informe o SIAPE do coordenador.'
            );
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

            return res.redirect('/usuarios');
        } catch (erro) {
            console.error('Erro ao cadastrar usuário:', erro);

            if (erro.code === 'ER_DUP_ENTRY') {
                return res.status(409).send(
                    'Já existe um cadastro com esse e-mail ou SIAPE.'
                );
            }

            return res.status(500).send('Erro ao cadastrar usuário.');
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

            return res.status(500).send('Erro ao cadastrar ministrante.');
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

        if (req.session.usuario.email === email) {
            return res.status(400).send(
                'Você não pode excluir sua própria conta.'
            );
        }

        try {
            const [encontrados] = await db.execute(
                'SELECT email FROM usuario WHERE email = ?',
                [email]
            );

            if (encontrados.length === 0) {
                return res.status(404).send('Usuário não encontrado.');
            }

            await db.beginTransaction();

            try {
                await db.execute(
                    'DELETE FROM administrador WHERE email = ?', [email]
                );
                await db.execute(
                    'DELETE FROM coordenador WHERE email = ?', [email]
                );
                await db.execute(
                    'DELETE FROM bolsista WHERE email = ?', [email]
                );
                await db.execute(
                    'DELETE FROM usuario WHERE email = ?', [email]
                );

                await db.commit();
                return res.redirect('/usuarios');
            } catch (erro) {
                await db.rollback();
                throw erro;
            }
        } catch (erro) {
            console.error('Erro ao excluir usuário:', erro);

            if (!res.headersSent) {
                return res.status(500).send(
                    'Erro ao excluir usuário. Verifique se existem registros vinculados.'
                );
            }
        }
    }
);

// ========================================
// EXCLUIR MINISTRANTE
// Somente administradores
// ========================================

router.post(
    '/usuarios/ministrantes/excluir/:email',
    exigirAdministrador,
    async (req, res) => {
        const email = req.params.email;

        try {
            const [resultado] = await db.execute(
                'DELETE FROM ministrante WHERE email = ?',
                [email]
            );

            if (resultado.affectedRows === 0) {
                return res.status(404).send(
                    'Ministrante não encontrado.'
                );
            }

            return res.redirect('/usuarios');
        } catch (erro) {
            console.error('Erro ao excluir ministrante:', erro);
            return res.status(500).send('Erro ao excluir ministrante.');
        }
    }
);



export default router;
