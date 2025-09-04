const express = require('express');
const router = express.Router();
const { ArtisanController } = require('../controllers');

// GET all artisans
router.get('/', ArtisanController.getAllArtisans);

// GET artisan by user_id
router.get('/:user_id', ArtisanController.getArtisanByUserId);

// POST create new artisan
router.post('/', ArtisanController.createArtisan);

// PUT update artisan
router.put('/:user_id', ArtisanController.updateArtisan);

// DELETE artisan
router.delete('/:user_id', ArtisanController.deleteArtisan);

module.exports = router;
