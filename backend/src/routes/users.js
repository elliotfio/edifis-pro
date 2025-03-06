const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Error handler middleware
const handleError = (err, res) => {
    console.error("❌ Error:", err);
    if (err.message === 'Utilisateur non trouvé') {
        res.status(404).json({ message: err.message });
    } else {
        res.status(400).json({ message: err.message });
    }
};

// Validate role middleware
const validateRole = (role) => {
    const validRoles = ['artisan', 'chef', 'employe'];
    if (!role || !validRoles.includes(role.toLowerCase())) {
        throw new Error('Role invalide');
    }
};

// GET all users
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, firstName, lastName, email, role, date_creation FROM users');
        res.json(rows);
    } catch (err) {
        handleError(err, res);
    }
});

// GET user by ID
router.get('/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const [[user]] = await pool.query(
            'SELECT id, firstName, lastName, email, role, date_creation FROM users WHERE id = ?',
            [userId]
        );
        
        if (!user) {
            throw new Error('Utilisateur non trouvé');
        }

        // Get role specific info
        let roleInfo = null;
        switch (user.role.toLowerCase()) {
            case 'artisan':
                const [[artisanInfo]] = await pool.query(
                    'SELECT specialites, disponible, note_moyenne, current_worksite FROM artisan WHERE user_id = ?',
                    [userId]
                );
                if (artisanInfo) {
                    artisanInfo.specialites = JSON.parse(artisanInfo.specialites);
                }
                roleInfo = artisanInfo;
                break;
            case 'chef':
                const [[chefInfo]] = await pool.query(
                    'SELECT years_experience, current_worksite FROM chef WHERE user_id = ?',
                    [userId]
                );
                roleInfo = chefInfo;
                break;
        }

        res.json({
            ...user,
            roleInfo
        });
    } catch (err) {
        handleError(err, res);
    }
});

// POST new user
router.post('/', async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        const { firstName, lastName, email, role, specialites, years_experience } = req.body;
        
        if (!firstName || !lastName || !email || !role) {
            throw new Error('Champs obligatoires manquants');
        }

        validateRole(role);

        const password = `${lastName}.${firstName}`;
        const date_creation = new Date().toISOString().split('T')[0];

        // Based on role, validate required fields
        switch (role.toLowerCase()) {
            case 'artisan':
                if (!specialites || !Array.isArray(specialites) || specialites.length === 0) {
                    throw new Error('Spécialités requises pour un artisan');
                }
                break;
            case 'chef':
                if (!years_experience) {
                    throw new Error('Années d\'expérience requises pour un chef');
                }
                break;
        }

        // Insert into users table
        const [result] = await connection.query(
            'INSERT INTO users (firstName, lastName, email, password, role, date_creation) VALUES (?, ?, ?, ?, ?, ?)',
            [firstName, lastName, email, password, role.toLowerCase(), date_creation]
        );

        const userId = result.insertId;

        // Based on role, insert into corresponding table
        switch (role.toLowerCase()) {
            case 'employe':
                await connection.query('INSERT INTO employe (user_id) VALUES (?)', [userId]);
                break;
            case 'artisan':
                await connection.query(
                    'INSERT INTO artisan (user_id, specialites, disponible) VALUES (?, ?, true)',
                    [userId, JSON.stringify(specialites)]
                );
                break;
            case 'chef':
                await connection.query(
                    'INSERT INTO chef (user_id, years_experience) VALUES (?, ?)',
                    [userId, years_experience]
                );
                break;
        }

        await connection.commit();
        
        res.status(201).json({
            message: 'Utilisateur créé avec succès',
            userId: userId
        });

    } catch (err) {
        await connection.rollback();
        handleError(err, res);
    } finally {
        connection.release();
    }
});

// PUT user
router.put('/:id', async (req, res) => {
    const userId = parseInt(req.params.id);
    const { firstName, lastName, email, role, specialites, years_experience, oldRole } = req.body;

    if (!firstName || !lastName || !email || !role || !oldRole) {
        throw new Error('Champs obligatoires manquants');
    }

    validateRole(role);
    validateRole(oldRole);

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Vérifier si l'utilisateur existe
        const [users] = await connection.query('SELECT * FROM users WHERE id = ?', [userId]);
        if (users.length === 0) {
            throw new Error('Utilisateur non trouvé');
        }

        // 1. Mettre à jour les informations de base de l'utilisateur
        await connection.query(
            'UPDATE users SET firstName = ?, lastName = ?, email = ?, role = ? WHERE id = ?',
            [firstName, lastName, email, role.toLowerCase(), userId]
        );

        // 2. Si le rôle a changé, gérer les tables spécifiques
        if (oldRole.toLowerCase() !== role.toLowerCase()) {
            // Supprimer l'ancienne entrée selon le rôle
            switch (oldRole.toLowerCase()) {
                case 'artisan':
                    await connection.query('DELETE FROM artisan WHERE user_id = ?', [userId]);
                    break;
                case 'chef':
                    await connection.query('DELETE FROM chef WHERE user_id = ?', [userId]);
                    break;
                case 'employe':
                    await connection.query('DELETE FROM employe WHERE user_id = ?', [userId]);
                    break;
            }

            // Créer la nouvelle entrée selon le nouveau rôle
            switch (role.toLowerCase()) {
                case 'artisan':
                    if (!specialites || !Array.isArray(specialites) || specialites.length === 0) {
                        throw new Error('Spécialités requises pour un artisan');
                    }
                    await connection.query(
                        'INSERT INTO artisan (user_id, specialites, disponible) VALUES (?, ?, true)',
                        [userId, JSON.stringify(specialites)]
                    );
                    break;
                case 'chef':
                    if (!years_experience) {
                        throw new Error('Années d\'expérience requises pour un chef');
                    }
                    await connection.query(
                        'INSERT INTO chef (user_id, years_experience) VALUES (?, ?)',
                        [userId, years_experience]
                    );
                    break;
                case 'employe':
                    await connection.query(
                        'INSERT INTO employe (user_id) VALUES (?)',
                        [userId]
                    );
                    break;
            }
        } else {
            // Si même rôle, mettre à jour les champs spécifiques
            switch (role.toLowerCase()) {
                case 'artisan':
                    if (specialites) {
                        if (!Array.isArray(specialites) || specialites.length === 0) {
                            throw new Error('Spécialités invalides pour un artisan');
                        }
                        await connection.query(
                            'UPDATE artisan SET specialites = ? WHERE user_id = ?',
                            [JSON.stringify(specialites), userId]
                        );
                    }
                    break;
                case 'chef':
                    if (years_experience) {
                        await connection.query(
                            'UPDATE chef SET years_experience = ? WHERE user_id = ?',
                            [years_experience, userId]
                        );
                    }
                    break;
            }
        }

        await connection.commit();
        res.json({ message: 'Utilisateur mis à jour avec succès' });

    } catch (err) {
        await connection.rollback();
        handleError(err, res);
    } finally {
        connection.release();
    }
});

// DELETE user
router.delete('/:id', async (req, res) => {
    const connection = await pool.getConnection();
    let error = null;
    
    try {
        await connection.beginTransaction();
        
        const userId = req.params.id;
        
        // Delete user (cascade will handle related tables)
        const [result] = await connection.query('DELETE FROM users WHERE id = ?', [userId]);
        
        if (result.affectedRows === 0) {
            throw new Error('Utilisateur non trouvé');
        }

        await connection.commit();
        
        res.json({ message: 'Utilisateur supprimé avec succès' });
    } catch (err) {
        error = err;
        try {
            await connection.rollback();
        } catch (rollbackErr) {
            console.error("❌ Erreur lors du rollback:", rollbackErr);
        }
        handleError(err, res);
    } finally {
        connection.release();
    }
});

module.exports = router;
