const bcrypt = require('bcrypt');
const { User, Artisan, Chef, Employe } = require('../models');
const generateHash = require('../../generateHash');

class UserService {
    // Valider le rôle
    static validateRole(role) {
        const validRoles = ['artisan', 'chef', 'employe', 'admin'];
        if (!role || !validRoles.includes(role.toLowerCase())) {
            const error = new Error('Role invalide');
            error.statusCode = 400;
            throw error;
        }
    }

    // Obtenir tous les utilisateurs
    static async getAllUsers() {
        return await User.findAll();
    }

    // Obtenir un utilisateur par ID avec ses informations de rôle
    static async getUserById(id) {
        const user = await User.findById(id);
        
        if (!user) {
            const error = new Error('Utilisateur non trouvé');
            error.statusCode = 404;
            throw error;
        }

        // Récupérer les informations spécifiques au rôle
        let roleInfo = null;
        if (user.role === "artisan") {
            roleInfo = await Artisan.findByUserId(id);
        } else if (user.role === "chef") {
            roleInfo = await Chef.findByUserId(id);
        } else if (user.role === "employe") {
            roleInfo = await Employe.findByUserId(id);
        }

        return {
            ...user.toSafeObject(),
            roleInfo: roleInfo ? (roleInfo.toSafeObject ? roleInfo.toSafeObject() : roleInfo) : null,
        };
    }

    // Créer un nouvel utilisateur
    static async createUser(userData) {
        const { firstName, lastName, email, role, specialites, years_experience } = userData;

        if (!firstName || !lastName || !email || !role) {
            const error = new Error('Champs obligatoires manquants');
            error.statusCode = 400;
            throw error;
        }

        UserService.validateRole(role);

        // Vérifier l'unicité de l'email
        const emailExists = await User.checkEmailExists(email);
        if (emailExists) {
            const error = new Error('Cette adresse email est déjà utilisée');
            error.statusCode = 400;
            throw error;
        }

        // Valider les champs spécifiques au rôle
        switch (role.toLowerCase()) {
            case "artisan":
                if (!specialites || !Array.isArray(specialites) || specialites.length === 0) {
                    const error = new Error('Spécialités requises pour un artisan');
                    error.statusCode = 400;
                    throw error;
                }
                break;
            case "chef":
                if (!years_experience) {
                    const error = new Error('Années d\'expérience requises pour un chef');
                    error.statusCode = 400;
                    throw error;
                }
                break;
        }

        // Générer le mot de passe
        const rawPassword = `${lastName.toLowerCase()}.${firstName.toLowerCase()}`;
        const password = await generateHash(rawPassword);

        // Créer l'utilisateur
        const userId = await User.create({
            firstName,
            lastName,
            email,
            password,
            role: role.toLowerCase()
        });

        // Créer l'entrée dans la table spécifique au rôle
        switch (role.toLowerCase()) {
            case "employe":
                await Employe.create(userId);
                break;
            case "artisan":
                await Artisan.create(userId, { specialites });
                break;
            case "chef":
                await Chef.create(userId, { years_experience });
                break;
        }

        return { userId };
    }

    // Mettre à jour un utilisateur
    static async updateUser(userId, userData) {
        const {
            firstName,
            lastName,
            email,
            role,
            specialites,
            years_experience,
            oldRole,
        } = userData;

        if (!firstName || !lastName || !email || !role || !oldRole) {
            const error = new Error('Champs obligatoires manquants');
            error.statusCode = 400;
            throw error;
        }

        UserService.validateRole(role);
        UserService.validateRole(oldRole);

        // Vérifier l'unicité de l'email (sauf pour l'utilisateur actuel)
        const emailExists = await User.checkEmailExists(email, userId);
        if (emailExists) {
            const error = new Error('Cette adresse email est déjà utilisée');
            error.statusCode = 400;
            throw error;
        }

        // Vérifier si l'utilisateur existe
        const existingUser = await User.findById(userId);
        if (!existingUser) {
            const error = new Error('Utilisateur non trouvé');
            error.statusCode = 404;
            throw error;
        }

        // Générer le nouveau mot de passe
        const rawPassword = `${lastName.toLowerCase()}.${firstName.toLowerCase()}`;
        const hashedPassword = await generateHash(rawPassword);

        // Mettre à jour les informations de base de l'utilisateur
        await User.update(userId, {
            firstName,
            lastName,
            email,
            role: role.toLowerCase(),
            password: hashedPassword
        });

        // Si le rôle a changé, gérer les tables spécifiques
        if (oldRole.toLowerCase() !== role.toLowerCase()) {
            // Supprimer l'ancienne entrée selon le rôle
            switch (oldRole.toLowerCase()) {
                case "artisan":
                    await Artisan.delete(userId);
                    break;
                case "chef":
                    await Chef.delete(userId);
                    break;
                case "employe":
                    await Employe.delete(userId);
                    break;
            }

            // Créer la nouvelle entrée selon le nouveau rôle
            switch (role.toLowerCase()) {
                case "artisan":
                    if (!specialites || !Array.isArray(specialites) || specialites.length === 0) {
                        const error = new Error('Spécialités requises pour un artisan');
                        error.statusCode = 400;
                        throw error;
                    }
                    await Artisan.create(userId, { specialites });
                    break;
                case "chef":
                    if (!years_experience) {
                        const error = new Error('Années d\'expérience requises pour un chef');
                        error.statusCode = 400;
                        throw error;
                    }
                    await Chef.create(userId, { years_experience });
                    break;
                case "employe":
                    await Employe.create(userId);
                    break;
            }
        } else {
            // Si même rôle, mettre à jour les champs spécifiques
            switch (role.toLowerCase()) {
                case "artisan":
                    if (specialites) {
                        if (!Array.isArray(specialites) || specialites.length === 0) {
                            const error = new Error('Spécialités invalides pour un artisan');
                            error.statusCode = 400;
                            throw error;
                        }
                        await Artisan.update(userId, { specialites });
                    }
                    break;
                case "chef":
                    if (years_experience) {
                        await Chef.update(userId, { years_experience });
                    }
                    break;
            }
        }

        return { message: 'Utilisateur mis à jour avec succès' };
    }

    // Mettre à jour le mot de passe
    static async updatePassword(userId, currentPassword, newPassword) {
        // Vérifier que l'utilisateur existe
        const user = await User.findByEmail(userId);
        if (!user) {
            const error = new Error('Utilisateur non trouvé');
            error.statusCode = 404;
            throw error;
        }

        // Vérifier que l'ancien mot de passe est correct
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            const error = new Error('Mot de passe actuel incorrect');
            error.statusCode = 401;
            throw error;
        }

        // Hasher le nouveau mot de passe
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Mettre à jour le mot de passe
        await User.updatePassword(userId, hashedPassword);

        return { message: 'Mot de passe mis à jour avec succès' };
    }

    // Supprimer un utilisateur
    static async deleteUser(userId) {
        const deleted = await User.delete(userId);
        
        if (!deleted) {
            const error = new Error('Utilisateur non trouvé');
            error.statusCode = 404;
            throw error;
        }

        return { message: 'Utilisateur supprimé avec succès' };
    }
}

module.exports = UserService;
