const cron = require("node-cron");

// Fonction pour attribuer les chefs et artisans aux chantiers
async function assignWorksites() {
  console.log("🕒 Exécution du CRON d'attribution des chantiers");

  // Importer le pool depuis le module parent
  const pool = require("../../server").pool;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Récupérer les chefs de chantier disponibles
    const [availableChefs] = await connection.query(`
      SELECT c.user_id, c.years_experience 
      FROM chef c
      WHERE c.current_worksite IS NULL OR c.current_worksite = ''
      ORDER BY c.years_experience DESC
    `);

    console.log(`✅ Chefs disponibles: ${availableChefs.length}`);

    if (availableChefs.length === 0) {
      console.log("❌ Aucun chef de chantier disponible");
      return;
    }

    // 2. Récupérer les chantiers sans chef, du plus ancien au plus récent
    const [pendingWorksites] = await connection.query(`
      SELECT id, name, specialities_needed, created_at
      FROM worksites
      WHERE status = 'no_attributed'
      ORDER BY created_at ASC
    `);

    console.log(`✅ Chantiers en attente: ${pendingWorksites.length}`);

    if (pendingWorksites.length === 0) {
      console.log("❌ Aucun chantier en attente");
      return;
    }

    // 3. Pour chaque chef disponible, attribuer un chantier
    for (
      let i = 0;
      i < Math.min(availableChefs.length, pendingWorksites.length);
      i++
    ) {
      const chef = availableChefs[i];
      const worksite = pendingWorksites[i];

      console.log(
        `🔄 Attribution du chef ${chef.user_id} au chantier ${worksite.id}`
      );

      // Mettre à jour le chef avec le nouveau chantier
      await connection.query(
        `
        UPDATE chef 
        SET current_worksite = ?
        WHERE user_id = ?
      `,
        [worksite.id, chef.user_id]
      );

      // Mettre à jour le chantier avec le chef
      // Le statut passe à 'attributed' dès qu'un chef est assigné
      await connection.query(
        `
        UPDATE worksites 
        SET chef_id = ?, status = 'attributed'
        WHERE id = ?
      `,
        [chef.user_id, worksite.id]
      );

      // 4. Récupérer les spécialités nécessaires pour ce chantier
      const specialitiesNeeded = worksite.specialities_needed
        .split(",")
        .map((s) => s.trim());
      console.log(
        `✅ Spécialités nécessaires: ${specialitiesNeeded.join(", ")}`
      );

      let allSpecialitiesAssigned = true;

      // 5. Pour chaque spécialité, attribuer un artisan disponible
      for (const speciality of specialitiesNeeded) {
        // Rechercher un artisan disponible avec cette spécialité
        const [availableArtisans] = await connection.query(
          `
          SELECT a.user_id 
          FROM artisan a
          WHERE a.disponible = true 
          AND a.specialites LIKE ?
          LIMIT 1
        `,
          [`%${speciality}%`]
        );

        if (availableArtisans.length > 0) {
          const artisanId = availableArtisans[0].user_id;

          // Vérifier si la table affectations existe
          try {
            await connection.query(`
              SELECT 1 FROM affectations LIMIT 1
            `);
          } catch (error) {
            // Créer la table si elle n'existe pas
            await connection.query(`
              CREATE TABLE IF NOT EXISTS affectations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                artisan_id VARCHAR(255) NOT NULL,
                chantier_id VARCHAR(255) NOT NULL,
                specialite VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
              )
            `);
            console.log("✅ Table affectations créée");
          }

          // Créer une affectation pour cet artisan
          await connection.query(
            `
            INSERT INTO affectations (artisan_id, chantier_id, specialite)
            VALUES (?, ?, ?)
          `,
            [artisanId, worksite.id, speciality]
          );

          // Mettre à jour la disponibilité de l'artisan
          await connection.query(
            `
            UPDATE artisan 
            SET disponible = false
            WHERE user_id = ?
          `,
            [artisanId]
          );

          console.log(
            `✅ Artisan ${artisanId} assigné au chantier ${worksite.id} pour la spécialité ${speciality}`
          );
        } else {
          console.log(
            `❌ Aucun artisan disponible pour la spécialité ${speciality}`
          );
          allSpecialitiesAssigned = false;
        }
      }

      // 6. Si toutes les spécialités ont été assignées, passer le chantier en "planified"
      // Sinon, il reste en "attributed" (déjà fait à l'étape 3)
      if (allSpecialitiesAssigned) {
        await connection.query(
          `
          UPDATE worksites 
          SET status = 'planified'
          WHERE id = ?
        `,
          [worksite.id]
        );

        console.log(`✅ Chantier ${worksite.id} planifié avec succès`);
      } else {
        console.log(
          `ℹ️ Chantier ${worksite.id} attribué à un chef mais en attente d'artisans`
        );
      }
    }

    await connection.commit();
    console.log("✅ Attribution des chantiers terminée avec succès");
  } catch (error) {
    await connection.rollback();
    console.error("❌ Erreur lors de l'attribution des chantiers:", error);
  } finally {
    connection.release();
  }
}

// Planifier le CRON pour s'exécuter tous les jours à minuit (heure de Paris)
cron.schedule("0 0 * * *", assignWorksites, {
  scheduled: true,
  timezone: "Europe/Paris",
});

// Exporter la fonction pour pouvoir la tester manuellement
module.exports = assignWorksites;
