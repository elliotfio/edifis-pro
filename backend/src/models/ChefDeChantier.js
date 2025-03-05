const pool = require('../config/db');

class ChefDeChantier {
    static async findAll() {
        const [chefs] = await pool.query(`
            SELECT c.*, e.nom, e.prenom, e.competences, e.dateDebut 
            FROM chefdechantier c 
            JOIN employe e ON c.employe_id = e.id
        `);
        return chefs;
    }


    static async findById(id) {
        const [[chef]] = await pool.query(`
                    SELECT c.*, e.nom, e.prenom, e.competences, e.dateDebut 
                    FROM chefdechantier c 
                    JOIN employe e ON c.employe_id = e.id 
                    WHERE c.id = ?
        `, [id]);
        return chef;
    }

    static async create(chefData) {
        const { employe_id, niveau_experience } = chefData;
        const [result] = await pool.query(
            'INSERT INTO chefdechantier (employe_id, niveau_experience) VALUES (?, ?)',
            [employe_id, niveau_experience]
        );
        return result.insertId;
    }

    static async update(id, chefData) {
        const { niveau_experience } = chefData;
        const [result] = await pool.query(
            'UPDATE chefdechantier SET niveau_experience = ? WHERE id = ?',
            [niveau_experience, id]
        );
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await pool.query('DELETE FROM chefdechantier WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = ChefDeChantier; 