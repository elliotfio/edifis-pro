const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    try {
        // Récupérer le token du header Authorization
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: "Aucun token fourni" });
        }

        // Vérifier le format du token (Bearer <token>)
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: "Format de token invalide" });
        }

        // Vérifier et décoder le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Ajouter les informations de l'utilisateur à l'objet request
        req.user = decoded;
        
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token expiré" });
        }
        return res.status(401).json({ message: "Token invalide" });
    }
};

module.exports = verifyToken;
