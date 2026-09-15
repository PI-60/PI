
// criar o servidor e trabalhar com rotas.  

import express from 'express';
import hbs from 'hbs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import db from './database.js'; //pega a conexão com o banco que eu configurei no database.js
import session from 'express-session';

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

app.get('/teste', async (req, res) => {
  res.render('teste');
});

app.get('/login', async (req, res) => {
  res.render('telaLogin', { layout: 'layouts/login' }); 
}); 

// Altere para /recuperacao-senha no seu index.js:
app.get('/recuperacao-senha', async (req, res) => {
  res.render('recuperacaoSenha', { layout: "layouts/recuperacao"});
}); 
app.get('/inicioLogado', (req, res) => {

  if(req.session.usuario)
  {

    res.render('pagInicialLogado', { layout: 'layouts/mainLogado' });
  }
  else{
    res.redirect("/login");
  }

});

app.get('/cadastro', async (req, res) => {
  // Verifica se o usuário está logado
  if(req.session.usuario)
  {
    // Faço a consulta para verificar se é um coordenador (utilizando o email do usuário logado)
    const [coordenador] = await db.execute(
      'SELECT * FROM coordenador WHERE email = ?',
      [req.session.usuario.email]
    );
    // se encontrou carrega a página
    if (coordenador.length > 0){
      res.render('telaCadastroB', { layout: 'layouts/cadastro' });
    }
    else{
      // faz o redirect caso não possa acessar
      res.redirect("/inicioLogado");
    }
  }
  else{
    // caso não esteja logado
    res.redirect("/login");
  }
});

app.get('/frequencia', async (req, res) => {
  try {
    const [participantes] = await db.execute(
      'SELECT idParticipante, nome FROM participante'
    );

    console.log('PARTICIPANTES:', participantes);

    res.render('telaFrequencia', {
      layout: 'layouts/mainLogado',
      participantes: participantes
    });

  } catch (error) {
    console.error('ERRO:', error);
    res.status(500).send('Erro ao carregar participantes.');
  }
});


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






// rotas  POST: cria uma rota que recebe dadosdoss formulários  enviados através de POST  ---


// Login de Usuários
app.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    const [usuarios] = await db.execute(
      'SELECT * FROM usuario WHERE email = ? AND senha = ?',
      [email, senha]
      // procura no banco de dados se existe esse usuario  que tenha esse e-mail e essa senha 
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

// ROTA SESSAO
/* app.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    const [usuarios] = await db.execute(
      'SELECT * FROM usuario WHERE email = ? AND senha = ?',
      [email, senha]
    );

    if (usuarios.length > 0) {

      // Salva o usuário na sessão
      req.session.usuario = {
        id: usuarios[0].id,
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
 */

// Cadastro de Usuários
app.post('/cadastro', async (req, res) => {
  const { nome, email, cpf, telefone, tipo, senha, siape } = req.body;

  console.log(req.body);

  try {

    let sql;

    // MINIRANTE

    if(tipo == "ministrante"){
      sql = 'INSERT INTO ministrante (email, nome, telefone) VALUES (?, ?, ?)';
      await db.execute(sql, [email, nome, telefone]);
    }

    // BOLSISTA
    if(tipo == "bolsista"){
      sql = 'INSERT INTO usuario (email, nome, senha, telefone, cpf) VALUES (?, ?, ?, ?, ?)';
      await db.execute(sql, [email, nome, senha, telefone, cpf]);
      sql = 'INSERT INTO bolsista (email) VALUES (?)';
      await db.execute(sql, [email]);
    }

    // PARTICIPANTE
    if(tipo == "participante"){
      sql = 'INSERT INTO participante (nome, cpf, telefone) VALUES (?, ?, ?)';
      await db.execute(sql, [nome, cpf, telefone]);
    }

    //COORDENADOR
    if(tipo == "coordenador"){
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