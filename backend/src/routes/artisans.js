const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const bcrypt = require('bcrypt');

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

// POST create new artisan
router.post('/', async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            specialites
        } = req.body;

        // Validation des données requises
        const requiredFields = ['firstName', 'lastName', 'email', 'password', 'specialites'];
        const missingFields = requiredFields.filter(field => !req.body[field]);

        if (missingFields.length > 0) {
            return res.status(400).json({
                message: 'Données manquantes',
                missingFields
            });
        }

        // Vérifier si l'email existe déjà
        const [[existingUser]] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé' });
        }

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Commencer une transaction
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // 1. Créer l'utilisateur
            const [userResult] = await connection.query(`
                INSERT INTO users (firstName, lastName, email, password, role, date_creation)
                VALUES (?, ?, ?, ?, 'artisan', NOW())
            `, [firstName, lastName, email, hashedPassword]);

            const userId = userResult.insertId;

            // 2. Formater les spécialités
            const specialitesString = Array.isArray(specialites) ? specialites.join(',') : specialites;

            // 3. Créer l'artisan
            await connection.query(`
                INSERT INTO artisan (
                    user_id,
                    specialites,
                    disponible,
                    note_moyenne,
                    current_worksite,
                    history_worksite
                )
                VALUES (?, ?, true, 0, NULL, NULL)
            `, [userId, specialitesString]);

            // Valider la transaction
            await connection.commit();

            // 4. Récupérer l'artisan créé avec les informations de l'utilisateur
            const [[newArtisan]] = await pool.query(`
                SELECT a.*, u.firstName, u.lastName, u.email, u.role, u.date_creation
                FROM artisan a
                INNER JOIN users u ON a.user_id = u.id
                WHERE a.user_id = ?
            `, [userId]);

            // 5. Formater la réponse
            const formattedArtisan = {
                ...newArtisan,
                specialites: newArtisan.specialites ? newArtisan.specialites.split(',') : []
            };

            res.status(201).json({
                message: 'Artisan créé avec succès',
                artisan: formattedArtisan
            });

        } catch (err) {
            // En cas d'erreur, annuler la transaction
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }

    } catch (err) {
        console.error("❌ Erreur lors de la création de l'artisan:", err);
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
});

// PUT update artisan
router.put('/:user_id', async (req, res) => {
    try {
        const userId = req.params.user_id;
        const {
            firstName,
            lastName,
            email,
            password,
            specialites,
            years_experience
        } = req.body;

        // Vérifier si l'artisan existe
        const [[existingArtisan]] = await pool.query(`
            SELECT a.*, u.email 
            FROM artisan a
            INNER JOIN users u ON a.user_id = u.id
            WHERE a.user_id = ? AND u.role = 'artisan'
        `, [userId]);

        if (!existingArtisan) {
            return res.status(404).json({ message: 'Artisan non trouvé' });
        }

        // Vérifier si le nouvel email existe déjà (sauf si c'est le même)
        if (email && email !== existingArtisan.email) {
            const [[existingEmail]] = await pool.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId]);
            if (existingEmail) {
                return res.status(400).json({ message: 'Cet email est déjà utilisé' });
            }
        }

        // Commencer une transaction
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // 1. Mettre à jour l'utilisateur
            const userUpdateFields = [];
            const userUpdateValues = [];

            if (firstName) {
                userUpdateFields.push('firstName = ?');
                userUpdateValues.push(firstName);
            }
            if (lastName) {
                userUpdateFields.push('lastName = ?');
                userUpdateValues.push(lastName);
            }
            if (email) {
                userUpdateFields.push('email = ?');
                userUpdateValues.push(email);
            }
            if (password) {
                const hashedPassword = await bcrypt.hash(password, 10);
                userUpdateFields.push('password = ?');
                userUpdateValues.push(hashedPassword);
            }

            if (userUpdateFields.length > 0) {
                userUpdateValues.push(userId);
                await connection.query(`
                    UPDATE users 
                    SET ${userUpdateFields.join(', ')}
                    WHERE id = ?
                `, userUpdateValues);
            }

            // 2. Mettre à jour l'artisan
            const artisanUpdateFields = [];
            const artisanUpdateValues = [];

            if (specialites) {
                const specialitesString = Array.isArray(specialites) ? specialites.join(',') : specialites;
                artisanUpdateFields.push('specialites = ?');
                artisanUpdateValues.push(specialitesString);
            }
            if (years_experience !== undefined) {
                artisanUpdateFields.push('years_experience = ?');
                artisanUpdateValues.push(years_experience);
            }

            if (artisanUpdateFields.length > 0) {
                artisanUpdateValues.push(userId);
                await connection.query(`
                    UPDATE artisan 
                    SET ${artisanUpdateFields.join(', ')}
                    WHERE user_id = ?
                `, artisanUpdateValues);
            }

            // Valider la transaction
            await connection.commit();

            // 3. Récupérer l'artisan mis à jour
            const [[updatedArtisan]] = await pool.query(`
                SELECT a.*, u.firstName, u.lastName, u.email, u.role, u.date_creation
                FROM artisan a
                INNER JOIN users u ON a.user_id = u.id
                WHERE a.user_id = ?
            `, [userId]);

            // 4. Formater la réponse
            const formattedArtisan = {
                ...updatedArtisan,
                specialites: updatedArtisan.specialites ? updatedArtisan.specialites.split(',') : []
            };

            res.json({
                message: 'Artisan mis à jour avec succès',
                artisan: formattedArtisan
            });

        } catch (err) {
            // En cas d'erreur, annuler la transaction
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }

    } catch (err) {
        console.error("❌ Erreur lors de la mise à jour de l'artisan:", err);
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
});

// DELETE artisan
router.delete('/:user_id', async (req, res) => {
    try {
        const userId = req.params.user_id;

        // Vérifier si l'artisan existe
        const [[existingArtisan]] = await pool.query(`
            SELECT a.* FROM artisan a
            INNER JOIN users u ON a.user_id = u.id
            WHERE a.user_id = ? AND u.role = 'artisan'
        `, [userId]);

        if (!existingArtisan) {
            return res.status(404).json({ message: 'Artisan non trouvé' });
        }

        // Commencer une transaction
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // 1. Supprimer l'artisan
            await connection.query('DELETE FROM artisan WHERE user_id = ?', [userId]);

            // 2. Supprimer l'utilisateur
            await connection.query('DELETE FROM users WHERE id = ?', [userId]);

            // Valider la transaction
            await connection.commit();

            res.json({ message: 'Artisan supprimé avec succès' });

        } catch (err) {
            // En cas d'erreur, annuler la transaction
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }

    } catch (err) {
        console.error("❌ Erreur lors de la suppression de l'artisan:", err);
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
});

module.exports = router;
