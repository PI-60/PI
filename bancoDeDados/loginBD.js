const db = require('./db');

async function realizarLogin(email, senha) {
    try {
        // 1. Verifica se o usuário existe e a senha está correta
        const queryUsuario = 'SELECT email, nome FROM usuario WHERE email = ? AND senha = ?';
        const [usuarios] = await db.execute(queryUsuario, [email, senha]);

        if (usuarios.length === 0) {
            return { sucesso: false, mensagem: 'E-mail ou senha incorretos.' };
        }

        const usuario = usuarios[0];

        // 2. Identifica o papel (role) do usuário no sistema
        let papel = 'usuario_comum';
        
        const [coordenador] = await db.execute('SELECT email FROM coordenador WHERE email = ?', [email]);
        if (coordenador.length > 0) {
            papel = 'coordenador';
        } else {
            const [bolsista] = await db.execute('SELECT email FROM bolsista WHERE email = ?', [email]);
            if (bolsista.length > 0) {
                papel = 'bolsista';
            }
        }

        return {
            sucesso: true,
            mensagem: 'Login realizado com sucesso!',
            usuario: {
                nome: usuario.nome,
                email: usuario.email,
                papel: papel
            }
        };

    } catch (erro) {
        console.error('Erro ao realizar login:', erro);
        throw erro;
    }
}

module.exports = { realizarLogin };
