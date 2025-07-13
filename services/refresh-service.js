const { generateToken, generateRefreshToken } = require('../utils/jwt');
const ErrorApp = require('../utils/ErrorApp');
const httpStatusText = require('../utils/httpStatusText');

class RefreshTokenService {
	constructor(refreshTokenRepository, userRepository) {
		this.tokenRepository = refreshTokenRepository;
		this.userRepository = userRepository;
	}

	async addTokenToUser(payload) {
		return await this.tokenRepository.addRefreshTokenForUser(
			payload.userId,
			payload.token,
			payload.expiresAt,
		);
	}

	async getAllRefreshToken() {
		return await this.tokenRepository.allRefreshToken();
	}

	async refreshToken(token) {
		const getToken = await this.tokenRepository.getToken(token);
		if (!getToken)
			throw new ErrorApp(401, 'Invalid refresh token', httpStatusText.FAIL);

		if (getToken.revokedAt || new Date(getToken.expiresAt) < new Date()) {
			throw new ErrorApp(
				403,
				'Refresh token expired or revoked',
				httpStatusText.FAIL,
			);
		}

		await this.tokenRepository.revokeToken(getToken);

		const user = await this.userRepository.getUserById(getToken.UserId);
		if (!user) throw new ErrorApp(404, 'User not found', httpStatusText.FAIL);

		const jwtToken = generateToken({ id: user.id, email: user.email });
		const refreshToken = generateRefreshToken();

		const addToken = await this.tokenRepository.addRefreshTokenForUser(
			user.id,
			refreshToken.token,
			refreshToken.expires,
		);
		if (!addToken)
			throw new ErrorApp(
				500,
				'Failed to create new refresh token',
				httpStatusText.ERROR,
			);

		return {
			jwtToken,
			refreshToken: {
				token: refreshToken.token,
				expires: refreshToken.expires,
			},
		};
	}

	async revokeToken(token) {
		const tokenRecord = await this.tokenRepository.getToken(token);
		return tokenRecord;
	}
}

module.exports = RefreshTokenService;
