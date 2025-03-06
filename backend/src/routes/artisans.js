const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET all artisans
router.get('/', async (req, res) => {
    try {
        const [artisans] = await pool.query(`
            SELECT a.*, u.firstName, u.lastName, u.email, u.role, u.date_creation
            FROM artisan a
            INNER JOIN users u ON a.user_id = u.id
            WHERE u.role = 'artisan'
        `);

        // Formater les spécialités en tableau pour chaque artisan
        const formattedArtisans = artisans.map(artisan => ({
            ...artisan,
            specialites: artisan.specialites ? artisan.specialites.split(',') : []
        }));

        res.json(formattedArtisans);
    } catch (err) {
        console.error("❌ Erreur lors de la récupération des artisans:", err);
        res.status(500).json({ message: 'Erreur serveur', error: err });
    }
});

// GET artisan by user_id
router.get('/:user_id', async (req, res) => {
    try {
        const userId = req.params.user_id;
        const [[artisan]] = await pool.query(`
            SELECT a.*, u.firstName, u.lastName, u.email, u.role, u.date_creation
            FROM artisan a
            INNER JOIN users u ON a.user_id = u.id
            WHERE a.user_id = ? AND u.role = 'artisan'
        `, [userId]);

        if (!artisan) {
            return res.status(404).json({ message: 'Artisan non trouvé' });
        }

        // Formater les spécialités en tableau
        artisan.specialites = artisan.specialites ? artisan.specialites.split(',') : [];
        
        res.json(artisan);
    } catch (err) {
        console.error("❌ Erreur lors de la récupération de l'artisan:", err);
        res.status(500).json({ message: 'Erreur serveur', error: err });
    }
});

// DELETE artisan by user_id
router.delete('/:user_id', async (req, res) => {
    const userId = req.params.user_id;
    try {
        // Supprimer l'artisan
        const [artisanResult] = await pool.query('DELETE FROM artisan WHERE user_id = ?', [userId]);

        // Vérifiez si l'artisan a été supprimé
        if (artisanResult.affectedRows === 0) {
            return res.status(404).json({ message: 'Artisan non trouvé' });
        }

        // Supprimer l'utilisateur
        const [userResult] = await pool.query('DELETE FROM users WHERE id = ?', [userId]);

        // Vérifiez si l'utilisateur a été supprimé
        if (userResult.affectedRows === 0) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        res.json({ message: 'Artisan et utilisateur supprimés avec succès' });
    } catch (err) {
        console.error("❌ Erreur lors de la suppression de l'artisan:", err);
        res.status(500).json({ message: 'Erreur serveur', error: err });
    }
});

module.exports = router;
