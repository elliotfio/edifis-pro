const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const bcrypt = require('bcrypt');

// GET all chefs
router.get('/', async (req, res) => {
    try {
        const [chefs] = await pool.query(`
            SELECT c.*, u.firstName, u.lastName, u.email, u.role, u.date_creation
            FROM chef c
            INNER JOIN users u ON c.user_id = u.id
            WHERE u.role = 'chef'
        `);

        // Formater l'historique des chantiers pour chaque chef
        const formattedChefs = chefs.map(chef => ({
            ...chef,
            history_worksite: chef.history_worksite ? JSON.parse(chef.history_worksite) : []
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

        // Formater l'historique des chantiers
        chef.history_worksite = chef.history_worksite ? JSON.parse(chef.history_worksite) : [];
        
        res.json(chef);
    } catch (err) {
        console.error("❌ Erreur lors de la récupération du chef:", err);
        res.status(500).json({ message: 'Erreur serveur', error: err });
    }
});

// POST create new chef
router.post('/', async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            years_experience
        } = req.body;

        // Validation des données requises
        const requiredFields = ['firstName', 'lastName', 'email', 'password', 'years_experience'];
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
                VALUES (?, ?, ?, ?, 'chef', NOW())
            `, [firstName, lastName, email, hashedPassword]);

            const userId = userResult.insertId;

            // 2. Créer le chef
            await connection.query(`
                INSERT INTO chef (
                    user_id,
                    years_experience,
                    current_worksite,
                    history_worksite
                )
                VALUES (?, ?, NULL, NULL)
            `, [userId, years_experience]);

            // Valider la transaction
            await connection.commit();

            // 3. Récupérer le chef créé avec les informations de l'utilisateur
            const [[newChef]] = await pool.query(`
                SELECT c.*, u.firstName, u.lastName, u.email, u.role, u.date_creation
                FROM chef c
                INNER JOIN users u ON c.user_id = u.id
                WHERE c.user_id = ?
            `, [userId]);

            // 4. Formater la réponse
            const formattedChef = {
                ...newChef,
                history_worksite: newChef.history_worksite ? JSON.parse(newChef.history_worksite) : []
            };

            res.status(201).json({
                message: 'Chef créé avec succès',
                chef: formattedChef
            });

        } catch (err) {
            // En cas d'erreur, annuler la transaction
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }

    } catch (err) {
        console.error("❌ Erreur lors de la création du chef:", err);
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
});

// PUT update chef
router.put('/:user_id', async (req, res) => {
    try {
        const userId = req.params.user_id;
        const {
            firstName,
            lastName,
            email,
            password,
            years_experience
        } = req.body;

        // Vérifier si le chef existe
        const [[existingChef]] = await pool.query(`
            SELECT c.*, u.email 
            FROM chef c
            INNER JOIN users u ON c.user_id = u.id
            WHERE c.user_id = ? AND u.role = 'chef'
        `, [userId]);

        if (!existingChef) {
            return res.status(404).json({ message: 'Chef non trouvé' });
        }

        // Vérifier si le nouvel email existe déjà (sauf si c'est le même)
        if (email && email !== existingChef.email) {
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

            // 2. Mettre à jour le chef
            if (years_experience !== undefined) {
                await connection.query(`
                    UPDATE chef 
                    SET years_experience = ?
                    WHERE user_id = ?
                `, [years_experience, userId]);
            }

            // Valider la transaction
            await connection.commit();

            // 3. Récupérer le chef mis à jour
            const [[updatedChef]] = await pool.query(`
                SELECT c.*, u.firstName, u.lastName, u.email, u.role, u.date_creation
                FROM chef c
                INNER JOIN users u ON c.user_id = u.id
                WHERE c.user_id = ?
            `, [userId]);

            // 4. Formater la réponse
            const formattedChef = {
                ...updatedChef,
                history_worksite: updatedChef.history_worksite ? JSON.parse(updatedChef.history_worksite) : []
            };

            res.json({
                message: 'Chef mis à jour avec succès',
                chef: formattedChef
            });

        } catch (err) {
            // En cas d'erreur, annuler la transaction
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }

    } catch (err) {
        console.error("❌ Erreur lors de la mise à jour du chef:", err);
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
});

// DELETE chef
router.delete('/:user_id', async (req, res) => {
    try {
        const userId = req.params.user_id;

        // Vérifier si le chef existe
        const [[existingChef]] = await pool.query(`
            SELECT c.* FROM chef c
            INNER JOIN users u ON c.user_id = u.id
            WHERE c.user_id = ? AND u.role = 'chef'
        `, [userId]);

        if (!existingChef) {
            return res.status(404).json({ message: 'Chef non trouvé' });
        }

        // Commencer une transaction
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // 1. Supprimer le chef
            await connection.query('DELETE FROM chef WHERE user_id = ?', [userId]);

            // 2. Supprimer l'utilisateur
            await connection.query('DELETE FROM users WHERE id = ?', [userId]);

            // Valider la transaction
            await connection.commit();

            res.json({ message: 'Chef supprimé avec succès' });

        } catch (err) {
            // En cas d'erreur, annuler la transaction
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }

    } catch (err) {
        console.error("❌ Erreur lors de la suppression du chef:", err);
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
});

module.exports = router;
