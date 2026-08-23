import express from 'express';
import hbs from 'hbs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import db from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configuração de Views e Partials (Handlebars)
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.set('view options', { layout: 'layouts/main' });
hbs.registerPartials(path.join(__dirname, 'views/partials'));

// Middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true })); // Leitura de dados dos formulários HTML
app.use(express.json());

// --- ROTAS GET (Carregam as telas) ---

app.get('/', (req, res) => {
  res.render('paginaInicial');
});

app.get('/teste', (req, res) => {
  res.render('teste');
});

app.get('/login', (req, res) => {
  res.render('telaLogin', { layout: 'layouts/login' });
});

app.get('/inicioLogado', (req, res) => {
  res.render('pagInicialLogado', { layout: 'layouts/mainLogado' });
});

app.get('/cadastro', (req, res) => {
  res.render('telaCadastroB', { layout: 'layouts/mainLogado' });
});

app.get('/recuperar-senha', (req, res) => {
  res.render('telaRecuperarSenha', { layout: 'login' });
});

// --- ROTAS POST (Processam ações e formulários) ---

// Login de Usuários
app.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    const [usuarios] = await db.execute(
      'SELECT * FROM usuario WHERE email = ? AND senha = ?',
      [email, senha]
    );

    if (usuarios.length > 0) {
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

// Cadastro de Usuários
app.post('/cadastro', async (req, res) => {
  const { nome, email, senha, telefone, cpf } = req.body;

  try {
    const sql = 'INSERT INTO usuario (nome, email, senha, telefone, cpf) VALUES (?, ?, ?, ?, ?)';
    await db.execute(sql, [nome, email, senha, telefone, cpf]);

    res.redirect('/login');
  } catch (error) {
    console.error('Erro no cadastro:', error);
    res.status(500).send('Erro ao realizar o cadastro.');
  }
});

// Recuperação / Redefinição de Senha
app.post('/recuperar-senha', async (req, res) => {
  const { email, novaSenha } = req.body;

  try {
    const [resultado] = await db.execute(
      'UPDATE usuario SET senha = ? WHERE email = ?',
      [novaSenha, email]
    );

    if (resultado.affectedRows > 0) {
      res.render('telaLogin', {
        layout: 'layouts/login',
        mensagem: 'Senha alterada com sucesso! Faça login novamente.'
      });
    } else {
      res.render('telaRecuperarSenha', {
        layout: 'layouts/login',
        erro: 'E-mail não encontrado no sistema.'
      });
    }
  } catch (error) {
    console.error('Erro na redefinição de senha:', error);
    res.status(500).send('Erro ao atualizar a senha.');
  }
});

// --- SERVIDOR ---
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});