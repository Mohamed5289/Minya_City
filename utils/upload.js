const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const ErrorApp = require('../utils/ErrorApp');
const httpStatusText = require('../utils/httpStatusText');

const FILE_TYPES = ['.png', '.jpg', '.jpeg'];

const storage = new CloudinaryStorage({
	cloudinary: cloudinary,
	params: {
		folder: 'avatars',
		allowed_formats: ['jpg', 'jpeg', 'png'],
		transformation: [{ width: 500, height: 500, crop: 'limit' }], // اختياري
	},
});

const fileFilter = (req, file, cb) => {
	const ext = file.originalname.toLowerCase().match(/\.(\w+)$/);
	if (ext && FILE_TYPES.includes(`.${ext[1]}`)) {
		console.log(file.name);
		cb(null, true);
	} else {
		cb(
			new ErrorApp(400, 'The file is not a valid image', httpStatusText.FAIL),
			false,
		);
	}
};

// Max size = 2 MB
const upload = multer({
	storage,
	limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
	fileFilter,
});

module.exports = upload;
