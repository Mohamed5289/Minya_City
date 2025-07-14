const hash = require('../utils/hash-password');
// services/userServices.js
class UserService {
	constructor(userRepository, refreshTokenRepository) {
		this.userRepository = userRepository;
		this.refreshTokenRepository = refreshTokenRepository;
	}
	async addUser(userData) {
		const existingUser = await this.userRepository.getUserByUsername(
			userData.username,
		);
		if (existingUser) return null;
		const hashedPassword = await hash.hashPassword(userData.password);
		userData.password = hashedPassword;
		return await this.userRepository.createUser(userData);
	}
	async getUserById(userId) {
		const user = await this.userRepository.getUserById(userId);
		return user || null;
	}
	async loginUser(email, password) {
		const user = await this.userRepository.getUserByEmail(email);
		if (!user) return null;

		const isPasswordValid = await hash.comparePassword(password, user.password);
		if (!isPasswordValid) return null;

		return user;
	}
	async getUserByUsername(username) {
		const user = await this.userRepository.getUserByUsername(username);
		return user || null;
	}
	async updateUser(userId, updatedData) {
		const user = await this.userRepository.getUserById(userId);
		if (!user) return null;
		return await this.userRepository.updateUser(userId, updatedData);
	}
	async deleteUser(userId) {
		const user = await this.userRepository.getUserById(userId);
		if (!user) return null;
		return await this.userRepository.deleteUser(userId);
	}
	async paginateUsers(page, limit) {
		const paginationResult = await this.userRepository.paginateUsers(
			page,
			limit,
		);
		return paginationResult || null;
	}
	async signout(refreshToken) {
		const token = await this.refreshTokenRepository.getToken(refreshToken);
		if (!token) {
			throw new Error('Invalid or expired refresh token');
		}
		return await this.refreshTokenRepository.revokeToken(token);
	}
}

module.exports = UserService;
