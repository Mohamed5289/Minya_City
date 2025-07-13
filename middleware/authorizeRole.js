const ErrorApp = require('../utils/ErrorApp');
const httpStatusText = require('../utils/httpStatusText');
module.exports = function authorizeRole(...allowedRoles) {
	return (req, res, next) => {
		const user = req.user;

		if (!user || !allowedRoles.includes(user.role)) {
			next(
				new ErrorApp(
					403,
					'Access denied: insufficient permissions',
					httpStatusText,
				),
			);
		}

		next();
	};
};
