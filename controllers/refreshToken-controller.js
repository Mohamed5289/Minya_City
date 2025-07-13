const asyncWrapper = require('../middleware/asnycWrapper');
const httpStatusText = require('../utils/httpStatusText');
const ErrorApp = require('../utils/ErrorApp');
const sendResponse = require('../utils/sendReponse');

class RefreshTokenController {
	constructor(refreshTokenService) {
		this.refreshTokenService = refreshTokenService;
		this.getRefreshTokens = asyncWrapper(this.getRefreshTokens.bind(this));
	}

	async getRefreshTokens(req, res, next) {
		const tokens = await this.refreshTokenService.getAllRefreshToken();
		if (!tokens || tokens.length === 0) {
			return next(new ErrorApp(404, 'No tokens found', httpStatusText.FAIL));
		}
		sendResponse(
			res,
			200,
			httpStatusText.SUCCESS,
			tokens,
			'Tokens retrieved successfully',
		);
	}
}

module.exports = RefreshTokenController;
