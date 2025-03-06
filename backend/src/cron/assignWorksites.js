const cron = require("node-cron");

// Fonction pour attribuer les chefs et artisans aux chantiers
async function assignWorksites() {
  console.log("🕒 Exécution du CRON d'attribution des chantiers");

  // Importer le pool depuis le module parent
  const pool = require("../../server").pool;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Créer la table affectations si elle n'existe pas
    await connection.query(`
      CREATE TABLE IF NOT EXISTS affectations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        worksite_id INT NOT NULL,
        artisan_id INT NOT NULL,
        specialite VARCHAR(255) NOT NULL,
        date_affectation DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (worksite_id) REFERENCES worksites(id) ON DELETE CASCADE,
        FOREIGN KEY (artisan_id) REFERENCES artisan(user_id) ON DELETE CASCADE
      )
    `);

    // Récupérer les chefs disponibles
    const [chefs] = await connection.query(
      "SELECT user_id, years_experience FROM chef WHERE current_worksite IS NULL ORDER BY years_experience DESC"
    );

    console.log(`✅ Chefs disponibles: ${chefs.length}`);

    if (chefs.length === 0) {
      console.log("❌ Aucun chef de chantier disponible");
      await connection.commit();
      return;
    }

    // Récupérer les chantiers en attente
    const [pendingWorksites] = await connection.query(
      "SELECT id, name, specialities_needed, created_at FROM worksites WHERE status = 'attributed' ORDER BY created_at ASC"
    );

    console.log(`✅ Chantiers en attente: ${pendingWorksites.length}`);

    if (pendingWorksites.length === 0) {
      console.log("❌ Aucun chantier en attente");
      await connection.commit();
      return;
    }

    // 3. Pour chaque chef disponible, attribuer un chantier
    for (let i = 0; i < Math.min(chefs.length, pendingWorksites.length); i++) {
      const chef = chefs[i];
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

          // Créer une affectation pour cet artisan
          await connection.query(
            `
            INSERT INTO affectations (worksite_id, artisan_id, specialite)
            VALUES (?, ?, ?)
          `,
            [worksite.id, artisanId, speciality]
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
