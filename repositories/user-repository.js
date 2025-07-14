class UserRepository {
	constructor(userModel) {
		this.User = userModel;
	}

	async createUser(userData) {
		return await this.User.create(userData);
	}

	async getUserById(id) {
		return await this.User.findByPk(id, {
			attributes: { exclude: ['password'] },
		});
	}

	async getUserByUsername(username) {
		return await this.User.findOne({
			where: { username: username },
			attributes: { exclude: ['password'] },
		});
	}

	async updateUser(userId, updatedData) {
		return await this.User.update(updatedData, {
			where: { id: userId },
		});
	}

	async deleteUser(userId) {
		return await this.User.destroy({
			where: { id: userId },
		});
	}

	async paginateUsers(page, limit) {
		const offset = (page - 1) * limit;
		const { count, rows } = await this.User.findAndCountAll({
			offset: offset,
			limit: limit,
			attributes: { exclude: ['password'] },
		});
		return {
			totalItems: count,
			users: rows,
			totalPages: Math.ceil(count / limit),
			currentPage: page,
		};
	}
}

module.exports = UserRepository;
