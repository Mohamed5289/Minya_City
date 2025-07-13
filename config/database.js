require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
	process.env.DB_NAME,
	process.env.DB_ID,
	process.env.DB_PASSWORD,
	{
		host: process.env.DB_HOST,
		dialect: 'mssql',
		pool: {
			max: 100,
			min: 10,
			acquire: 30000,
			idle: 10000,
		},
		dialectOptions: {
			options: {
				trustedConnection: true,
				enableArithAbort: true,
				trustServerCertificate: true,
			},
		},
	},
);

module.exports = sequelize;
