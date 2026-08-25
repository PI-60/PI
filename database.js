import mysql from 'mysql2/promise';

const db = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'pi.2026', 
    database: 'ifsc60'
});

console.log('Conectado ao banco de dados ifsc60!');

export default db;