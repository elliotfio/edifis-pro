const jwt = require('jsonwebtoken');

    const authentificationJeton = (req, res, next) => {
        const jeton = req.headers.authorization?.split(' ')[1]; // Extraction du jeton

        if (!jeton) {
            return res.status(401).json({ message: 'Jeton d\'authentification manquant.' });
        }

        try {
            const decoded = jwt.verify(jeton, 'votre_clé_secrète'); // Vérification du jeton
            req.utilisateur = decoded; // Ajout des informations de l'utilisateur à la requête
            next(); // Passage au prochain middleware ou à la route
        } catch (error) {
            return res.status(401).json({ message: 'Jeton d\'authentification invalide.' });
        }
    };

    module.exports = authentificationJeton;