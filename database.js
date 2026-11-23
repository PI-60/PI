import 'dotenv/config';
import mysql from  'mysql2/promise'; //permite que o Node.js converse com o MySQL

// As configurações podem vir do .env (os testes E2E usam um banco separado).
// Sem .env, continua usando os mesmos valores de antes.
const db = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'pi.2026',
    database: process.env.DB_NAME || 'ifsc60'
});

console.log(`Conectado ao banco de dados ${process.env.DB_NAME || 'ifsc60'}!`);

export default db;  // isponibiliza essa conexão para outros arquivos.
