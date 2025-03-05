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

// Get worksite by ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM worksites WHERE id = ?', [req.params.id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Chantier non trouvé' });
        }

        // Formater la réponse
        const worksite = {
            ...rows[0],
            coordinates: {
                x: parseFloat(rows[0].coordinates.x),
                y: parseFloat(rows[0].coordinates.y)
            },
            cost: parseFloat(rows[0].cost),
            budget: parseFloat(rows[0].budget),
            specialities_needed: rows[0].specialities_needed.split(', ')
        };

        res.json(worksite);
    } catch (err) {
        console.error("❌ Erreur lors de la récupération du chantier:", err);
        res.status(500).json({ message: 'Erreur serveur', error: err });
    }
});

module.exports = router;
