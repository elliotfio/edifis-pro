const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db'); 
require('dotenv').config();
const verifyToken = require('../middleware/jwtAuth');

const router = express.Router();

router.post('/register', async (req, res) => {
    const { nom, prenom, email, mot_de_passe, role } = req.body;

    try {
        const [rows] = await pool.query('SELECT * FROM utilisateur WHERE email = ?', [email]);
        if (rows.length > 0) return res.status(400).json({ message: 'Email déjà utilisé' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(mot_de_passe, salt);

        await pool.query('INSERT INTO utilisateur (nom, prenom, email, mot_de_passe, role) VALUES (?, ?, ?, ?, ?)',
            [nom, prenom, email, hashedPassword, role || 'employe']
        );

        res.status(201).json({ message: 'Utilisateur créé avec succès' });
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur', error: err });
    }
});



router.post('/login', async (req, res) => {
    const { email, mot_de_passe } = req.body;
    console.log("🔍 Requête reçue pour login :", req.body); 

    try {
        const [[user]] = await pool.query('SELECT * FROM utilisateur WHERE email = ?', [email]);
        console.log("📌 Utilisateur trouvé :", user); 

        if (!user) {
            console.log("❌ Utilisateur non trouvé !");
            return res.status(400).json({ message: 'Identifiants incorrects' });
        }
        console.log(" Mot de passe entré :", mot_de_passe);
        console.log(" Mot de passe en base :", user.mot_de_passe);
        const passwordMatch = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
        
        console.log("🔑 Comparaison des mots de passe :", passwordMatch);

        if (!passwordMatch) {
            return res.status(400).json({ message: 'Identifiants incorrects' });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log("✅ Token généré :", token);

        res.json({ token, user: { id: user.id, nom: user.nom } });

    } catch (error) {
        console.error("🔥 Erreur serveur :", error);
        res.status(500).json({ message: 'Erreur serveur', error });
    }
});
router.get('/users', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM utilisateur');
        console.log("📋 Liste des utilisateurs :", rows);
        res.json(rows);
    } catch (err) {
        console.error("❌ Erreur lors de la récupération :", err);
        res.status(500).json({ message: 'Erreur serveur', error: err });
    }
});
router.get('/users/:id', verifyToken, async (req, res) => {
    try {
        const userId = req.params.id;
        const [[user]] = await pool.query('SELECT * FROM utilisateur WHERE id = ?', [userId]);

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        res.json(user); 
    } catch (err) {
        console.error("❌ Erreur lors de la récupération de l'utilisateur :", err);
        res.status(500).json({ message: 'Erreur serveur', error: err });
    }
});

router.delete('/users/:id', verifyToken, async (req, res) => {
    try {
        const userId = req.params.id;
        const [[user]] = await pool.query('SELECT * FROM utilisateur WHERE id = ?', [userId]);
        
        if (!user) {
            return res.status(404).json({ 
                message: 'Utilisateur non trouvé',
                details: `Aucun utilisateur avec l'ID ${userId} n'existe dans la base de données`
            });
        }
        await pool.query('DELETE FROM utilisateur WHERE id = ?', [userId]);
        
        res.json({ 
            message: 'Utilisateur supprimé avec succès',
            deletedUserId: userId
        });
    } catch (err) {
        res.status(500).json({ 
            message: 'Erreur serveur', 
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});

module.exports = router;


