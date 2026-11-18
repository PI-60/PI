import express from 'express';
import db from '../database.js';
import {
    exigirCoordenador,
    exigirCoordenadorOuAdministrador
} from '../middleware/permissoes.js';

const router = express.Router();



console.log('USUARIO.JS FOI CARREGADO');




// ========================================
// ROTAS DE LOGINN
// ========================================
router.post('/usuarios/:tipo/:email/desativar', async (req, res) => {
    try {
        if (!req.session.usuario) {
            return res.status(401).send('Faça login novamente.');
        }

        const emailLogado = req.session.usuario.email;
        const { tipo, email } = req.params;

        if (tipo !== 'usuario' && tipo !== 'ministrante') {
            return res.status(400).send('Tipo inválido.');
        }

        if (tipo === 'usuario') {
            const [coordenadores] = await db.execute(
                'SELECT email FROM coordenador WHERE email = ?',
                [emailLogado]
            );

            if (coordenadores.length === 0) {
                return res.status(403).send('Apenas coordenadores podem alterar usuários.');
            }
        } else {
            const [coordenadores] = await db.execute(
                'SELECT email FROM coordenador WHERE email = ?',
                [emailLogado]
            );

            const [administradores] = await db.execute(
                'SELECT email FROM administrador WHERE email = ?',
                [emailLogado]
            );

            if (coordenadores.length === 0 && administradores.length === 0) {
                return res.status(403).send('Acesso negado.');
            }
        }

        if (email === emailLogado) {
            return res.status(403).send(
                'Você não pode desativar sua própria conta.'
            );
        }

        const tabela = tipo === 'usuario' ? 'usuario' : 'ministrante';

        const [resultado] = await db.execute(
            `UPDATE ${tabela} SET ativo = FALSE WHERE email = ?`,
            [email]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).send('Usuário não encontrado.');
        }

        return res.redirect('/usuarios?mensagem=usuarioDesativado');

    } catch (error) {
        console.error('Erro ao desativar usuário:', error);
        return res.status(500).send('Erro ao desativar usuário.');
    }
});


// ========================================
// REATIVAR USUÁRIOS
// ========================================
router.post('/usuarios/:tipo/:email/reativar', async (req, res) => {
    try {
        if (!req.session.usuario) {
            return res.status(401).send('Faça login novamente.');
        }

        const emailLogado = req.session.usuario.email;
        const { tipo, email } = req.params;

        if (tipo !== 'usuario' && tipo !== 'ministrante') {
            return res.status(400).send('Tipo inválido.');
        }

        if (tipo === 'usuario') {
            const [coordenadores] = await db.execute(
                'SELECT email FROM coordenador WHERE email = ?',
                [emailLogado]
            );

            if (coordenadores.length === 0) {
                return res.status(403).send('Apenas coordenadores podem alterar usuários.');
            }
        } else {
            const [coordenadores] = await db.execute(
                'SELECT email FROM coordenador WHERE email = ?',
                [emailLogado]
            );

            const [administradores] = await db.execute(
                'SELECT email FROM administrador WHERE email = ?',
                [emailLogado]
            );

            if (coordenadores.length === 0 && administradores.length === 0) {
                return res.status(403).send('Acesso negado.');
            }
        }

        const tabela = tipo === 'usuario' ? 'usuario' : 'ministrante';

        const [resultado] = await db.execute(
            `UPDATE ${tabela} SET ativo = TRUE WHERE email = ?`,
            [email]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).send('Usuário não encontrado.');
        }

        return res.redirect('/usuarios?mensagem=usuarioReativado');

    } catch (error) {
        console.error('Erro ao reativar usuário:', error);
        return res.status(500).send('Erro ao reativar usuário.');
    }
});

router.get('/login', async (req, res) => {
    res.render('telaLogin', { layout: 'layouts/login' });
});

router.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    try {
        const [usuarios] = await db.execute(
    `SELECT * FROM usuario
     WHERE email = ?
     AND senha = ?
     AND ativo = TRUE`,
    [email, senha]
            // procura no banco de dados se existe esse usuario que tenha esse e-mail e essa senha
        );

        if (usuarios.length > 0) {

            const emailUsuario = usuarios[0].email;

            // ve se o usuário é coordenador
            const [coordenadores] = await db.execute(
                'SELECT email FROM coordenador WHERE email = ?',
                [emailUsuario]
            );

            // salva os dados na sessão
            req.session.usuario = {
                nome: usuarios[0].nome,
                email: usuarios[0].email,
                tipo: coordenadores.length > 0 ? 'coordenador' : 'usuario'
            };
            
            res.redirect('/inicioLogado');
        } else {
            res.render('telaLogin', {
                layout: 'layouts/login',
                erro: 'E-mail ou senha incorretos!'
            });
        }
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).send('Erro interno do servidor.');
    }
});

// ============================
// ROTAS DE RECUPERAÇÃO DE SENHA
// ============================

router.get('/recuperacao-senha', async (req, res) => {
    res.render('recuperacaoSenha', { layout: 'layouts/recuperacao' });
});

router.post('/recuperacao-senha', async (req, res) => {
    const { email } = req.body;

    console.log('E-mail informado:', email);

    try {
        const [usuarios] = await db.execute(
            'SELECT * FROM usuario WHERE email = ?',
            [email]
        );

        if (usuarios.length > 0) {
            res.send('E-mail encontrado! Agora vamos fazer a próxima etapa da recuperação.');
        } else {
            res.send('E-mail não encontrado no sistema.');
        }
    } catch (error) {
        console.error('Erro na recuperação:', error);
        res.status(500).send('Erro interno do servidor.');
    }
});

// ============================
// ROTAS DE CADASTRO
// ============================

router.get('/cadastro', async (req, res) => {
    // Verifica se o usuário está logado
    if (req.session.usuario) {
        // Faz a consulta para verificar se é um coordenador (utilizando o email do usuário logado)
        const [usuario] = await db.execute(
            'SELECT * FROM coordenador WHERE email = ?',
            [req.session.usuario.email]
        );

        // se encontrou, carrega a página
        if (usuario.length > 0) {
            let participante = null;

            // se veio um id (botão de editar da lista), busca o participante para preencher o formulário
            if (req.query.id) {
                const [resultado] = await db.execute(
                    'SELECT idParticipante, nome, CPF, telefone FROM participante WHERE idParticipante = ?',
                    [req.query.id]
                );
                participante = resultado[0] || null;
            }

            res.render('telaCadastroB', { layout: 'layouts/cadastro', participante });
        } else {
            // faz o redirect caso não possa acessar
            res.redirect('/inicioLogado'); 
        }
    } else {
        // caso não esteja logado
        res.redirect('/login');
    }
});

router.post('/cadastro', async (req, res) => {
    const { nome, email, cpf, telefone, tipo, senha, siape, idParticipante } = req.body;

    console.log(req.body);

    try {
        let sql;

        // MINISTRANTE
        if (tipo == 'ministrante') {
            sql = 'INSERT INTO ministrante (email, nome, telefone) VALUES (?, ?, ?)';
            await db.execute(sql, [email, nome, telefone]);
        }

        // BOLSISTA
        if (tipo == 'bolsista') {
            sql = 'INSERT INTO usuario (email, nome, senha, telefone, cpf) VALUES (?, ?, ?, ?, ?)';
            await db.execute(sql, [email, nome, senha, telefone, cpf]);
            sql = 'INSERT INTO bolsista (email) VALUES (?)';
            await db.execute(sql, [email]);
        }

        // EDIÇÃO DE PARTICIPANTE (veio com id) - sempre atualiza, o tipo não pode ser trocado
            if (idParticipante) {
                try {
                    const [resultado] = await db.execute(
                        `UPDATE participante
                        SET nome = ?, cpf = ?, telefone = ?
                        WHERE idParticipante = ?`,
                        [nome, cpf || null, telefone || null, idParticipante]
                    );

                    // verifica se algum participante foi atualizado
                    if (resultado.affectedRows > 0) {
                        return res.redirect('/participantes?mensagem=participanteEditado');
                        
                    } else {
                        return res.redirect('/participantes?mensagem=erro');
                    }

                } catch (error) {
                    console.error('Erro ao editar participante:', error);
                    return res.redirect('/participantes?mensagem=erro');
                }
            }

        // PARTICIPANTE
        if (tipo == 'participante') {
            sql = 'INSERT INTO participante (nome, cpf, telefone) VALUES (?, ?, ?)';
            await db.execute(sql, [nome, cpf, telefone]);
        }

        // COORDENADOR
        if (tipo == 'coordenador') {
            sql = 'INSERT INTO usuario (email, nome, senha, telefone, cpf) VALUES (?, ?, ?, ?, ?)';
            await db.execute(sql, [email, nome, senha, telefone, cpf]);
            sql = 'INSERT INTO coordenador (email, siape) VALUES (?, ?)';
            await db.execute(sql, [email, siape]);
        }

       return res.redirect('/usuarios?mensagem=usuarioCadastrado');
    } catch (error) {
         return res.redirect('/usuarios?mensagem=erro');
    }
});

// ============================
// ROTAS DE DASHBOARD DE USUÁRIO
// ============================

router.get('/inicioLogado', (req, res) => {

    if (req.session.usuario) {

        res.render('pagInicialLogado', {
            layout: 'layouts/mainLogado',
            mensagem: req.query.desistencia
        });

    } else {
        res.redirect('/login');
    }

});

    // ==========================================
    // DESISTÊNCIA DA COORDENAÇÃO
    // ==========================================

    router.post('/coordenador/desistir', async (req, res) => {

        // ve se existe alguém logado
        if (!req.session.usuario) {
            return res.redirect('/login');
        }

        const email = req.session.usuario.email;

        let transacaoIniciada = false;

        try {

            // comeca transação no banco
            await db.beginTransaction();
            transacaoIniciada = true;

            // ve se o usuário é coordenador
            const [coordenadores] = await db.execute(
                'SELECT email FROM coordenador WHERE email = ?',
                [email]
            );

            if (coordenadores.length === 0) {
                await db.rollback();
                transacaoIniciada = false;

                return res.redirect('/inicioLogado');
            }

            // busca os coordenadores cadastrados
            const [todosCoordenadores] = await db.execute(
                'SELECT email FROM coordenador FOR UPDATE'
            );

            // impede que o coordenador desista quando só tem um
            if (todosCoordenadores.length <= 1) {

                await db.rollback();
                transacaoIniciada = false;

                return res.redirect('/inicioLogado?desistencia=ultimo');
            }

            // tira o usuário da tabela coordenador
            await db.execute(
                'DELETE FROM coordenador WHERE email = ?',
                [email]
            );

            // add o usuário na tabela administrador
            await db.execute(
                'INSERT INTO administrador (email) VALUES (?)',
                [email]
            );

            // Confirma as alterações no banco
            await db.commit();
            transacaoIniciada = false;

            // atualiza o tipo de usuário na sessão
            req.session.usuario.tipo = 'administrador';

            console.log('Coordenador desistiu da função:', email);

            return res.redirect('/inicioLogado?desistencia=sucesso');

        } catch (error) {

            if (transacaoIniciada) {
                await db.rollback();
            }

            console.error('Erro ao desistir da coordenação:', error);

            return res.redirect('/inicioLogado?desistencia=erro');
        }

    });
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Erro ao deslogar:', err);
            return res.status(500).send('Erro ao deslogar');
        }

        res.redirect('/login');
    });
});

export default router;