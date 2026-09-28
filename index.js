
// criar o servidor e trabalhar com rotas.  

import express from 'express';
import hbs from 'hbs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import db from './database.js'; //pega a conexão com o banco que eu configurei no database.js
import session from 'express-session';

import partRoutes from './routes/participante.js';
import userRoutes from './routes/usuario.js';

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

// --- rotas get  (c  arregam as telas) ---

app.get('/', async (req, res) => {
  res.render('paginaInicial');
});


// Rota de Atividades
app.get('/atividades', async (req, res) => {
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

// Usa os arquivos externos para configurar as rotas
app.use('/', userRoutes);
app.use('/', partRoutes);


// --- SERVIDOR ---
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});