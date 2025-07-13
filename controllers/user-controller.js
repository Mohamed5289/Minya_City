const asyncWrapper = require('../middleware/asnycWrapper');
const httpStatusText = require('../utils/httpStatusText');
const ErrorApp = require('../utils/ErrorApp');
const sendResponse = require('../utils/sendReponse');
const { generateToken, generateRefreshToken } = require('../utils/jwt');

class UserController {
	constructor(userServices, tokenService) {
		this.userServices = userServices;
		this.tokenService = tokenService;

		this.addUser = asyncWrapper(this.addUser.bind(this));
		this.getUserById = asyncWrapper(this.getUserById.bind(this));
		this.getAllUsers = asyncWrapper(this.getAllUsers.bind(this));
		this.getUserByEmail = asyncWrapper(this.getUserByEmail.bind(this));
		this.updateUser = asyncWrapper(this.updateUser.bind(this));
		this.deleteUser = asyncWrapper(this.deleteUser.bind(this));
		this.paginateUsers = asyncWrapper(this.paginateUsers.bind(this));
		this.loginUser = asyncWrapper(this.loginUser.bind(this));
		this.refreshToken = asyncWrapper(this.refreshToken.bind(this));
	}

	async addUser(req, res, next) {
		const userData = req.body;
		const newUser = await this.userServices.addUser(userData);
		if (!newUser) {
			return next(
				new ErrorApp(400, 'User already exists', httpStatusText.FAIL),
			);
		}

		const refreshToken = generateRefreshToken();

		const token = generateToken({ id: newUser.id, email: newUser.email });

		const addRefreshTokenForUser = await this.tokenService.addTokenToUser({
			userId: newUser.id,
			token: refreshToken.token,
			expiresAt: refreshToken.expires,
		});

		if (!addRefreshTokenForUser)
			return next(
				new ErrorApp(500, 'Failed to save refresh token', httpStatusText.ERROR),
			);

		res.cookie('refreshToken', refreshToken.token, {
			httpOnly: true,
			secure: true,
			sameSite: 'Strict',
			expires: refreshToken.expires,
		});

		newUser.token = token;
		sendResponse(
			res,
			201,
			httpStatusText.SUCCESS,
			{ user: newUser },
			'User created successfully',
		);
	}

	async refreshToken(req, res, next) {
		const token = req.cookies.refreshToken;
		console.log('DEBUG: token = ', token);
		if (!token) {
			return next(
				new ErrorApp(401, 'No refresh token provided', httpStatusText.FAIL),
			);
		}

		const tokens = await this.tokenService.refreshToken(token);
		res.cookie('refreshToken', tokens.refreshToken.token, {
			httpOnly: true,
			secure: true,
			sameSite: 'Strict',
			expires: tokens.refreshToken.expires,
		});

		sendResponse(
			res,
			201,
			httpStatusText.SUCCESS,
			{ token: tokens.jwtToken },
			'token created successfully',
		);
	}

	async loginUser(req, res, next) {
		const { email, password } = req.body;
		const user = await this.userServices.loginUser(email, password);
		if (!user) {
			return next(
				new ErrorApp(401, 'Invalid email or password', httpStatusText.FAIL),
			);
		}

		const refreshToken = generateRefreshToken();

		const token = generateToken({ id: user.id, email: user.email });

		const addRefreshTokenForUser = await this.tokenService.addTokenToUser({
			userId: user.id,
			token: refreshToken.token,
			expiresAt: refreshToken.expires,
		});
		if (!addRefreshTokenForUser)
			return next(
				new ErrorApp(500, 'Failed to save refresh token', httpStatusText.ERROR),
			);

		res.cookie('refreshToken', refreshToken.token, {
			httpOnly: true,
			secure: true,
			sameSite: 'Strict',
			expires: tokens.refreshToken.expires,
		});

		sendResponse(
			res,
			200,
			httpStatusText.SUCCESS,
			{ user, token },
			'User logged in successfully',
		);
	}

	async getUserById(req, res, next) {
		const userId = req.params.id;
		const user = await this.userServices.getUserById(userId);

		if (!user) {
			return next(new ErrorApp(404, 'User not found', httpStatusText.FAIL));
		}

		sendResponse(
			res,
			200,
			httpStatusText.SUCCESS,
			user,
			'User retrieved successfully',
		);
	}

	async getAllUsers(req, res, next) {
		const users = await this.userServices.getAllUsers();

		if (!users || users.length === 0) {
			return next(new ErrorApp(404, 'No users found', httpStatusText.FAIL));
		}
		sendResponse(
			res,
			200,
			httpStatusText.SUCCESS,
			users,
			'Users retrieved successfully',
		);
	}

	async getUserByEmail(req, res, next) {
		const email = req.params.email;
		const user = await this.userServices.getUserByEmail(email);

		if (!user) {
			return next(new ErrorApp(404, 'User not found', httpStatusText.FAIL));
		}

		sendResponse(
			res,
			200,
			httpStatusText.SUCCESS,
			user,
			'User retrieved successfully',
		);
	}

	async updateUser(req, res, next) {
		const userId = req.params.id;
		const updatedData = req.body;
		const updatedUser = await this.userServices.updateUser(userId, updatedData);

		if (!updatedUser) {
			return next(new ErrorApp(404, 'User not found', httpStatusText.FAIL));
		}

		sendResponse(
			res,
			200,
			httpStatusText.SUCCESS,
			updatedUser,
			'User updated successfully',
		);
	}

	async deleteUser(req, res, next) {
		const userId = req.params.id;
		const deletedUser = await this.userServices.deleteUser(userId);

		if (!deletedUser) {
			return next(new ErrorApp(404, 'User not found', httpStatusText.FAIL));
		}

		sendResponse(
			res,
			200,
			httpStatusText.SUCCESS,
			null,
			'User deleted successfully',
		);
	}

	async paginateUsers(req, res, next) {
		const { page = 1, limit = 10 } = req.query;
		const paginationResult = await this.userServices.paginateUsers(
			parseInt(page),
			parseInt(limit),
		);

		if (!paginationResult || paginationResult.data.length === 0) {
			return next(new ErrorApp(404, 'No users found', httpStatusText.FAIL));
		}

		sendResponse(
			res,
			200,
			httpStatusText.SUCCESS,
			paginationResult,
			'Users paginated successfully',
		);
	}
}

module.exports = UserController;
