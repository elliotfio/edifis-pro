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
        const password = `${lastName}.${firstName}`;
        const date_creation = new Date().toISOString().split('T')[0];

        // Based on role, validate required fields
        switch (role?.toLowerCase()) {
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
            case 'employe':
                break;
            default:
                throw new Error('Role invalide');
        }

        // Insert into users table
        const [result] = await connection.query(
            'INSERT INTO users (firstName, lastName, email, password, role, date_creation) VALUES (?, ?, ?, ?, ?, ?)',
            [firstName, lastName, email, password, role, date_creation]
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
                    [userId, specialites.join(', ')]
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
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        const userId = req.params.id;
        const { firstName, lastName, email, role, specialites, years_experience } = req.body;
        
        // Check if user exists
        const [[existingUser]] = await connection.query(
            'SELECT role FROM users WHERE id = ?',
            [userId]
        );
        
        if (!existingUser) {
            throw new Error('Utilisateur non trouvé');
        }

        // Update users table
        const updates = [];
        const values = [];
        if (firstName) {
            updates.push('firstName = ?');
            values.push(firstName);
        }
        if (lastName) {
            updates.push('lastName = ?');
            values.push(lastName);
        }
        if (email) {
            updates.push('email = ?');
            values.push(email);
        }

        if (updates.length > 0) {
            values.push(userId);
            await connection.query(
                `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
                values
            );
        }

        // Update role specific info
        switch (existingUser.role.toLowerCase()) {
            case 'artisan':
                if (specialites && Array.isArray(specialites)) {
                    await connection.query(
                        'UPDATE artisan SET specialites = ? WHERE user_id = ?',
                        [specialites.join(', '), userId]
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
