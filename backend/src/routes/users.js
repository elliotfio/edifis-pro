const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET all users
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, firstName, lastName, email, role, date_creation FROM users');
        res.json(rows);
    } catch (err) {
        console.error("❌ Erreur lors de la récupération des utilisateurs:", err);
        res.status(500).json({ message: 'Erreur serveur', error: err });
    }
});

// GET user by ID
router.get('/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const [[user]] = await pool.query('SELECT id, firstName, lastName, email, role, date_creation FROM users WHERE id = ?', [userId]);
        
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        res.json(user);
    } catch (err) {
        console.error("❌ Erreur lors de la récupération de l'utilisateur:", err);
        res.status(500).json({ message: 'Erreur serveur', error: err });
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
                if (!specialites || !Array.isArray(specialites) || specialites.length === 0) {
                    throw new Error('Spécialités requises pour un artisan');
                }
                await connection.query(
                    'INSERT INTO artisan (user_id, specialites, disponible) VALUES (?, ?, true)',
                    [userId, specialites.join(', ')]
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
            default:
                throw new Error('Role invalide');
        }

        await connection.commit();
        
        res.status(201).json({
            message: 'Utilisateur créé avec succès',
            userId: userId
        });

    } catch (err) {
        await connection.rollback();
        console.error("❌ Erreur lors de la création de l'utilisateur:", err);
        res.status(400).json({ message: err.message || 'Erreur lors de la création de l\'utilisateur' });
    } finally {
        connection.release();
    }
});

module.exports = router;
