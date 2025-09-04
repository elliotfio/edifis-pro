const pool = require('../config/db');

class Worksite {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.address = data.address;
        this.coordinates = data.coordinates;
        this.startDate = data.startDate;
        this.endDate = data.endDate;
        this.status = data.status;
        this.budget = data.budget;
        this.cost = data.cost;
        this.specialities_needed = data.specialities_needed;
        this.chef_id = data.chef_id;
    }

    // Méthodes statiques pour les opérations CRUD
    static async findAll() {
        const [rows] = await pool.query("SELECT * FROM worksites");
        return rows.map(row => new Worksite(row));
    }

    static async findById(id) {
        const [rows] = await pool.query("SELECT * FROM worksites WHERE id = ?", [id]);
        
        if (rows.length === 0) return null;

        const worksite = new Worksite(rows[0]);
        
        // Formater la réponse
        worksite.coordinates = {
            x: parseFloat(rows[0].coordinates.x),
            y: parseFloat(rows[0].coordinates.y),
        };
        worksite.cost = parseFloat(rows[0].cost);
        worksite.budget = parseFloat(rows[0].budget);
        worksite.specialities_needed = rows[0].specialities_needed.split(", ");

        return worksite;
    }

    static async findByStatus(status) {
        const [worksites] = await pool.query(
            "SELECT * FROM worksites WHERE status = ?",
            [status]
        );
        return worksites.map(worksite => new Worksite(worksite));
    }

    static async findByChefId(chefId) {
        const [worksites] = await pool.query(
            "SELECT * FROM worksites WHERE chef_id = ?",
            [chefId]
        );
        return worksites.map(worksite => new Worksite(worksite));
    }

    static async create(worksiteData) {
        const {
            id,
            name,
            address,
            coordinates,
            startDate,
            endDate,
            status = "attributed",
            budget,
            cost,
            specialities_needed,
        } = worksiteData;

        // Générer un ID unique si non fourni
        const worksite_id = id || Math.floor(Math.random() * 10000).toString();

        // Gestion des spécialités (peut être une chaîne ou un tableau)
        let specialitiesString = Array.isArray(specialities_needed)
            ? specialities_needed.join(", ")
            : specialities_needed;

        const query = `
            INSERT INTO worksites (
                id,
                name,
                address,
                coordinates,
                startDate,
                endDate,
                status,
                budget,
                cost,
                specialities_needed
            ) VALUES (?, ?, ?, POINT(?, ?), ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            worksite_id,
            name,
            address,
            coordinates.x,
            coordinates.y,
            startDate,
            endDate,
            status,
            budget,
            cost,
            specialitiesString,
        ];

        await pool.query(query, values);
        return await Worksite.findById(worksite_id);
    }

    static async update(id, worksiteData) {
        const {
            name,
            address,
            coordinates,
            startDate,
            endDate,
            status,
            budget,
            cost,
            specialities_needed,
        } = worksiteData;

        // Gestion des spécialités (peut être une chaîne ou un tableau)
        let specialitiesString = Array.isArray(specialities_needed)
            ? specialities_needed.join(", ")
            : specialities_needed;

        const query = `
            UPDATE worksites 
            SET name = ?,
                address = ?,
                coordinates = POINT(?, ?),
                startDate = ?,
                endDate = ?,
                status = ?,
                budget = ?,
                cost = ?,
                specialities_needed = ?
            WHERE id = ?
        `;

        const values = [
            name,
            address,
            coordinates.x,
            coordinates.y,
            startDate,
            endDate,
            status,
            budget,
            cost,
            specialitiesString,
            id,
        ];

        await pool.query(query, values);
        return await Worksite.findById(id);
    }

    static async delete(id) {
        const [result] = await pool.query("DELETE FROM worksites WHERE id = ?", [id]);
        return result.affectedRows > 0;
    }

    static async exists(id) {
        const [existingWorksite] = await pool.query(
            "SELECT * FROM worksites WHERE id = ?",
            [id]
        );
        return existingWorksite.length > 0;
    }

    // Méthodes de validation
    static validateCoordinates(coordinates) {
        return coordinates && 
               typeof coordinates === "object" && 
               coordinates.x && 
               coordinates.y;
    }

    static validateRequiredFields(data) {
        const requiredFields = [
            "name",
            "address",
            "coordinates",
            "budget",
            "cost",
            "specialities_needed",
            "startDate",
            "endDate",
        ];
        
        return requiredFields.filter(field => !data[field]);
    }
}

module.exports = Worksite;
