import express from 'express'

const app = express()

app.set('view engine', 'hbs');

app.get('/', (req, res) => {
  res.render("pagina")
})

app.get('/teste', (req, res) => {
  res.render("teste")
})

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000')
})