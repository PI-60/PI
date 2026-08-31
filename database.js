import mysql from  'mysql2/promise'; //permite que o Node.js converse com o MySQL

const db = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'pi.2026', 
    database: 'ifsc60'
    
});

console.log('Conectado ao banco de dados ifsc60!');

export default db;  // isponibiliza essa conexão para outros arquivos