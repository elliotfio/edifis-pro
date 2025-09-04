const pool = require('../config/db');

class BruteForceProtection {
    constructor() {
        // Délais d'attente en millisecondes
        this.delays = [
            30 * 1000,      // 30 secondes après la 1ère tentative échouée
            2 * 60 * 1000,  // 2 minutes après la 2ème tentative échouée
            15 * 60 * 1000, // 15 minutes après la 3ème tentative échouée
        ];
        this.maxAttempts = 3;
        
        // Créer la table si elle n'existe pas
        this.initTable();
    }

    async initTable() {
        try {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS login_attempts (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    email VARCHAR(255) NOT NULL,
                    attempt_count INT DEFAULT 0,
                    last_attempt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    locked_until TIMESTAMP NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_email (email),
                    INDEX idx_locked_until (locked_until)
                )
            `);
        } catch (error) {
            console.error('Erreur lors de la création de la table login_attempts:', error);
        }
    }

    async checkAttempts(email) {
        try {
            // Nettoyer les anciens enregistrements (plus de 24h)
            await pool.query(`
                DELETE FROM login_attempts 
                WHERE last_attempt < DATE_SUB(NOW(), INTERVAL 24 HOUR)
            `);

            const [[record]] = await pool.query(`
                SELECT * FROM login_attempts WHERE email = ?
            `, [email]);

            if (!record) {
                return { allowed: true, remainingTime: 0, attemptCount: 0 };
            }

            // Vérifier si le compte est actuellement verrouillé
            if (record.locked_until && new Date() < new Date(record.locked_until)) {
                const remainingTime = Math.ceil((new Date(record.locked_until) - new Date()) / 1000);
                return { 
                    allowed: false, 
                    remainingTime,
                    attemptCount: record.attempt_count,
                    requiresPasswordReset: record.attempt_count > this.maxAttempts
                };
            }

            // Si le délai de verrouillage est passé, réinitialiser
            if (record.locked_until && new Date() >= new Date(record.locked_until)) {
                await pool.query(`
                    UPDATE login_attempts 
                    SET attempt_count = 0, locked_until = NULL 
                    WHERE email = ?
                `, [email]);
                return { allowed: true, remainingTime: 0, attemptCount: 0 };
            }

            return { 
                allowed: true, 
                remainingTime: 0, 
                attemptCount: record.attempt_count,
                requiresPasswordReset: record.attempt_count > this.maxAttempts
            };

        } catch (error) {
            console.error('Erreur lors de la vérification des tentatives:', error);
            // En cas d'erreur, permettre la connexion pour ne pas bloquer complètement
            return { allowed: true, remainingTime: 0, attemptCount: 0 };
        }
    }

    async recordFailedAttempt(email) {
        try {
            // Vérifier s'il existe déjà un enregistrement
            const [[record]] = await pool.query(`
                SELECT * FROM login_attempts WHERE email = ?
            `, [email]);

            if (!record) {
                // Premier échec
                await pool.query(`
                    INSERT INTO login_attempts (email, attempt_count, last_attempt) 
                    VALUES (?, 1, NOW())
                `, [email]);
                return { attemptCount: 1, lockedUntil: null };
            }

            const newAttemptCount = record.attempt_count + 1;
            let lockedUntil = null;

            // Calculer le délai de verrouillage selon le nombre de tentatives
            if (newAttemptCount <= this.maxAttempts) {
                const delayIndex = Math.min(newAttemptCount - 1, this.delays.length - 1);
                const delay = this.delays[delayIndex];
                lockedUntil = new Date(Date.now() + delay);
            } else {
                // Plus de 3 tentatives = demander réinitialisation du mot de passe
                // Verrouiller indéfiniment jusqu'à réinitialisation
                lockedUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 an
            }

            await pool.query(`
                UPDATE login_attempts 
                SET attempt_count = ?, last_attempt = NOW(), locked_until = ?
                WHERE email = ?
            `, [newAttemptCount, lockedUntil, email]);

            return { 
                attemptCount: newAttemptCount, 
                lockedUntil,
                requiresPasswordReset: newAttemptCount > this.maxAttempts
            };

        } catch (error) {
            console.error('Erreur lors de l\'enregistrement de la tentative échouée:', error);
            return { attemptCount: 0, lockedUntil: null };
        }
    }

    async recordSuccessfulLogin(email) {
        try {
            // Supprimer l'enregistrement des tentatives échouées
            await pool.query(`
                DELETE FROM login_attempts WHERE email = ?
            `, [email]);
        } catch (error) {
            console.error('Erreur lors de la suppression des tentatives:', error);
        }
    }

    async resetAttempts(email) {
        try {
            await pool.query(`
                DELETE FROM login_attempts WHERE email = ?
            `, [email]);
            return true;
        } catch (error) {
            console.error('Erreur lors de la réinitialisation des tentatives:', error);
            return false;
        }
    }

    formatRemainingTime(seconds) {
        if (seconds < 60) {
            return `${seconds} seconde${seconds > 1 ? 's' : ''}`;
        } else if (seconds < 3600) {
            const minutes = Math.ceil(seconds / 60);
            return `${minutes} minute${minutes > 1 ? 's' : ''}`;
        } else {
            const hours = Math.ceil(seconds / 3600);
            return `${hours} heure${hours > 1 ? 's' : ''}`;
        }
    }
}

module.exports = new BruteForceProtection();


