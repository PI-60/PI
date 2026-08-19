const express = require('express');
const mysql = require('mysql2');
const db = require('./conexaoBD');
const app = express();

app.use(express.json());
app.use(express.static('public'));

// Rota para processar o login
app.post('/api/login', async (req, res) => {
    const { email, senha } = req.body;

    try {
        const query = 'SELECT email, nome FROM usuario WHERE email = ? AND senha = ?';
        const [linhas] = await db.execute(query, [email, senha]);

        if (linhas.length > 0) {
            const usuario = linhas[0];
            return res.json({
                sucesso: true,
                usuario: {
                    nome: usuario.nome,
                    email: usuario.email,
                    papel: 'usuario'
                }
            });
        } else {
            return res.status(401).json({
                sucesso: false,
                mensagem: 'E-mail ou senha incorretos.'
            });
        }
    } catch (erro) {
        console.error('Erro no servidor:', erro);
        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno no servidor.'
        });
    }
});

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));
