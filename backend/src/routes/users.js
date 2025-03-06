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

// DELETE user by ID
router.delete('/:id', async (req, res) => {
    const userId = req.params.id;
    try {
        // Supprimer l'utilisateur
        await pool.query('DELETE FROM users WHERE id = ?', [userId]);

        // Supprimer l'artisan si l'utilisateur est un artisan
        await pool.query('DELETE FROM artisan WHERE user_id = ?', [userId]);

        // Supprimer le chef si l'utilisateur est un chef
        await pool.query('DELETE FROM chef WHERE user_id = ?', [userId]);

        res.json({ message: 'Utilisateur, artisan et/ou chef supprimés avec succès' });
    } catch (err) {
        console.error("❌ Erreur lors de la suppression de l'utilisateur:", err);
        res.status(500).json({ message: 'Erreur serveur', error: err });
    }
});

module.exports = router;
