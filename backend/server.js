const express = require("express");
const mysql = require("mysql2");
const dotenv = require("dotenv");
const checkAndHashPasswords = require("./src/utils/passwordHasher");
const cron = require("node-cron");

dotenv.config();

const app = express();
const cors = require("cors");
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// Configuration de la base de données
const pool = mysql
  .createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  })
  .promise();

// Importer la fonction assignWorksites
const assignWorksites = require("./src/cron/assignWorksites");

// Vérification de la connexion à la base de données
pool
  .getConnection()
  .then(async (connection) => {
    console.log("✅ Connecté à la base de données MySQL");
    connection.release();

    // Vérifier et hasher les mots de passe non hashés
    await checkAndHashPasswords();

    // Exécuter manuellement l'attribution des chantiers au démarrage (optionnel)
    // await assignWorksites();
  })
  .catch((err) => {
    console.error("❌ Erreur de connexion à la base de données:", err);
  });

// Routes
const authRoutes = require("./src/routes/auth");
const userRoutes = require("./src/routes/users");
const artisanRoutes = require("./src/routes/artisans");
const chefRoutes = require("./src/routes/chefs");
const worksitesRoutes = require("./src/routes/worksites");

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/artisans", artisanRoutes);
app.use("/api/chefs", chefRoutes);
app.use("/api/worksites", worksitesRoutes);

// Route de base
app.get("/", (req, res) => {
  res.send("Bienvenue sur l'API Edifis");
});

// Middleware d'erreur
app.use((err, req, res, next) => {
  console.error("❌ Erreur:", err);
  res.status(500).json({
    message: "Une erreur est survenue!",
    error: process.env.NODE_ENV === "development" ? err : {},
  });
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📊 Base de données : ${process.env.DB_NAME}`);
  console.log(`🔌 Port base de données : ${process.env.DB_PORT}`);
});
