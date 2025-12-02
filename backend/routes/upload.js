// backend/routes/upload.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const pgPool = require('../database/pg_connection');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Storage folder
const uploadFolder = path.join('/storage', 'uploads');

// Ensure folder exists
const fs = require('fs');
if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder, { recursive: true });

// Multer disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadFolder),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

const upload = multer({ storage });

// General file upload
router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});

// Avatar upload (resizes to 512x512)
router.post('/avatar', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const userId = req.userId;
    const filepath = path.join(uploadFolder, req.file.filename);

    // Resize avatar in-place using sharp
    await sharp(filepath)
      .resize(512, 512, { fit: 'cover' })
      .toFormat('jpeg', { quality: 90 })
      .toFile(filepath + '_resized.jpg');

    // Replace original file with resized
    fs.renameSync(filepath + '_resized.jpg', filepath);

    const url = `/uploads/${req.file.filename}`;
    const query = 'UPDATE users SET avatar = $1 WHERE id = $2 RETURNING *';
    const result = await pgPool.query(query, [url, userId]);

    if (!result.rows[0]) return res.status(404).json({ error: 'User not found' });

    res.json({ url, user: result.rows[0] });
  } catch (err) {
    console.error('Avatar upload error:', err);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
});

module.exports = router;
