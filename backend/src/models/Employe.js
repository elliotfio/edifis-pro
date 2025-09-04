const pool = require('../config/db');

class Employe {
    constructor(data) {
        this.user_id = data.user_id;
        
        // Propriétés de l'utilisateur si incluses
        if (data.firstName) {
            this.firstName = data.firstName;
            this.lastName = data.lastName;
            this.email = data.email;
            this.role = data.role;
            this.date_creation = data.date_creation;
        }
    }

    // Méthodes statiques pour les opérations CRUD
    static async findAll() {
        const [employes] = await pool.query(`
            SELECT e.*, u.firstName, u.lastName, u.email, u.role, u.date_creation
            FROM employe e
            INNER JOIN users u ON e.user_id = u.id
            WHERE u.role = 'employe'
        `);

        return employes.map(employe => new Employe(employe));
    }

    static async findByUserId(userId) {
        const [[employe]] = await pool.query(`
            SELECT e.*, u.firstName, u.lastName, u.email, u.role, u.date_creation
            FROM employe e
            INNER JOIN users u ON e.user_id = u.id
            WHERE e.user_id = ? AND u.role = 'employe'
        `, [userId]);

        return employe ? new Employe(employe) : null;
    }

    static async create(userId) {
        await pool.query("INSERT INTO employe (user_id) VALUES (?)", [userId]);
        return await Employe.findByUserId(userId);
    }

    static async delete(userId) {
        const [result] = await pool.query("DELETE FROM employe WHERE user_id = ?", [userId]);
        return result.affectedRows > 0;
    }

    static async exists(userId) {
        const [[employe]] = await pool.query(`
            SELECT e.* FROM employe e
            INNER JOIN users u ON e.user_id = u.id
            WHERE e.user_id = ? AND u.role = 'employe'
        `, [userId]);

        return !!employe;
    }
}

module.exports = Employe;
