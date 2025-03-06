require('dotenv').config();

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db'); 
const verifyToken = require('../middleware/jwtAuth');

const router = express.Router();

// Vérification des variables d'environnement JWT
if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
    console.error("❌ Erreur: JWT_SECRET et/ou JWT_REFRESH_SECRET non définis");
    process.exit(1);
}

// Générer un token d'accès et un refresh token
const generateTokens = (user) => {
    const access_token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );

    const refresh_token = jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
    );
    return { access_token, refresh_token };
};

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    console.log("Tentative de connexion pour:", email);

    if (!email || !password) {
        return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    try {
        console.log("Recherche de l'utilisateur...");
        const [[user]] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        console.log("Utilisateur trouvé:", user ? "Oui" : "Non");

        if (!user) {
            return res.status(401).json({ message: 'Identifiants incorrects' });
        }

        console.log("Vérification du mot de passe...");
        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log("Mot de passe valide:", isPasswordValid ? "Oui" : "Non");

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Identifiants incorrects' });
        }

        console.log("Génération des tokens...");
        const tokens = generateTokens(user);

        if (user) {
            const { password: _, ...userWithoutPassword } = user;
            console.log("Connexion réussie pour l'utilisateur:", userWithoutPassword.email);
            res.status(200).json({
                message: 'Connexion réussie !',
                user: userWithoutPassword,
                ...tokens
            });
        } else {
            res.status(401).json({ message: 'Utilisateur non trouvé' });
        }

    } catch (err) {
        console.error("❌ Erreur détaillée lors de la connexion:", err.message);
        console.error("❌ Stack trace:", err.stack);
        res.status(500).json({ message: 'Erreur serveur, veuillez réessayer plus tard' });
    }
});

router.get('/me', verifyToken, async (req, res) => {
    try {
        const [[user]] = await pool.query('SELECT id, firstName, lastName, email, role FROM users WHERE id = ?', [req.user.id]);

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        res.json(user);
    } catch (err) {
        console.error('Erreur lors de la récupération des informations utilisateur:', err);
        res.status(500).json({ message: 'Erreur serveur' });
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