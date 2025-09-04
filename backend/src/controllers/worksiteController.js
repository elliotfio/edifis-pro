const { WorksiteService } = require('../services');

class WorksiteController {
    // Error handler middleware
    static handleError(error, res) {
        console.error("❌ Error:", error);
        const statusCode = error.statusCode || 500;
        const response = { message: error.message };
        
        // Ajouter des propriétés spécifiques si elles existent
        if (error.missingFields) {
            response.missingFields = error.missingFields;
        }
        if (error.required) {
            response.required = error.required;
        }
        
        res.status(statusCode).json(response);
    }

    // GET all worksites
    static async getAllWorksites(req, res) {
        try {
            const worksites = await WorksiteService.getAllWorksites();
            res.json(worksites);
        } catch (error) {
            console.error("❌ Erreur lors de la récupération des chantiers:", error);
            WorksiteController.handleError(error, res);
        }
    }

    // GET worksite by ID
    static async getWorksiteById(req, res) {
        try {
            const worksite = await WorksiteService.getWorksiteById(req.params.id);
            res.json(worksite);
        } catch (error) {
            console.error("❌ Erreur lors de la récupération du chantier:", error);
            WorksiteController.handleError(error, res);
        }
    }

    // GET worksites by status
    static async getWorksitesByStatus(req, res) {
        try {
            const { status } = req.params;
            const worksites = await WorksiteService.getWorksitesByStatus(status);
            res.status(200).json(worksites);
        } catch (error) {
            console.error("Erreur lors de la récupération des chantiers:", error);
            WorksiteController.handleError(error, res);
        }
    }

    // GET worksites by chef ID
    static async getWorksitesByChefId(req, res) {
        try {
            const { chef_id } = req.params;
            const worksites = await WorksiteService.getWorksitesByChefId(chef_id);
            res.status(200).json(worksites);
        } catch (error) {
            console.error("Erreur lors de la récupération des chantiers:", error);
            WorksiteController.handleError(error, res);
        }
    }

    // POST create new worksite
    static async createWorksite(req, res) {
        try {
            const result = await WorksiteService.createWorksite(req.body);
            res.status(201).json(result);
        } catch (error) {
            console.error("❌ Erreur lors de la création du chantier:", error);
            WorksiteController.handleError(error, res);
        }
    }

    // PUT update worksite
    static async updateWorksite(req, res) {
        try {
            const result = await WorksiteService.updateWorksite(req.params.id, req.body);
            res.json(result);
        } catch (error) {
            console.error("❌ Erreur lors de la mise à jour du chantier:", error);
            WorksiteController.handleError(error, res);
        }
    }

    // DELETE worksite
    static async deleteWorksite(req, res) {
        try {
            const result = await WorksiteService.deleteWorksite(req.params.id);
            res.json(result);
        } catch (error) {
            console.error("❌ Erreur lors de la suppression du chantier:", error);
            WorksiteController.handleError(error, res);
        }
    }
}

module.exports = WorksiteController;
