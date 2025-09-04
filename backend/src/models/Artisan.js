const pool = require('../config/db');

class Artisan {
    constructor(data) {
        this.user_id = data.user_id;
        this.specialites = data.specialites;
        this.disponible = data.disponible;
        this.note_moyenne = data.note_moyenne;
        this.current_worksite = data.current_worksite;
        this.history_worksite = data.history_worksite;
        this.years_experience = data.years_experience;
        
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
        const [artisans] = await pool.query(`
            SELECT a.*, u.firstName, u.lastName, u.email, u.role, u.date_creation
            FROM artisan a
            INNER JOIN users u ON a.user_id = u.id
            WHERE u.role = 'artisan'
        `);

        return artisans.map(artisan => {
            const artisanInstance = new Artisan(artisan);
            // Formater les spécialités en tableau
            artisanInstance.specialites = artisan.specialites ? artisan.specialites.split(',') : [];
            return artisanInstance;
        });
    }

    static async findByUserId(userId) {
        const [[artisan]] = await pool.query(`
            SELECT a.*, u.firstName, u.lastName, u.email, u.role, u.date_creation
            FROM artisan a
            INNER JOIN users u ON a.user_id = u.id
            WHERE a.user_id = ? AND u.role = 'artisan'
        `, [userId]);

        if (!artisan) return null;

        const artisanInstance = new Artisan(artisan);
        // Formater les spécialités en tableau
        artisanInstance.specialites = artisan.specialites ? artisan.specialites.split(',') : [];
        return artisanInstance;
    }

    static async create(userId, artisanData) {
        const { specialites } = artisanData;
        const specialitesString = Array.isArray(specialites) ? specialites.join(',') : specialites;

        await pool.query(`
            INSERT INTO artisan (
                user_id,
                specialites,
                disponible,
                note_moyenne,
                current_worksite,
                history_worksite
            )
            VALUES (?, ?, true, 0, NULL, NULL)
        `, [userId, specialitesString]);

        return await Artisan.findByUserId(userId);
    }

    static async update(userId, artisanData) {
        const updateFields = [];
        const updateValues = [];

        if (artisanData.specialites) {
            const specialitesString = Array.isArray(artisanData.specialites) 
                ? artisanData.specialites.join(',') 
                : artisanData.specialites;
            updateFields.push('specialites = ?');
            updateValues.push(specialitesString);
        }

        if (artisanData.years_experience !== undefined) {
            updateFields.push('years_experience = ?');
            updateValues.push(artisanData.years_experience);
        }

        if (artisanData.disponible !== undefined) {
            updateFields.push('disponible = ?');
            updateValues.push(artisanData.disponible);
        }

        if (updateFields.length > 0) {
            updateValues.push(userId);
            await pool.query(`
                UPDATE artisan 
                SET ${updateFields.join(', ')}
                WHERE user_id = ?
            `, updateValues);
        }

        return await Artisan.findByUserId(userId);
    }

    static async delete(userId) {
        const [result] = await pool.query('DELETE FROM artisan WHERE user_id = ?', [userId]);
        return result.affectedRows > 0;
    }

    static async exists(userId) {
        const [[artisan]] = await pool.query(`
            SELECT a.* FROM artisan a
            INNER JOIN users u ON a.user_id = u.id
            WHERE a.user_id = ? AND u.role = 'artisan'
        `, [userId]);

        return !!artisan;
    }
}

module.exports = Artisan;
