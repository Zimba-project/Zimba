// backend/routes/upload.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const pgPool = require('../database/pg_connection');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Ensure uploads folder exists
const uploadFolder = path.join('/storage', 'uploads');
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadFolder),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

const upload = multer({ storage });

// POST /api/upload 
router.post('/', upload.single('file'), async (req, res) => { 
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const ext = path.extname(req.file.originalname) || '.jpg';
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const filepath = path.join(uploadFolder, filename);
    fs.writeFileSync(filepath, req.file.buffer);
    const url = `/uploads/${filename}`;
    res.json({ url });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// POST /api/upload/avatar
router.post('/avatar', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const userId = req.userId; 
    const ext = path.extname(req.file.originalname) || '.jpg';
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const filepath = path.join(uploadFolder, filename);

    await sharp(req.file.buffer)
      .resize(512, 512, { fit: 'cover' })
      .toFormat('jpeg', { quality: 90 })
      .toFile(filepath);

    const url = `/uploads/${filename}`;
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
