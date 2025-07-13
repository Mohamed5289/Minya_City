const { Sequelize } = require('sequelize');

const sequelize = require('../config/database');

// Import all models
const User = require('./user')(sequelize, Sequelize.DataTypes);
const RefreshToken = require('./refreshToken')(sequelize, Sequelize.DataTypes);

// models/index.js
User.hasMany(RefreshToken, {
	foreignKey: 'UserId',
	onDelete: 'CASCADE',
});
RefreshToken.belongsTo(User, {
	foreignKey: 'UserId',
	onDelete: 'CASCADE',
});

const db = {
	sequelize,
	Sequelize,
	User,
	RefreshToken,
};

module.exports = db;
