const express = require("express");
const router = express.Router();
const { UserController } = require('../controllers');

// GET all users
router.get("/", UserController.getAllUsers);

// GET user by ID
router.get("/:id", UserController.getUserById);

// POST new user
router.post("/", UserController.createUser);

// PUT user
router.put("/:id", UserController.updateUser);

// Route pour mettre à jour le mot de passe
router.put('/:id/password', UserController.updatePassword);

// DELETE user
router.delete("/:id", UserController.deleteUser);

module.exports = router;