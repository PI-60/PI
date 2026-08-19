const express = require('express');
const path = require('path');
const { realizarLogin } = require('./login'); // Certifique-se de que o Arquivo 3 se chama login.js

const app = express();

// Configuração do Handlebars (HBS)
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares obrigatórios
app.use(express.json()); // Permite ler JSON enviado pelo fetch
app.use(express.urlencoded({ extended: true })); // Permite ler dados de formulários padrão
app.use(express.static(path.join(__dirname, 'public'))); // Pasta para seus arquivos CSS/JS do front-end

// Rota para renderizar a página de login
app.get('/login', (req, res) => {
    res.render('login'); // Vai renderizar o arquivo views/login.hbs
});

// Rota da API que o seu Fetch vai chamar
app.post('/api/login', async (req, res) => {
    const { email, senha } = req.body;

    try {
        // Chama a função do seu Arquivo 3
        const resultado = await realizarLogin(email, senha);
        
        if (resultado.sucesso) {
            return res.status(200).json(resultado);
        } else {
            // Retorna 401 (Não autorizado) com a mensagem do banco
            return res.status(401).json(resultado);
        }
    } catch (erro) {
        return res.status(500).json({ sucesso: false, mensagem: 'Erro interno no servidor.' });
    }
});

// Inicia o servidor na porta 3000
app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});
