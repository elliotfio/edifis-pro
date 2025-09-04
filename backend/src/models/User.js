const pool = require('../config/db');

class User {
    constructor(data) {
        this.id = data.id;
        this.firstName = data.firstName;
        this.lastName = data.lastName;
        this.email = data.email;
        this.password = data.password;
        this.role = data.role;
        this.date_creation = data.date_creation;
    }

    // Méthodes statiques pour les opérations CRUD
    static async findAll() {
        const [rows] = await pool.query(
            "SELECT id, firstName, lastName, email, role, date_creation FROM users"
        );
        return rows.map(row => new User(row));
    }

    static async findById(id) {
        const [[user]] = await pool.query(
            "SELECT id, firstName, lastName, email, role, date_creation FROM users WHERE id = ?",
            [id]
        );
        return user ? new User(user) : null;
    }

    static async findByEmail(email) {
        const [[user]] = await pool.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );
        return user ? new User(user) : null;
    }

    static async create(userData) {
        const { firstName, lastName, email, password, role } = userData;
        const date_creation = new Date().toISOString().split("T")[0];
        
        const [result] = await pool.query(
            "INSERT INTO users (firstName, lastName, email, password, role, date_creation) VALUES (?, ?, ?, ?, ?, ?)",
            [firstName, lastName, email, password, role.toLowerCase(), date_creation]
        );
        
        return result.insertId;
    }

    static async update(id, userData) {
        const { firstName, lastName, email, role, password } = userData;
        
        await pool.query(
            "UPDATE users SET firstName = ?, lastName = ?, email = ?, role = ?, password = ? WHERE id = ?",
            [firstName, lastName, email, role.toLowerCase(), password, id]
        );
        
        return await User.findById(id);
    }

    static async updatePassword(id, hashedPassword) {
        await pool.query(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, id]
        );
    }

    static async delete(id) {
        const [result] = await pool.query("DELETE FROM users WHERE id = ?", [id]);
        return result.affectedRows > 0;
    }

    static async checkEmailExists(email, excludeId = null) {
        let query = "SELECT id FROM users WHERE email = ?";
        let params = [email];
        
        if (excludeId) {
            query += " AND id != ?";
            params.push(excludeId);
        }
        
        const [existingUsers] = await pool.query(query, params);
        return existingUsers.length > 0;
    }

    // Méthode pour obtenir les informations sans le mot de passe
    toSafeObject() {
        const { password, ...safeUser } = this;
        return safeUser;
    }
}

module.exports = User;
