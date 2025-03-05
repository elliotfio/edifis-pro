const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Get all worksites
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM worksites');
        res.json(rows);
    } catch (err) {
        console.error("❌ Erreur lors de la récupération des chantiers:", err);
        res.status(500).json({ message: 'Erreur serveur', error: err });
    }
});

module.exports = router;
