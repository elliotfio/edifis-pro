const { UserService } = require('../services');

class UserController {
    // Error handler middleware
    static handleError(error, res) {
        console.error("❌ Error:", error);
        const statusCode = error.statusCode || 500;
        const response = { message: error.message };
        
        // Ajouter des propriétés spécifiques si elles existent
        if (error.missingFields) {
            response.missingFields = error.missingFields;
        }
        
        res.status(statusCode).json(response);
    }

    // GET all users
    static async getAllUsers(req, res) {
        try {
            const users = await UserService.getAllUsers();
            res.json(users);
        } catch (error) {
            UserController.handleError(error, res);
        }
    }

    // GET user by ID
    static async getUserById(req, res) {
        try {
            const { id } = req.params;
            const user = await UserService.getUserById(id);
            res.status(200).json(user);
        } catch (error) {
            console.error("Erreur lors de la récupération de l'utilisateur:", error);
            UserController.handleError(error, res);
        }
    }

    // POST new user
    static async createUser(req, res) {
        try {
            const result = await UserService.createUser(req.body);
            res.status(201).json({
                message: "Utilisateur créé avec succès",
                ...result
            });
        } catch (error) {
            UserController.handleError(error, res);
        }
    }

    // PUT user
    static async updateUser(req, res) {
        try {
            const userId = parseInt(req.params.id);
            const result = await UserService.updateUser(userId, req.body);
            res.json(result);
        } catch (error) {
            UserController.handleError(error, res);
        }
    }

    // PUT user password
    static async updatePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req.params.id;
            
            const result = await UserService.updatePassword(userId, currentPassword, newPassword);
            res.json(result);
        } catch (error) {
            console.error('Erreur lors de la mise à jour du mot de passe:', error);
            UserController.handleError(error, res);
        }
    }

    // DELETE user
    static async deleteUser(req, res) {
        try {
            const userId = req.params.id;
            const result = await UserService.deleteUser(userId);
            res.json(result);
        } catch (error) {
            UserController.handleError(error, res);
        }
    }
}

module.exports = UserController;
