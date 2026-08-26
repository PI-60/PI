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

// Altere para /recuperacao-senha no seu index.js:
app.get('/recuperacao-senha', (req, res) => {
  res.render('recuperacaoSenha', );
}); 
app.get('/inicioLogado', (req, res) => {
  res.render('pagInicialLogado', { layout: 'layouts/mainLogado' });
});

app.get('/cadastro', (req, res) => {
  res.render('telaCadastroB', { layout: 'layouts/mainLogado' });
});



app.get('/atividades', (req, res) => {
  res.render("telaAtividades", {
    layout: false,
    atividades: [
      { titulo: 'Festa Junina 60+', tipo: 'Evento', status: 'Em andamento', statusClasse: 'andamento', cor: 'roxo', data: '22/07/2026', duracao: '14h', local: 'IFSC GASPAR' },
      { titulo: 'Oficina de Informática', tipo: 'Oficina', status: 'Concluído', statusClasse: 'concluido', cor: 'amarelo', data: '22/04/2026', duracao: '14h', local: 'IFSC GASPAR' },
      { titulo: 'Oficina de fotografia', tipo: 'Oficina', status: 'Em andamento', statusClasse: 'andamento', cor: 'vermelho', data: '02/07/2026', duracao: '14h', local: 'IFSC GASPAR' },
      { titulo: 'Nome oficina 1', tipo: 'Oficina', status: 'Concluído', statusClasse: 'concluido', cor: 'azul', data: '00/00/0000', duracao: '14h', local: 'IFSC GASPAR' },
      { titulo: 'Nome oficina 2', tipo: 'Oficina', status: 'Em andamento', statusClasse: 'andamento', cor: 'verde', data: '02/07/2026', duracao: '14h', local: 'IFSC GASPAR' },
      { titulo: 'Nome oficina 3', tipo: 'Oficina', status: 'Concluído', statusClasse: 'concluido', cor: 'laranja', data: '00/00/0000', duracao: '14h', local: 'IFSC GASPAR' },
    ]
  })
})



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
app.post('/recuperacao-senha', async (req, res) => {
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

// --- SERVIDOR ---
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});