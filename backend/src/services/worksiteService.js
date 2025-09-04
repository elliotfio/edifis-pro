const { Worksite } = require('../models');

class WorksiteService {
    // Obtenir tous les chantiers
    static async getAllWorksites() {
        return await Worksite.findAll();
    }

    // Obtenir un chantier par ID
    static async getWorksiteById(id) {
        const worksite = await Worksite.findById(id);
        
        if (!worksite) {
            const error = new Error('Chantier non trouvé');
            error.statusCode = 404;
            throw error;
        }

        return worksite;
    }

    // Obtenir les chantiers par statut
    static async getWorksitesByStatus(status) {
        return await Worksite.findByStatus(status);
    }

    // Obtenir les chantiers par chef
    static async getWorksitesByChefId(chefId) {
        return await Worksite.findByChefId(chefId);
    }

    // Créer un nouveau chantier
    static async createWorksite(worksiteData) {
        // Validation des données requises
        const missingFields = Worksite.validateRequiredFields(worksiteData);
        if (missingFields.length > 0) {
            const error = new Error('Données manquantes');
            error.statusCode = 400;
            error.missingFields = missingFields;
            throw error;
        }

        // Validation supplémentaire pour coordinates
        if (!Worksite.validateCoordinates(worksiteData.coordinates)) {
            const error = new Error('Coordonnées invalides');
            error.statusCode = 400;
            error.required = 'Les coordonnées doivent avoir x et y';
            throw error;
        }

        const worksite = await Worksite.create(worksiteData);
        
        return {
            message: 'Chantier créé avec succès',
            worksite_id: worksite.id
        };
    }

    // Mettre à jour un chantier
    static async updateWorksite(id, worksiteData) {
        // Validation des données requises
        const requiredFields = [
            "name",
            "address",
            "coordinates",
            "budget",
            "cost",
            "specialities_needed",
            "startDate",
            "endDate",
            "status",
        ];
        const missingFields = requiredFields.filter((field) => !worksiteData[field]);

        if (missingFields.length > 0) {
            const error = new Error('Données manquantes');
            error.statusCode = 400;
            error.missingFields = missingFields;
            throw error;
        }

        // Validation supplémentaire pour coordinates
        if (!Worksite.validateCoordinates(worksiteData.coordinates)) {
            const error = new Error('Coordonnées invalides');
            error.statusCode = 400;
            error.required = 'Les coordonnées doivent avoir x et y';
            throw error;
        }

        // Vérifier si le chantier existe
        const existingWorksite = await Worksite.exists(id);
        if (!existingWorksite) {
            const error = new Error('Chantier non trouvé');
            error.statusCode = 404;
            throw error;
        }

        const updatedWorksite = await Worksite.update(id, worksiteData);

        return {
            message: 'Chantier mis à jour avec succès',
            worksite: updatedWorksite
        };
    }

    // Supprimer un chantier
    static async deleteWorksite(id) {
        // Vérifier si le chantier existe
        const existingWorksite = await Worksite.exists(id);
        if (!existingWorksite) {
            const error = new Error('Chantier non trouvé');
            error.statusCode = 404;
            throw error;
        }

        await Worksite.delete(id);
        
        return { message: 'Chantier supprimé avec succès' };
    }
}

module.exports = WorksiteService;
