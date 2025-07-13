function sendResponse(res, statusCode, status, data, message) {
	return res.status(statusCode).json({
		status,
		data,
		message,
	});
}

module.exports = sendResponse;
