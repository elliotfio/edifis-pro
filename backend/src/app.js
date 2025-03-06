const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mysql = require("mysql2");
const checkAndHashPasswords = require("./utils/passwordHasher");

dotenv.config();

const app = express();
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

// Connexion à la base de données
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

pool
  .getConnection()
  .then(async (connection) => {
    console.log("✅ Connecté à la base de données MySQL");
    connection.release();
    await checkAndHashPasswords();
  })
  .catch((err) => {
    console.error("❌ Erreur de connexion à la base de données:", err);
  });

// Import des routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const artisanRoutes = require("./routes/artisans");
const chefRoutes = require("./routes/chefs");
const worksitesRoutes = require("./routes/worksites");

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

module.exports = { app, pool };
