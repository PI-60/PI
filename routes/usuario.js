import express from 'express';
import db from '../database.js';
import { gerarHash, verificarSenha } from '../utils/senha.js';
import { enviarEmailRedefinicao } from '../utils/email.js';
import crypto from 'node:crypto';

const router = express.Router();

console.log('USUARIO.JS FOI CARREGADO');

// ============================
// ROTAS DE LOGIN
// ============================

router.get('/login', async (req, res) => {
    res.render('telaLogin', {
        layout: 'layouts/login',
        sucesso: req.query.mensagem === 'senhaAlterada' ? 'Senha alterada com sucesso! Entre com a nova senha.' : null
    });
});

router.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    try {
        // busca o usuário só pelo e-mail; a senha é conferida depois com o Argon2
        const [usuarios] = await db.execute(
            'SELECT * FROM usuario WHERE email = ?',
            [email]
        );

        let senhaCorreta = false;

        if (usuarios.length > 0) {
            const { valida, precisaAtualizar } = await verificarSenha(usuarios[0].senha, senha);
            senhaCorreta = valida;

            // cadastro antigo com senha em texto puro: troca pelo hash agora
            if (precisaAtualizar) {
                await db.execute(
                    'UPDATE usuario SET senha = ? WHERE email = ?',
                    [await gerarHash(senha), usuarios[0].email]
                );
            }
        }

        if (senhaCorreta) {
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

    // mesma mensagem existindo ou não o e-mail, para não revelar quem tem cadastro
    const mensagem = 'Se o e-mail estiver cadastrado, você receberá um link para redefinir a senha.';

    try {
        const [usuarios] = await db.execute(
            'SELECT email, nome FROM usuario WHERE email = ?',
            [email]
        );

        if (usuarios.length > 0) {
            // token aleatório que vai no link do e-mail
            const token = crypto.randomBytes(32).toString('hex');

            // no banco fica só o SHA-256 do token: quem ler o banco não consegue montar o link
            const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

            await db.execute(
                `UPDATE usuario
                 SET token_reset = ?, token_expira = DATE_ADD(NOW(), INTERVAL 30 MINUTE)
                 WHERE email = ?`,
                [tokenHash, usuarios[0].email]
            );

            const link = `${process.env.APP_URL}/redefinir-senha?token=${token}`;
            await enviarEmailRedefinicao(usuarios[0].email, usuarios[0].nome, link);
        }

        res.render('recuperacaoSenha', { layout: 'layouts/recuperacao', mensagem });
    } catch (error) {
        console.error('Erro na recuperação:', error);
        res.render('recuperacaoSenha', {
            layout: 'layouts/recuperacao',
            erro: 'Não foi possível enviar o e-mail agora. Tente novamente mais tarde.'
        });
    }
});

// ============================
// ROTAS DE REDEFINIÇÃO DE SENHA (link do e-mail)
// ============================

// procura o usuário dono de um token ainda dentro do prazo
async function buscarUsuarioPorToken(token) {
    if (!token) return null;

    // o banco guarda o SHA-256 do token, então compara com o SHA-256 do que veio no link
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const [usuarios] = await db.execute(
        'SELECT email, senha FROM usuario WHERE token_reset = ? AND token_expira > NOW()',
        [tokenHash]
    );

    return usuarios[0] || null;
}

router.get('/redefinir-senha', async (req, res) => {
    const { token } = req.query;

    try {
        const usuario = await buscarUsuarioPorToken(token);
        res.render('redefinirSenha', {
            layout: 'layouts/recuperacao',
            tokenValido: !!usuario,
            token
        });
    } catch (error) {
        console.error('Erro ao abrir redefinição:', error);
        res.status(500).send('Erro interno do servidor.');
    }
});

router.post('/redefinir-senha', async (req, res) => {
    const { token, novaSenha, confirmarSenha } = req.body;

    // mostra a tela de novo com uma mensagem de erro
    const voltarComErro = (erro) => res.render('redefinirSenha', {
        layout: 'layouts/recuperacao',
        tokenValido: true,
        token,
        erro
    });

    try {
        // confere o token de novo: ele pode ter expirado enquanto a pessoa digitava
        const usuario = await buscarUsuarioPorToken(token);
        if (!usuario) {
            return res.render('redefinirSenha', { layout: 'layouts/recuperacao', tokenValido: false });
        }

        if (!novaSenha || novaSenha.length < 6) {
            return voltarComErro('A senha precisa ter pelo menos 6 caracteres.');
        }

        if (novaSenha !== confirmarSenha) {
            return voltarComErro('As senhas não conferem.');
        }

        // não deixa usar a mesma senha de antes
        const { valida: mesmaSenha } = await verificarSenha(usuario.senha, novaSenha);
        if (mesmaSenha) {
            return voltarComErro('A nova senha não pode ser igual à anterior.');
        }

        // salva a nova senha (com hash) e apaga o token, para o link não funcionar de novo
        await db.execute(
            'UPDATE usuario SET senha = ?, token_reset = NULL, token_expira = NULL WHERE email = ?',
            [await gerarHash(novaSenha), usuario.email]
        );

        res.redirect('/login?mensagem=senhaAlterada');
    } catch (error) {
        console.error('Erro ao redefinir senha:', error);
        voltarComErro('Não foi possível salvar a nova senha. Tente novamente.');
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
            await db.execute(sql, [email, nome, await gerarHash(senha), telefone, cpf]);
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
            await db.execute(sql, [email, nome, await gerarHash(senha), telefone, cpf]);
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
        res.render('pagInicialLogado', { layout: 'layouts/mainLogado' });
    } else {
        res.redirect('/login');
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