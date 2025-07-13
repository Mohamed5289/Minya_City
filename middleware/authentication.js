const { verifyToken } = require('../utils/jwt');
const httpStatusText = require('../utils/httpStatusText');
const ErrorApp = require('../utils/ErrorApp');

function authenticateJWT(req, res, next) {
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		next(
			new ErrorApp(
				401,
				'Authorization header is missing or invalid',
				httpStatusText.FAIL,
			),
		);
	}

	const token = authHeader.split(' ')[1];

	try {
		const decoded = verifyToken(token, process.env.JWT_SECRET);
		req.user = decoded;
		next();
	} catch (err) {
		next(new ErrorApp(401, 'Invalid or expired token', httpStatusText.FAIL));
	}
}

module.exports = authenticateJWT;
