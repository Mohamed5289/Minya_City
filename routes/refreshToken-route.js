const express = require('express');
const router = express.Router();
const { User, RefreshToken } = require('../models'); // Sequelize model
const UserRepository = require('../repositories/user-repository');
const RefreshTokenRepository = require('../repositories/refreshToken-repository');

const UserService = require('../services/user-serivce');
const RefreshTokenService = require('../services/refresh-service');

const UserController = require('../controllers/user-controller');
const RefreshTokenController = require('../controllers/refreshToken-controller');
const authenticateJWT = require('../middleware/authentication');
const authorizeRole = require('../middleware/authorizeRole');
const roles = require('../utils/roles');

const userRepository = new UserRepository(User);
const refreshTokenRepository = new RefreshTokenRepository(RefreshToken);

const refreshTokenService = new RefreshTokenService(
	refreshTokenRepository,
	userRepository,
);
const refreshTokenController = new RefreshTokenController(refreshTokenService);

router.route('/').get(refreshTokenController.getRefreshTokens);
module.exports = router;
