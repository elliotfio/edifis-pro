const { User, Artisan } = require('../models');
const generateHash = require('../../generateHash');

class ArtisanService {
    // Obtenir tous les artisans
    static async getAllArtisans() {
        return await Artisan.findAll();
    }

    // Obtenir un artisan par user_id
    static async getArtisanByUserId(userId) {
        const artisan = await Artisan.findByUserId(userId);
        
        if (!artisan) {
            const error = new Error('Artisan non trouvé');
            error.statusCode = 404;
            throw error;
        }

        return artisan;
    }

    // Créer un nouvel artisan
    static async createArtisan(artisanData) {
        const { firstName, lastName, email, specialites } = artisanData;

        // Validation des données requises
        const requiredFields = ['firstName', 'lastName', 'email', 'specialites'];
        const missingFields = requiredFields.filter(field => !artisanData[field]);

        if (missingFields.length > 0) {
            const error = new Error('Données manquantes');
            error.statusCode = 400;
            error.missingFields = missingFields;
            throw error;
        }

        // Vérifier si l'email existe déjà
        const emailExists = await User.checkEmailExists(email);
        if (emailExists) {
            const error = new Error('Cet email est déjà utilisé');
            error.statusCode = 400;
            throw error;
        }

        // Générer et hasher le mot de passe
        const rawPassword = `${lastName.toLowerCase()}.${firstName.toLowerCase()}`;
        const hashedPassword = await generateHash(rawPassword);

        // Créer l'utilisateur
        const userId = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role: 'artisan'
        });

        // Créer l'artisan
        const artisan = await Artisan.create(userId, { specialites });

        return {
            message: 'Artisan créé avec succès',
            artisan
        };
    }

    // Mettre à jour un artisan
    static async updateArtisan(userId, artisanData) {
        const {
            firstName,
            lastName,
            email,
            specialites,
            years_experience
        } = artisanData;

        // Vérifier si l'artisan existe
        const existingArtisan = await Artisan.findByUserId(userId);
        if (!existingArtisan) {
            const error = new Error('Artisan non trouvé');
            error.statusCode = 404;
            throw error;
        }

        // Vérifier si le nouvel email existe déjà (sauf si c'est le même)
        if (email && email !== existingArtisan.email) {
            const emailExists = await User.checkEmailExists(email, userId);
            if (emailExists) {
                const error = new Error('Cet email est déjà utilisé');
                error.statusCode = 400;
                throw error;
            }
        }

        // Préparer les données pour la mise à jour de l'utilisateur
        const userUpdateData = {};
        if (firstName) userUpdateData.firstName = firstName;
        if (lastName) userUpdateData.lastName = lastName;
        if (email) userUpdateData.email = email;
        
        if (firstName && lastName) {
            const rawPassword = `${lastName.toLowerCase()}.${firstName.toLowerCase()}`;
            const hashedPassword = await generateHash(rawPassword);
            userUpdateData.password = hashedPassword;
        }

        // Mettre à jour l'utilisateur si nécessaire
        if (Object.keys(userUpdateData).length > 0) {
            userUpdateData.role = 'artisan'; // Conserver le rôle
            await User.update(userId, userUpdateData);
        }

        // Préparer les données pour la mise à jour de l'artisan
        const artisanUpdateData = {};
        if (specialites) artisanUpdateData.specialites = specialites;
        if (years_experience !== undefined) artisanUpdateData.years_experience = years_experience;

        // Mettre à jour l'artisan si nécessaire
        let updatedArtisan = existingArtisan;
        if (Object.keys(artisanUpdateData).length > 0) {
            updatedArtisan = await Artisan.update(userId, artisanUpdateData);
        } else {
            // Récupérer les données mises à jour
            updatedArtisan = await Artisan.findByUserId(userId);
        }

        return {
            message: 'Artisan mis à jour avec succès',
            artisan: updatedArtisan
        };
    }

    // Supprimer un artisan
    static async deleteArtisan(userId) {
        // Vérifier si l'artisan existe
        const existingArtisan = await Artisan.exists(userId);
        if (!existingArtisan) {
            const error = new Error('Artisan non trouvé');
            error.statusCode = 404;
            throw error;
        }

        // Supprimer l'artisan (cascade supprimera l'utilisateur)
        await Artisan.delete(userId);
        await User.delete(userId);

        return { message: 'Artisan supprimé avec succès' };
    }
}

module.exports = ArtisanService;
