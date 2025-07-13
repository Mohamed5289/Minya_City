const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('db23253', 'db23253', '4q#Ec?D8L2!t', {
	host: 'db23253.public.databaseasp.net',
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
});

module.exports = sequelize;
