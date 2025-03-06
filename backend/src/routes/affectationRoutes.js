const express = require('express');
const router = express.Router();
const pool = require('../config/db');

//recup les affection 
router.get('/:chantier_id', async (req, res) => {
    const chantier_id = req.params.chantier_id;

    try {
        const [rows] = await pool.query('SELECT * FROM affectations WHERE chantier_id = ?', [chantier_id]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
});

module.exports = router;