module.exports = (sequelize, DataTypes) => {
	const RefreshToken = sequelize.define('RefreshToken', {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		token: {
			type: DataTypes.STRING(512),
			allowNull: false,
			unique: true,
		},
		expiresAt: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		createdAt: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW,
		},
		revokedAt: {
			type: DataTypes.DATE,
			allowNull: true,
		},
		UserId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: 'Users',
				key: 'id',
			},
		},

		isExpired: {
			type: DataTypes.VIRTUAL,
			get() {
				const expiresAt = this.getDataValue('expiresAt');
				return new Date() >= new Date(expiresAt);
			},
		},
		isActive: {
			type: DataTypes.VIRTUAL,
			get() {
				const revokedAt = this.getDataValue('revokedAt');
				const isExpired = this.get('isExpired');
				return !revokedAt && !isExpired;
			},
		},
	});

	return RefreshToken;
};
