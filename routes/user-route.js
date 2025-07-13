const express = require('express');
const router = express.Router();
const { User, RefreshToken } = require('../models'); // Sequelize model
const UserRepository = require('../repositories/user-repository');
const RefreshTokenRepository = require('../repositories/refreshToken-repository');

const UserService = require('../services/user-serivce');
const RefreshTokenService = require('../services/refresh-service');

const UserController = require('../controllers/user-controller');
const authenticateJWT = require('../middleware/authentication');
const authorizeRole = require('../middleware/authorizeRole');
const roles = require('../utils/roles');
const upload = require('../utils/upload');

// Dependency injection
const userRepository = new UserRepository(User);
const refreshTokenRepository = new RefreshTokenRepository(RefreshToken);

const userService = new UserService(userRepository, refreshTokenRepository);
const refreshTokenService = new RefreshTokenService(
	refreshTokenRepository,
	userRepository,
);
const userController = new UserController(userService, refreshTokenService);

router.route('/').get(userController.getAllUsers);
router.route('/refreshToken/t').get(userController.refreshToken);

router.route('/login').post(userController.loginUser);
router.route('/register').post(upload.single('avatar'), userController.addUser);
router.route('/email/:email').get(userController.getUserByEmail);
router
	.route('/:id')
	.get(userController.getUserById)
	.put(userController.updateUser)
	.delete(userController.deleteUser);

router.route('/paginate').get(userController.paginateUsers);

module.exports = router;
