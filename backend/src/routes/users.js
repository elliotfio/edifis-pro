const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET all users
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, firstName, lastName, email, role, date_creation FROM users');
        res.json(rows);
    } catch (err) {
        console.error("❌ Erreur lors de la récupération des utilisateurs:", err);
        res.status(500).json({ message: 'Erreur serveur', error: err });
    }
});

// GET user by ID
router.get('/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const [[user]] = await pool.query('SELECT id, firstName, lastName, email, role, date_creation FROM users WHERE id = ?', [userId]);
        
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        res.json(user);
    } catch (err) {
        console.error("❌ Erreur lors de la récupération de l'utilisateur:", err);
        res.status(500).json({ message: 'Erreur serveur', error: err });
    }
});

// POST create artisan
router.post('/', async (req, res) => {
    const { user_id, specialites } = req.body;

    try {
        const [result] = await pool.query(`
            INSERT INTO artisan (user_id, specialites)
            VALUES (?, ?)
        `, [user_id, specialites.join(',')]);

        res.status(201).json({ message: 'Artisan créé avec succès', artisanId: result.insertId });
    } catch (err) {
        console.error("❌ Erreur lors de la création de l'artisan:", err);
        res.status(500).json({ message: 'Erreur serveur', error: err });
    }
});

module.exports = router;
