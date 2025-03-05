         const pool = require('../config/db');

         class Artisan {
            static async findAll() {
               const [artisans] = await pool.query(`
                     SELECT a.*, e.nom, e.prenom, e.competences, e.dateDebut 
                     FROM artisan a 
                     JOIN employe e ON a.employe_id = e.id
               `);
               return artisans;
            }

            static async findById(id) {
               const [[artisan]] = await pool.query(`
                     SELECT a.*, e.nom, e.prenom, e.competences, e.dateDebut 
                     FROM artisan a 
                     JOIN employe e ON a.employe_id = e.id 
                     WHERE a.id = ?
               `, [id]);
               return artisan;
            }

            static async create(artisanData) {
               const { employe_id, specialite } = artisanData;
               const [result] = await pool.query(
                     'INSERT INTO artisan (employe_id, specialite) VALUES (?, ?)',
                     [employe_id, specialite]
               );
               return result.insertId;
            }

            static async update(id, artisanData) {
               const { specialite } = artisanData;
               const [result] = await pool.query(
                     'UPDATE artisan SET specialite = ? WHERE id = ?',
                     [specialite, id]
               );
               return result.affectedRows > 0;
            }

            static async delete(id) {
               const [result] = await pool.query('DELETE FROM artisan WHERE id = ?', [id]);
               return result.affectedRows > 0;
            }
         }

         module.exports = Artisan; 