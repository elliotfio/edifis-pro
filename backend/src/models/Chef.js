const pool = require('../config/db');

class Chef {
    constructor(data) {
        this.user_id = data.user_id;
        this.years_experience = data.years_experience;
        this.current_worksite = data.current_worksite;
        
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
        const [chefs] = await pool.query(`
            SELECT c.*, u.firstName, u.lastName, u.email, u.role, u.date_creation
            FROM chef c
            INNER JOIN users u ON c.user_id = u.id
            WHERE u.role = 'chef'
        `);

        return chefs.map(chef => new Chef(chef));
    }

    static async findByUserId(userId) {
        const [[chef]] = await pool.query(`
            SELECT c.*, u.firstName, u.lastName, u.email, u.role, u.date_creation
            FROM chef c
            INNER JOIN users u ON c.user_id = u.id
            WHERE c.user_id = ? AND u.role = 'chef'
        `, [userId]);

        return chef ? new Chef(chef) : null;
    }

    static async create(userId, chefData) {
        const { years_experience } = chefData;

        await pool.query(
            "INSERT INTO chef (user_id, years_experience) VALUES (?, ?)",
            [userId, years_experience]
        );

        return await Chef.findByUserId(userId);
    }

    static async update(userId, chefData) {
        const { years_experience } = chefData;

        if (years_experience !== undefined) {
            await pool.query(
                "UPDATE chef SET years_experience = ? WHERE user_id = ?",
                [years_experience, userId]
            );
        }

        return await Chef.findByUserId(userId);
    }

    static async delete(userId) {
        const [result] = await pool.query("DELETE FROM chef WHERE user_id = ?", [userId]);
        return result.affectedRows > 0;
    }

    static async exists(userId) {
        const [[chef]] = await pool.query(`
            SELECT c.* FROM chef c
            INNER JOIN users u ON c.user_id = u.id
            WHERE c.user_id = ? AND u.role = 'chef'
        `, [userId]);

        return !!chef;
    }
}

module.exports = Chef;
