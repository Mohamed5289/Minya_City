class ErrorApp extends Error {
	constructor(status, message, statusText) {
		super(message);
		this.status = status;
		this.statusText = statusText;
	}
}

module.exports = ErrorApp;
