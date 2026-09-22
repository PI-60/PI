import express from 'express';
import db from '../database.js'; // ajuste o caminho conforme a localização do seu módulo de conexão com o banco

const router = express.Router();

// ============================
// ROTAS DE LOGIN
// ============================

router.get('/login', async (req, res) => {
    res.render('telaLogin', { layout: 'layouts/login' });
});

router.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    try {
        const [usuarios] = await db.execute(
            'SELECT * FROM usuario WHERE email = ? AND senha = ?',
            [email, senha]
            // procura no banco de dados se existe esse usuario que tenha esse e-mail e essa senha
        );

        if (usuarios.length > 0) {
            // Salva o usuário na sessão
            req.session.usuario = {
                nome: usuarios[0].nome,
                email: usuarios[0].email
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
        const [coordenador] = await db.execute(
            'SELECT * FROM coordenador WHERE email = ?',
            [req.session.usuario.email]
        );

        // se encontrou, carrega a página
        if (coordenador.length > 0) {
            res.render('telaCadastroB', { layout: 'layouts/cadastro' });
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
    const { nome, email, cpf, telefone, tipo, senha, siape } = req.body;

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

        res.redirect('/login');
    } catch (error) {
        console.error('Erro no cadastro:', error);
        res.status(500).send('Erro ao realizar o cadastro.');
    }
});

// ============================
// ROTAS DE DASHBOARD DE USUÁRIO
// ============================

router.get('/inicioLogado', (req, res) => {
    if (req.session.usuario) {
        res.render('pagInicialLogado', { layout: 'layouts/mainLogado' });
    } else {
        res.redirect('/login');
    }
});

export default router;