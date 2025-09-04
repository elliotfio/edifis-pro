require('dotenv').config();

const express = require('express');
const verifyToken = require('../middleware/jwtAuth');
const { AuthController } = require('../controllers');

const router = express.Router();

// Vérification des variables d'environnement JWT
if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
    console.error("❌ Erreur: JWT_SECRET et/ou JWT_REFRESH_SECRET non définis");
    process.exit(1);
}

router.post('/login', AuthController.login);

router.get('/me', verifyToken, AuthController.getMe);


// Rafraîchir le token
router.post('/refresh-token', AuthController.refreshToken);

// Route pour demander la réinitialisation du mot de passe
router.post('/request-password-reset', AuthController.requestPasswordReset);

// Déconnexion (coté client, on supprime juste les cookies)
router.post('/logout', AuthController.logout);

module.exports = router;