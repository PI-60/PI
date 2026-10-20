
// criar o servidor e trabalhar com rotas.  

import express from 'express';
import hbs from 'hbs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import db from './database.js'; //pega a conexão com o banco que eu configurei no database.js
import session from 'express-session';

import partRoutes from './routes/participante.js';
import userRoutes from './routes/usuario.js';
import atividadeRoutes from './routes/atividade.js'



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//criando meu servido
const app = express();

app.use(session({
  secret: 'chave-secreta-do-projeto',
  resave: false,
  saveUninitialized: false
}));

// Configuração de Views e Partials (Handlebars)
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.set('view options', { layout: 'layouts/main' });
hbs.registerPartials(path.join(__dirname, 'views/partials'));

// Middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true })); // permite que o Express consiga interpretar os dados enviados por formulários HTML
// sem isso o req.body poderia não pegar direito
app.use(express.json());

// deixa o usuário logado (e a inicial do nome) disponível em todas as views
app.use((req, res, next) => {
  const usuario = req.session.usuario;
  res.locals.usuario = usuario;
  res.locals.inicialUsuario = usuario && usuario.nome ? usuario.nome.trim().charAt(0).toUpperCase() : '';
  next();
});

// --- rotas get  (c  arregam as telas) ---

app.get('/', async (req, res) => {
  res.render('paginaInicial');
});


// Usa os arquivos externos para configurar as rotas
app.use('/', userRoutes);
app.use('/', partRoutes);
app.use('/', atividadeRoutes);

// --- SERVIDOR ---
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});