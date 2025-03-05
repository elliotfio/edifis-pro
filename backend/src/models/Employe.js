const pool = require('../config/db');

class Employe {
    static async findAll() {
        const [employes] = await pool.query('SELECT * FROM employe');
        return employes;
    }

    static async findById(id) {
        const [[employe]] = await pool.query('SELECT * FROM employe WHERE id = ?', [id]);
        return employe;
    }

    static async create(employeData) {
        const { nom, prenom, competences, dateDebut } = employeData;
        const [result] = await pool.query(
            'INSERT INTO employe (nom, prenom, competences, dateDebut) VALUES (?, ?, ?, ?)',
            [nom, prenom, competences, dateDebut]
        );
        return result.insertId;
    }

    static async update(id, employeData) {
        const { nom, prenom, competences, dateDebut } = employeData;
        const [result] = await pool.query(
            'UPDATE employe SET nom = ?, prenom = ?, competences = ?, dateDebut = ? WHERE id = ?',
            [nom, prenom, competences, dateDebut, id]
        );
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await pool.query('DELETE FROM employe WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = Employe; 