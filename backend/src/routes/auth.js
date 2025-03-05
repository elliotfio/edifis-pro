const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db'); 
const verifyToken = require('../middleware/jwtAuth');
require('dotenv').config();

const router = express.Router();

// Générer un token d'accès et un refresh token
const generateTokens = (user) => {
    const accessToken = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
    );
    return { accessToken, refreshToken };
};

router.post('/register', async (req, res) => {
    const { firstName, lastName, email, password, role } = req.body;

    console.log("Données reçues :", req.body); // Ajout de log

    if (!password) {
        return res.status(400).json({ message: "Le mot de passe est requis" });
    }

    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length > 0) return res.status(400).json({ message: 'Email déjà utilisé' });

        const hashedPassword = await bcrypt.hash(password, 10); // Ici, on est sûr que password est défini

        const userRole = role === 'admin' ? 'admin' : 'employe';
        const [result] = await pool.query(
            'INSERT INTO users (firstName, lastName, email, password, role) VALUES (?, ?, ?, ?, ?)',
            [firstName, lastName, email, hashedPassword, userRole]
        );

        const newUser = { id: result.insertId, firstName, lastName, email, role: userRole };
        const tokens = generateTokens(newUser);

        res.status(201).json({ ...tokens, user: newUser });

    } catch (err) {
        console.error('Erreur lors de l’enregistrement :', err);
        res.status(500).json({ message: 'Erreur serveur, veuillez réessayer plus tard' });
    }
});


// Connexion
router.post('/login', async (req, res) => {
    const { email, password } = req.body; // ✅ Correspond au JSON envoyé
    try {
        const [[user]] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (!user) {
            return res.status(400).json({ message: 'Identifiants incorrects' });
        }

        const isMatch = await bcrypt.compare(password, user.password); // ✅ Vérifie avec la colonne correcte
        if (!isMatch) {
            return res.status(400).json({ message: 'Identifiants incorrects' });
        }

        const tokens = generateTokens(user);
        res.json({ ...tokens, user: { id: user.id, firstName: user.firstName, lastName: user.lastName, role: user.role } });
    } catch (error) {
        console.error("Erreur lors du login :", error);
        res.status(500).json({ message: 'Erreur serveur', error });
    }
});


// Rafraîchir le token
router.post('/refresh-token', (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'Refresh token requis' });

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Refresh token invalide' });
        
        const [[user]] = await pool.query('SELECT * FROM users WHERE id = ?', [decoded.id]);
        if (!user) return res.status(403).json({ message: 'Utilisateur non trouvé' });

        const tokens = generateTokens(user);
        res.json(tokens);
    });
});

// Déconnexion (coté client, on supprime juste les cookies)
router.post('/logout', (req, res) => {
    res.json({ message: 'Déconnexion réussie' });
});

module.exports = router;