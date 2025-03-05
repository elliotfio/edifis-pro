const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test de connexion
pool.getConnection()
    .then(connection => {
        console.log('✅ Pool de connexion MySQL initialisé');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Erreur d\'initialisation du pool MySQL:', err);
    });

module.exports = pool;