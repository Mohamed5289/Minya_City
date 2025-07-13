module.exports = (sequelize, DataTypes) => {
	const User = sequelize.define('User', {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		firstName: {
			type: DataTypes.STRING(100),
			allowNull: false,
			validate: {
				notEmpty: { msg: 'First name is required' },
				len: {
					args: [2, 100],
					msg: 'First name must be between 2 and 100 characters long',
				},
				is: {
					args: /^[A-Za-z\u0600-\u06FF\s]+$/i,
					msg: 'First name must contain only letters',
				},
			},
		},
		lastName: {
			type: DataTypes.STRING(100),
			allowNull: false,
			validate: {
				notEmpty: { msg: 'Last name is required' },
				len: {
					args: [2, 100],
					msg: 'Last name must be between 2 and 100 characters long',
				},
				is: {
					args: /^[A-Za-z\u0600-\u06FF\s]+$/i, // يدعم الإنجليزية والعربية والمسافات
					msg: 'Last name must contain only letters',
				},
			},
		},
		username: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			validate: {
				notEmpty: { msg: 'Username is required' },
				len: {
					args: [2, 100],
					msg: 'Username must be between 2 and 100 characters long',
				},
			},
		},
		email: {
			type: DataTypes.STRING(100),
			allowNull: false,
			unique: true,
			validate: {
				isEmail: { msg: 'Valid email is required' },
				notEmpty: { msg: 'Email is required' },
				len: {
					args: [5, 100],
					msg: 'Email must be between 5 and 100 characters long',
				},
			},
		},
		role: {
			type: DataTypes.ENUM('student', 'instructor', 'admin'),
			allowNull: false,
			defaultValue: 'student',
			validate: {
				isIn: {
					args: [['student', 'instructor', 'admin']],
					msg: 'Role must be either student, instructor, or admin',
				},
			},
		},
		avatar: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		password: {
			type: DataTypes.STRING(100),
			allowNull: false,
			validate: {
				notEmpty: { msg: 'Password is required' },
				len: {
					args: [6, 100],
					msg: 'Password must be at least 6 characters long',
				},
			},
		},
		token: {
			type: DataTypes.VIRTUAL,
			get() {
				return this._token;
			},
			set(value) {
				this._token = value;
			},
		},
	});

	return User;
};
