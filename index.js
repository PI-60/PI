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
 
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000')
})