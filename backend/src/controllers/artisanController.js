const { ArtisanService } = require('../services');

class ArtisanController {
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

    // GET all artisans
    static async getAllArtisans(req, res) {
        try {
            const artisans = await ArtisanService.getAllArtisans();
            res.json(artisans);
        } catch (error) {
            console.error("❌ Erreur lors de la récupération des artisans:", error);
            ArtisanController.handleError(error, res);
        }
    }

    // GET artisan by user_id
    static async getArtisanByUserId(req, res) {
        try {
            const userId = req.params.user_id;
            const artisan = await ArtisanService.getArtisanByUserId(userId);
            res.json(artisan);
        } catch (error) {
            console.error("❌ Erreur lors de la récupération de l'artisan:", error);
            ArtisanController.handleError(error, res);
        }
    }

    // POST create new artisan
    static async createArtisan(req, res) {
        try {
            const result = await ArtisanService.createArtisan(req.body);
            res.status(201).json(result);
        } catch (error) {
            console.error("❌ Erreur lors de la création de l'artisan:", error);
            ArtisanController.handleError(error, res);
        }
    }

    // PUT update artisan
    static async updateArtisan(req, res) {
        try {
            const userId = req.params.user_id;
            const result = await ArtisanService.updateArtisan(userId, req.body);
            res.json(result);
        } catch (error) {
            console.error("❌ Erreur lors de la mise à jour de l'artisan:", error);
            ArtisanController.handleError(error, res);
        }
    }

    // DELETE artisan
    static async deleteArtisan(req, res) {
        try {
            const userId = req.params.user_id;
            const result = await ArtisanService.deleteArtisan(userId);
            res.json(result);
        } catch (error) {
            console.error("❌ Erreur lors de la suppression de l'artisan:", error);
            ArtisanController.handleError(error, res);
        }
    }
}

module.exports = ArtisanController;
