class RefreshTokenRepository {
	constructor(refreshTokenModel) {
		this.RefreshToken = refreshTokenModel;
	}

	async addRefreshTokenForUser(userId, token, expiresAt) {
		return await this.RefreshToken.create({
			UserId: userId,
			token,
			expiresAt,
		});
	}
	async getToken(token) {
		const tokenRecord = await this.RefreshToken.findOne({
			where: { token: token },
		});
		return tokenRecord || null;
	}

	async revokeToken(tokenRecord) {
		if (!tokenRecord) return null;

		tokenRecord.revokedAt = new Date();
		await tokenRecord.save();
		return tokenRecord;
	}

	async allRefreshToken() {
		return await this.RefreshToken.findAll();
	}
}

module.exports = RefreshTokenRepository;
