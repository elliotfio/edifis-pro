const express = require("express");
const router = express.Router();
const { WorksiteController } = require('../controllers');

// Get all worksites
router.get("/", WorksiteController.getAllWorksites);

// Get worksite by ID
router.get("/:id", WorksiteController.getWorksiteById);

// Add a new worksite
router.post("/", WorksiteController.createWorksite);

// Update a worksite
router.put("/:id", WorksiteController.updateWorksite);

// Delete a worksite
router.delete("/:id", WorksiteController.deleteWorksite);

// Ajouter ces routes
router.get("/status/:status", WorksiteController.getWorksitesByStatus);

router.get("/chef/:chef_id", WorksiteController.getWorksitesByChefId);

module.exports = router;
