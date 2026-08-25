import express from 'express'
import hbs from 'hbs'
import path from 'node:path';
 
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
 
const app = express()
 
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.set('view options', { layout: 'layouts/main' }); // layout padrão pra todas as rotas
 
// Registra a pasta de partials (header.hbs, footer.hbs, etc.)
hbs.registerPartials(path.join(__dirname, 'views/partials'));
 
app.use(express.static(path.join(__dirname, 'public')));
 
app.get('/', (req, res) => {
  res.render("paginaInicial")
})
 
app.get('/teste', (req, res) => {
  res.render("teste")
})
app.get('/login', (req, res) => {
  res.render("telaLogin", { layout: 'layouts/login' })
})

app.get('/inicioLogado', (req, res) => {
  res.render("pagInicialLogado", { layout: 'layouts/mainLogado' })
})

app.get('/cadastro', (req, res) => {
  res.render("telaCadastroB", { layout: 'layouts/mainLogado' })
})

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

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000')
})