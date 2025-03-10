const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// Get all worksites
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM worksites");
    res.json(rows);
  } catch (err) {
    console.error("❌ Erreur lors de la récupération des chantiers:", err);
    res.status(500).json({ message: "Erreur serveur", error: err });
  }
});

// Get worksite by ID
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM worksites WHERE id = ?", [
      req.params.id,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Chantier non trouvé" });
    }

    // Formater la réponse
    const worksite = {
      ...rows[0],
      coordinates: {
        x: parseFloat(rows[0].coordinates.x),
        y: parseFloat(rows[0].coordinates.y),
      },
      cost: parseFloat(rows[0].cost),
      budget: parseFloat(rows[0].budget),
      specialities_needed: rows[0].specialities_needed.split(", "),
    };

    res.json(worksite);
  } catch (err) {
    console.error("❌ Erreur lors de la récupération du chantier:", err);
    res.status(500).json({ message: "Erreur serveur", error: err });
  }
});

// Add a new worksite
router.post("/", async (req, res) => {
  try {
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
    } = req.body;

    // Validation des données requises
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
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: "Données manquantes",
        missingFields,
      });
    }

    // Validation supplémentaire pour coordinates
    if (
      !coordinates ||
      typeof coordinates !== "object" ||
      !coordinates.x ||
      !coordinates.y
    ) {
      return res.status(400).json({
        message: "Coordonnées invalides",
        required: "Les coordonnées doivent avoir x et y",
      });
    }

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
    res.status(201).json({
      message: "Chantier créé avec succès",
      worksite_id: worksite_id,
    });
  } catch (err) {
    console.error("❌ Erreur lors de la création du chantier:", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

// Update a worksite
router.put("/:id", async (req, res) => {
  try {
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
    } = req.body;

    // Validation des données requises
    const requiredFields = [
      "name",
      "address",
      "coordinates",
      "budget",
      "cost",
      "specialities_needed",
      "startDate",
      "endDate",
      "status",
    ];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: "Données manquantes",
        missingFields,
      });
    }

    // Validation supplémentaire pour coordinates
    if (
      !coordinates ||
      typeof coordinates !== "object" ||
      !coordinates.x ||
      !coordinates.y
    ) {
      return res.status(400).json({
        message: "Coordonnées invalides",
        required: "Les coordonnées doivent avoir x et y",
      });
    }

    // Vérifier si le chantier existe
    const [existingWorksite] = await pool.query(
      "SELECT * FROM worksites WHERE id = ?",
      [req.params.id]
    );

    if (existingWorksite.length === 0) {
      return res.status(404).json({ message: "Chantier non trouvé" });
    }

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
      req.params.id,
    ];

    await pool.query(query, values);

    // Récupérer le chantier mis à jour
    const [updatedWorksite] = await pool.query(
      "SELECT * FROM worksites WHERE id = ?",
      [req.params.id]
    );

    // Formater la réponse
    const formattedWorksite = {
      ...updatedWorksite[0],
      coordinates: {
        x: parseFloat(updatedWorksite[0].coordinates.x),
        y: parseFloat(updatedWorksite[0].coordinates.y),
      },
      cost: parseFloat(updatedWorksite[0].cost),
      budget: parseFloat(updatedWorksite[0].budget),
      specialities_needed: updatedWorksite[0].specialities_needed.split(", "),
    };

    res.json({
      message: "Chantier mis à jour avec succès",
      worksite: formattedWorksite,
    });
  } catch (err) {
    console.error("❌ Erreur lors de la mise à jour du chantier:", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

// Delete a worksite
router.delete("/:id", async (req, res) => {
  try {
    // Vérifier si le chantier existe
    const [existingWorksite] = await pool.query(
      "SELECT * FROM worksites WHERE id = ?",
      [req.params.id]
    );

    if (existingWorksite.length === 0) {
      return res.status(404).json({ message: "Chantier non trouvé" });
    }

    // Supprimer le chantier
    await pool.query("DELETE FROM worksites WHERE id = ?", [req.params.id]);

    res.json({ message: "Chantier supprimé avec succès" });
  } catch (err) {
    console.error("❌ Erreur lors de la suppression du chantier:", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

// Ajouter ces routes
router.get("/status/:status", async (req, res) => {
  try {
    const { status } = req.params;
    const [worksites] = await pool.query(
      "SELECT * FROM worksites WHERE status = ?",
      [status]
    );
    res.status(200).json(worksites);
  } catch (error) {
    console.error("Erreur lors de la récupération des chantiers:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

router.get("/chef/:chef_id", async (req, res) => {
  try {
    const { chef_id } = req.params;
    const [worksites] = await pool.query(
      "SELECT * FROM worksites WHERE chef_id = ?",
      [chef_id]
    );
    res.status(200).json(worksites);
  } catch (error) {
    console.error("Erreur lors de la récupération des chantiers:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
