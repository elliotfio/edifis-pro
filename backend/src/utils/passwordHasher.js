const pool = require("../config/db");
const generateHash = require("../../generateHash");

/**
 * Vérifie et hashe les mots de passe non hashés dans la base de données
 */
async function checkAndHashPasswords() {
  console.log("🔒 Vérification des mots de passe non hashés...");

  try {
    // Récupérer tous les utilisateurs
    const [users] = await pool.query("SELECT id, password FROM users");
    let hashedCount = 0;

    for (const user of users) {
      // Vérifier si le mot de passe est déjà hashé (les hashs bcrypt commencent par $2a$, $2b$ ou $2y$)
      if (!user.password.startsWith("$2")) {
        console.log(
          `Hachage du mot de passe pour l'utilisateur ID ${user.id}...`
        );

        // Hasher le mot de passe
        const hashedPassword = await generateHash(user.password);

        // Mettre à jour le mot de passe dans la base de données
        await pool.query("UPDATE users SET password = ? WHERE id = ?", [
          hashedPassword,
          user.id,
        ]);

        hashedCount++;
      }
    }

    if (hashedCount > 0) {
      console.log(
        `✅ ${hashedCount} mot(s) de passe ont été hashés avec succès.`
      );
    } else {
      console.log("✅ Tous les mots de passe sont déjà hashés.");
    }
  } catch (error) {
    console.error(
      "❌ Erreur lors de la vérification/hachage des mots de passe:",
      error
    );
  }
}

module.exports = checkAndHashPasswords;
