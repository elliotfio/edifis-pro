const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const bruteForceProtection = require('../utils/bruteForceProtection');

class AuthService {
    // Générer un token d'accès et un refresh token
    static generateTokens(user) {
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
    }

    // Connexion utilisateur
    static async login(email, password) {
        if (!email || !password) {
            throw new Error('Email et mot de passe requis');
        }

        // Vérifier les tentatives de brute force
        const attemptCheck = await bruteForceProtection.checkAttempts(email);
        
        if (!attemptCheck.allowed) {
            const remainingTimeFormatted = bruteForceProtection.formatRemainingTime(attemptCheck.remainingTime);
            
            if (attemptCheck.requiresPasswordReset) {
                const error = new Error('Compte temporairement verrouillé après plusieurs tentatives de connexion échouées.');
                error.statusCode = 423;
                error.requiresPasswordReset = true;
                error.attemptCount = attemptCheck.attemptCount;
                throw error;
            } else {
                const error = new Error(`Trop de tentatives de connexion. Veuillez réessayer dans ${remainingTimeFormatted}.`);
                error.statusCode = 429;
                error.remainingTime = attemptCheck.remainingTime;
                error.attemptCount = attemptCheck.attemptCount;
                throw error;
            }
        }

        // Rechercher l'utilisateur
        const user = await User.findByEmail(email);

        if (!user) {
            // Enregistrer la tentative échouée
            await bruteForceProtection.recordFailedAttempt(email);
            const error = new Error('Identifiants incorrects');
            error.statusCode = 401;
            throw error;
        }

        // Vérifier le mot de passe
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            // Enregistrer la tentative échouée
            const failedAttempt = await bruteForceProtection.recordFailedAttempt(email);
            
            let message = 'Identifiants incorrects';
            if (failedAttempt.attemptCount === 1) {
                message += '. Il vous reste 2 tentatives avant un délai d\'attente.';
            } else if (failedAttempt.attemptCount === 2) {
                message += '. Il vous reste 1 tentative avant un délai d\'attente.';
            } else if (failedAttempt.attemptCount === 3) {
                message += '. Compte temporairement verrouillé. Veuillez réessayer dans 30 secondes.';
            }
            
            const error = new Error(message);
            error.statusCode = 401;
            error.attemptCount = failedAttempt.attemptCount;
            error.requiresPasswordReset = failedAttempt.requiresPasswordReset;
            throw error;
        }

        // Connexion réussie - réinitialiser les tentatives
        await bruteForceProtection.recordSuccessfulLogin(email);

        // Générer les tokens
        const tokens = AuthService.generateTokens(user);

        return {
            user: user.toSafeObject(),
            ...tokens
        };
    }

    // Obtenir les informations de l'utilisateur connecté
    static async getMe(userId) {
        const user = await User.findById(userId);
        
        if (!user) {
            const error = new Error('Utilisateur non trouvé');
            error.statusCode = 404;
            throw error;
        }

        return user.toSafeObject();
    }

    // Rafraîchir le token
    static async refreshToken(refreshToken) {
        if (!refreshToken) {
            const error = new Error('Refresh token requis');
            error.statusCode = 401;
            throw error;
        }

        try {
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
            const user = await User.findById(decoded.id);
            
            if (!user) {
                const error = new Error('Utilisateur non trouvé');
                error.statusCode = 403;
                throw error;
            }

            const tokens = AuthService.generateTokens(user);
            return tokens;
        } catch (err) {
            const error = new Error('Refresh token invalide');
            error.statusCode = 403;
            throw error;
        }
    }

    // Demander la réinitialisation du mot de passe
    static async requestPasswordReset(email) {
        if (!email) {
            const error = new Error('Email requis');
            error.statusCode = 400;
            throw error;
        }

        // Vérifier si l'utilisateur existe
        const user = await User.findByEmail(email);
        
        if (!user) {
            // Ne pas révéler si l'email existe ou non pour des raisons de sécurité
            return {
                message: 'Si cette adresse email est associée à un compte, vous recevrez un email avec les instructions de réinitialisation.'
            };
        }

        // Réinitialiser les tentatives de connexion pour cet email
        await bruteForceProtection.resetAttempts(email);

        // Générer un nouveau mot de passe temporaire
        const tempPassword = `${user.lastName.toLowerCase()}.${user.firstName.toLowerCase()}.temp`;
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        // Mettre à jour le mot de passe dans la base de données
        await User.updatePassword(user.id, hashedPassword);

        // En production, vous devriez envoyer un email avec le mot de passe temporaire
        return {
            message: 'Mot de passe réinitialisé avec succès.',
            // ATTENTION: En production, ne jamais retourner le mot de passe dans la réponse
            tempPassword: tempPassword,
            note: 'Veuillez changer ce mot de passe temporaire après votre première connexion.'
        };
    }
}

module.exports = AuthService;
