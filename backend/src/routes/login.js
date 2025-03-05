const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET all chefs
router.get('/', async (req, res) => {
    try {
        const [chefs] = await pool.query(`
            SELECT c.*, u.firstName, u.lastName, u.email, u.role, u.date_creation
            FROM chef c
            INNER JOIN users u ON c.user_id = u.id
            WHERE u.role = 'chef'
        `);

        // Formater les données pour chaque chef
        const formattedChefs = chefs.map(chef => ({
            ...chef,
            user_id: chef.employe_id,
            niveau_experience: chef.niveau_experience,
            specialites: [chef.specialites], // Le niveau d'expérience est considéré comme une spécialité
            disponible: true, // À ajuster selon vos besoins
            history_worksite: chef.history_worksite ? chef.history_worksite.split(',') : []
        }));

        res.json(formattedChefs);
    } catch (err) {
        console.error("❌ Erreur lors de la récupération des chefs:", err);
        res.status(500).json({ message: 'Erreur serveur', error: err });
    }
});

// GET chef by user_id
router.get('/:user_id', async (req, res) => {
    try {
        const userId = req.params.user_id;
        const [[chef]] = await pool.query(`
            SELECT c.*, u.firstName, u.lastName, u.email, u.role, u.date_creation
            FROM chef c
            INNER JOIN users u ON c.user_id = u.id
            WHERE c.user_id = ? AND u.role = 'chef'
        `, [userId]);

        if (!chef) {
            return res.status(404).json({ message: 'Chef non trouvé' });
        }

        // Formater les données du chef
        const formattedChef = {
            ...chef,
            user_id: chef.user_id,
                
            niveau_experience: chef.niveau_experience,
            specialites: [chef.specialites], // Le niveau d'expérience est considéré comme une spécialité
            disponible: true, // À ajuster selon vos besoins
            history_worksite: chef.history_worksite ? chef.history_worksite.split(',') : []
        };
        
        res.json(formattedChef);
    } catch (err) {
        console.error("❌ Erreur lors de la récupération du chef:", err);
        res.status(500).json({ message: 'Erreur serveur', error: err });
    }
});

module.exports = router;
