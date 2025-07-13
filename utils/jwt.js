const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const crypto = require('crypto');
const ms = require('ms');
dotenv.config();

const secret = process.env.JWT_SECRET;
const expiresIn = process.env.JWT_EXPIRES_IN || '1d';

function generateToken(payload) {
	return jwt.sign(payload, secret, { expiresIn });
}

function generateRefreshToken() {
	const randomBytes = crypto.randomBytes(32);
	const token = randomBytes.toString('hex');
	const expiresIn = process.env.REFRESH_TOKEN_EXPIRES_AT || '7d';
	const expiresAt = new Date(Date.now() + ms(expiresIn));
	return {
		token,
		expires: expiresAt,
		created: new Date(),
	};
}

function verifyToken(token) {
	return jwt.verify(token, secret);
}

module.exports = {
	generateToken,
	verifyToken,
	generateRefreshToken,
};
