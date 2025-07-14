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
		this.updateUser = asyncWrapper(this.updateUser.bind(this));
		this.deleteUser = asyncWrapper(this.deleteUser.bind(this));
		this.paginateUsers = asyncWrapper(this.paginateUsers.bind(this));
		this.loginUser = asyncWrapper(this.loginUser.bind(this));
		this.refreshToken = asyncWrapper(this.refreshToken.bind(this));
		this.getUserByUsername = asyncWrapper(this.getUserByUsername.bind(this));
	}

	async createJwtTokenAndRefreshToken(payload) {
		const refreshToken = generateRefreshToken();

		const token = generateToken({ id: payload.id, email: payload.email });

		const addRefreshTokenForUser = await this.tokenService.addTokenToUser({
			userId: payload.id,
			token: refreshToken.token,
			expiresAt: refreshToken.expires,
		});
		if (!addRefreshTokenForUser)
			throw new ErrorApp(
				500,
				'Failed to save refresh token',
				httpStatusText.ERROR,
			);

		return {
			token,
			refreshToken,
		};
	}

	async addUser(req, res, next) {
		const userData = req.body;
		const avatarUrl = req.file ? req.file.path : null;
		userData.avatar = avatarUrl;
		const newUser = await this.userServices.addUser(userData);
		if (!newUser) {
			return next(
				new ErrorApp(400, 'User already exists', httpStatusText.FAIL),
			);
		}

		const { token, refreshToken } = await this.createJwtTokenAndRefreshToken({
			id: newUser.id,
			email: newUser.email,
		});

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

	async loginUser(req, res, next) {
		const { username, password } = req.body;
		const user = await this.userServices.loginUser(username, password);
		if (!user) {
			return next(
				new ErrorApp(401, 'Invalid email or password', httpStatusText.FAIL),
			);
		}

		const { token, refreshToken } = await this.createJwtTokenAndRefreshToken({
			id: user.id,
			email: user.email,
		});

		res.cookie('refreshToken', refreshToken.token, {
			httpOnly: true,
			secure: true,
			sameSite: 'Strict',
			expires: refreshToken.expires,
		});

		user.token = token;
		sendResponse(
			res,
			200,
			httpStatusText.SUCCESS,
			{ user },
			'User logged in successfully',
		);
	}

	async signout(req, res, next) {
		const token = req.cookies.refreshToken;
		if (!token) {
			return next(
				new ErrorApp(
					401,
					'Refresh token not found in cookies',
					httpStatusText.FAIL,
				),
			);
		}
		await this.userServices.signout(token);

		res.clearCookie('refreshToken', {
			httpOnly: true,
			secure: true,
			sameSite: 'Strict',
		});
		sendResponse(
			res,
			200,
			httpStatusText.SUCCESS,
			null,
			'Signed out successfully',
		);
	}
	async refreshToken(req, res, next) {
		const token = req.cookies.refreshToken;
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

	async getUserByUsername(req, res, next) {
		const { username } = req.query;
		const user = await this.userServices.getUserByUsername(username);

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

		if (!paginationResult || paginationResult.users.length === 0) {
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
