const multer = require('multer');
const path = require('path');
const ErrorApp = require('../utils/ErrorApp');
const httpStatusText = require('../utils/httpStatusText');

// Allowed file extensions
const FILE_TYPES = ['.png', '.jpg', '.jpeg'];

// Configure storage
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		const uploadPath = path.join(__dirname, '..', 'uploads');
		cb(null, uploadPath);
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
		const ext = path.extname(file.originalname);
		const filename = file.fieldname + '-' + uniqueSuffix + ext;
		req.body.avatar = `${req.protocol}://${req.get(
			'host',
		)}/uploads/${filename}`;
		cb(null, filename);
	},
});

// File filter to check extensions
const fileFilter = (req, file, cb) => {
	const ext = path.extname(file.originalname).toLowerCase();
	if (FILE_TYPES.includes(ext)) {
		cb(null, true);
	} else {
		cb(new ErrorApp(400, 'The file is not image', httpStatusText.FAIL), false);
	}
};

// Max size = 2 MB
const upload = multer({
	storage: storage,
	limits: {
		fileSize: 2 * 1024 * 1024, // 2 MB
	},
	fileFilter: fileFilter,
});

module.exports = upload;
