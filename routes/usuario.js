
import express from 'express';
import db from '../database.js';

const router = express.Router();

console.log('USUARIO.JS FOI CARREGADO');

// ========================================
// FUNÇÃO PARA VERIFICAR PERMISSÕES
// ========================================

async function verificarPermissoes(email) {
    const [coordenadores] = await db.execute(
        'SELECT email FROM coordenador WHERE email = ?',
        [email]
    );

    const [administradores] = await db.execute(
        'SELECT email FROM administrador WHERE email = ?',
        [email]
    );

    return {
        ehCoordenador: coordenadores.length > 0,
        ehAdministrador: administradores.length > 0
    };
}

// ========================================
// ROTAS DE LOGIN
// ========================================

router.get('/login', async (req, res) => {
    res.render('telaLogin', {
        layout: 'layouts/login'
    });
});

router.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    try {
        const [usuarios] = await db.execute(
            'SELECT * FROM usuario WHERE email = ? AND senha = ?',
            [email, senha]
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

        return res.render('telaLogin', {
            layout: 'layouts/login',
            erro: 'E-mail ou senha incorretos!'
        });

    } catch (error) {
        console.error('Erro no login:', error);
        return res.status(500).send('Erro interno do servidor.');
    }
});

// ========================================
// ROTAS DE RECUPERAÇÃO DE SENHA
// ========================================

router.get('/recuperacao-senha', async (req, res) => {
    res.render('recuperacaoSenha', {
        layout: 'layouts/recuperacao'
    });
});

router.post('/recuperacao-senha', async (req, res) => {
    const { email } = req.body;

    try {
        const [usuarios] = await db.execute(
            'SELECT * FROM usuario WHERE email = ?',
            [email]
        );

        if (usuarios.length > 0) {
            return res.send(
                'E-mail encontrado! Agora vamos fazer a próxima etapa da recuperação.'
            );
        }

        return res.send('E-mail não encontrado no sistema.');

    } catch (error) {
        console.error('Erro na recuperação:', error);
        return res.status(500).send('Erro interno do servidor.');
    }
});

// ========================================
// ROTAS DE CADASTRO
// ========================================

// ABRIR TELA DE CADASTRO

router.get('/cadastro', async (req, res) => {
    if (!req.session.usuario) {
        return res.redirect('/login');
    }

    try {
        const email = req.session.usuario.email;
        const permissoes = await verificarPermissoes(email);

        // Somente coordenador ou administrador pode acessar
        if (!permissoes.ehCoordenador && !permissoes.ehAdministrador) {
            return res.redirect('/inicioLogado');
        }

        let participante = null;

        // Se recebeu um ID, busca os dados do participante
        if (req.query.id) {

            // Somente coordenador ou administrador pode editar participante
            const [resultado] = await db.execute(
                `SELECT idParticipante, nome, CPF, telefone
                 FROM participante
                 WHERE idParticipante = ?`,
                [req.query.id]
            );

            participante = resultado[0] || null;

            if (!participante) {
                return res.redirect('/participantes?mensagem=erro');
            }
        }

        return res.render('telaCadastroB', {
            layout: 'layouts/cadastro',
            participante,
            ehCoordenador: permissoes.ehCoordenador,
            ehAdministrador: permissoes.ehAdministrador
        });

    } catch (error) {
        console.error('Erro ao abrir cadastro:', error);
        return res.status(500).send('Erro ao carregar a página de cadastro.');
    }
});

// REALIZAR CADASTRO

router.post('/cadastro', async (req, res) => {

    if (!req.session.usuario) {
        return res.redirect('/login');
    }

    const {
        nome,
        email,
        cpf,
        telefone,
        tipo,
        senha,
        siape,
        idParticipante
    } = req.body;

    try {
        const emailLogado = req.session.usuario.email;
        const permissoes = await verificarPermissoes(emailLogado);

        const ehCoordenador = permissoes.ehCoordenador;
        const ehAdministrador = permissoes.ehAdministrador;

        // Impede que bolsistas realizem cadastros
        if (!ehCoordenador && !ehAdministrador) {
            return res.status(403).send(
                'Acesso negado. Você não tem permissão para cadastrar.'
            );
        }


// Define quais tipos cada perfil pode cadastrar
const tiposPermitidos = ehCoordenador
    ? ['participante', 'ministrante', 'bolsista', 'coordenador']
    : ehAdministrador
        ? ['participante', 'ministrante']
        : [];

// Bloqueia qualquer tipo não permitido
if (!tiposPermitidos.includes(tipo)) {
    return res.status(403).send(
        'Acesso negado. Você não tem permissão para cadastrar este tipo de usuário.'
    );
}


        // ========================================
        // EDIÇÃO DE PARTICIPANTE
        // ========================================

        if (idParticipante) {

            if (!ehCoordenador && !ehAdministrador) {
                return res.status(403).send('Acesso negado.');
            }

            const [resultado] = await db.execute(
                `UPDATE participante
                 SET nome = ?, CPF = ?, telefone = ?
                 WHERE idParticipante = ?`,
                [
                    nome,
                    cpf || null,
                    telefone || null,
                    idParticipante
                ]
            );

            if (resultado.affectedRows > 0) {
                return res.redirect(
                    '/participantes?mensagem=participanteEditado'
                );
            }

            return res.redirect('/participantes?mensagem=erro');
        }

        // ========================================
        // CADASTRO DE PARTICIPANTE
        // ========================================

        if (tipo === 'participante') {

            if (!ehCoordenador && !ehAdministrador) {
                return res.status(403).send('Acesso negado.');
            }

            await db.execute(
                `INSERT INTO participante (nome, cpf, telefone)
                 VALUES (?, ?, ?)`,
                [nome, cpf || null, telefone || null]
            );

            return res.redirect('/participantes?mensagem=participanteCadastrado');
        }

        // ========================================
        // CADASTRO DE MINISTRANTE
        // ========================================

        if (tipo === 'ministrante') {

            if (!ehCoordenador && !ehAdministrador) {
                return res.status(403).send('Acesso negado.');
            }

            await db.execute(
                `INSERT INTO ministrante (email, nome, telefone)
                 VALUES (?, ?, ?)`,
                [email, nome, telefone || null]
            );

            return res.redirect('/usuarios?mensagem=usuarioCadastrado');
        }

        // ========================================
        // CADASTRO DE BOLSISTA
        // ========================================

        if (tipo === 'bolsista') {

            // Somente coordenador pode cadastrar bolsista
            if (!ehCoordenador) {
                return res.status(403).send(
                    'Acesso negado. Somente coordenadores podem cadastrar bolsistas.'
                );
            }

            await db.execute(
                `INSERT INTO usuario (email, nome, senha, telefone, cpf)
                 VALUES (?, ?, ?, ?, ?)`,
                [email, nome, senha, telefone || null, cpf || null]
            );

            await db.execute(
                'INSERT INTO bolsista (email) VALUES (?)',
                [email]
            );

            return res.redirect('/usuarios?mensagem=usuarioCadastrado');
        }

        // ========================================
        // CADASTRO DE COORDENADOR
        // ========================================

        if (tipo === 'coordenador') {

            // Somente coordenador pode cadastrar outro coordenador
            if (!ehCoordenador) {
                return res.status(403).send(
                    'Acesso negado. Somente coordenadores podem cadastrar coordenadores.'
                );
            }

            await db.execute(
                `INSERT INTO usuario (email, nome, senha, telefone, cpf)
                 VALUES (?, ?, ?, ?, ?)`,
                [email, nome, senha, telefone || null, cpf || null]
            );

            await db.execute(
                'INSERT INTO coordenador (email, siape) VALUES (?, ?)',
                [email, siape]
            );

            return res.redirect('/usuarios?mensagem=usuarioCadastrado');
        }

        // ========================================
        // TIPO DE CADASTRO INVÁLIDO
        // ========================================

        return res.redirect('/usuarios?mensagem=erro');

    } catch (error) {
        console.error('Erro ao realizar cadastro:', error);
        return res.redirect('/usuarios?mensagem=erro');
    }
});

// ========================================
// ROTAS DE DASHBOARD DE USUÁRIO
// ========================================

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

        return res.redirect('/login');
    });
});

export default router;
