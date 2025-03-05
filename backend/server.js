const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Configuration de la base de données
const pool = mysql.createPool({
    host: process.env.DB_HOST, 
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}).promise();

// Vérification de la connexion à la base de données
pool.getConnection()
    .then(connection => {
        console.log('✅ Connecté à la base de données MySQL');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Erreur de connexion à la base de données:', err);
    });

// Routes
const authRoutes = require('./src/routes/auth'); 
const userRoutes = require('./src/routes/users');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Route de base
app.get('/', (req, res) => {
    res.send("Bienvenue sur l'API Edifis");
});

// Middleware d'erreur
app.use((err, req, res, next) => {
    console.error('❌ Erreur:', err);
    res.status(500).json({
        message: 'Une erreur est survenue!',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`📊 Base de données : ${process.env.DB_NAME}`);
    console.log(`🔌 Port base de données : ${process.env.DB_PORT}`);
});
