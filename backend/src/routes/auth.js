const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db'); 
require('dotenv').config();

const router = express.Router();

router.post('/register', async (req, res) => {
    const { nom, prenom, email, mot_de_passe, role } = req.body;

    try {
        const [rows] = await pool.query('SELECT * FROM utilisateur WHERE email = ?', [email]);
        if (rows.length > 0) return res.status(400).json({ message: 'Email déjà utilisé' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(mot_de_passe, salt);

        await pool.query('INSERT INTO utilisateur (nom, prenom, email, mot_de_passe, role) VALUES (?, ?, ?, ?, ?)',
            [nom, prenom, email, hashedPassword, role || 'employe']
        );

        res.status(201).json({ message: 'Utilisateur créé avec succès' });
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur', error: err });
    }
});


module.exports = router;
