const { AuthService } = require('../services');

class AuthController {
    // Connexion utilisateur
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            const result = await AuthService.login(email, password);
            
            res.status(200).json({
                message: 'Connexion réussie !',
                ...result
            });
        } catch (error) {
            console.error("❌ Erreur détaillée lors de la connexion:", error.message);
            
            const statusCode = error.statusCode || 500;
            const response = { message: error.message };
            
            // Ajouter des propriétés spécifiques si elles existent
            if (error.requiresPasswordReset !== undefined) {
                response.requiresPasswordReset = error.requiresPasswordReset;
            }
            if (error.attemptCount !== undefined) {
                response.attemptCount = error.attemptCount;
            }
            if (error.remainingTime !== undefined) {
                response.remainingTime = error.remainingTime;
            }
            
            res.status(statusCode).json(response);
        }
    }

    // Obtenir les informations de l'utilisateur connecté
    static async getMe(req, res) {
        try {
            const user = await AuthService.getMe(req.user.id);
            res.json(user);
        } catch (error) {
            console.error('Erreur lors de la récupération des informations utilisateur:', error);
            const statusCode = error.statusCode || 500;
            res.status(statusCode).json({ message: error.message });
        }
    }

    // Rafraîchir le token
    static async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;
            const tokens = await AuthService.refreshToken(refreshToken);
            res.json(tokens);
        } catch (error) {
            const statusCode = error.statusCode || 500;
            res.status(statusCode).json({ message: error.message });
        }
    }

    // Demander la réinitialisation du mot de passe
    static async requestPasswordReset(req, res) {
        try {
            const { email } = req.body;
            const result = await AuthService.requestPasswordReset(email);
            res.status(200).json(result);
        } catch (error) {
            console.error("❌ Erreur lors de la réinitialisation du mot de passe:", error.message);
            const statusCode = error.statusCode || 500;
            res.status(statusCode).json({ message: error.message });
        }
    }

    // Déconnexion (coté client, on supprime juste les cookies)
    static async logout(req, res) {
        res.json({ message: 'Déconnexion réussie' });
    }
}

module.exports = AuthController;
