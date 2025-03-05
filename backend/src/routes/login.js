const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/db'); // Assure-toi que le chemin est correct
const { generateTokens } = require('../utils/jwt');

const router = express.Router();

router.post('/', async (req, res) => {
    console.log(`📡 Route appelée : POST ${req.originalUrl}`);
    console.log("📝 Données reçues :", req.body);

    const { email, password } = req.body;

    try {
        const [[user]] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (!user) return res.status(400).json({ message: 'Identifiants incorrects' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Identifiants incorrects' });

        const tokens = generateTokens(user);
        res.json({ ...tokens, user: { id: user.id, firstName: user.firstName, lastName: user.lastName, role: user.role } });

    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
});

module.exports = router;
