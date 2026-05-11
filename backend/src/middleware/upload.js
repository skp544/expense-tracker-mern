const multer = require('multer');
const path = require('path');

const storage = (folder) => multer.diskStorage({
  destination: (req, file, cb) => cb(null, `./uploads/${folder}`),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.id}-${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp|pdf/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) return cb(null, true);
  cb(new Error('Only images and PDFs are allowed'));
};

const uploadReceipt = multer({ storage: storage('receipts'), fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
const uploadAvatar = multer({ storage: storage('avatars'), fileFilter: (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const ok = allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype);
  ok ? cb(null, true) : cb(new Error('Only images allowed'));
}, limits: { fileSize: 2 * 1024 * 1024 } });

module.exports = { uploadReceipt, uploadAvatar };
