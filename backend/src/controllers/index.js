// Export de tous les contrôleurs
const AuthController = require('./authController');
const UserController = require('./userController');
const ArtisanController = require('./artisanController');
const WorksiteController = require('./worksiteController');

module.exports = {
    AuthController,
    UserController,
    ArtisanController,
    WorksiteController
};
