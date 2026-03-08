import express from 'express';
import multer from 'multer';
import { uploadBufferToCloudinary } from '../utils/cloudinaryUploader.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Configure multer to use memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit per file
});

/**
 * POST /api/upload
 * Requires Auth token in headers.
 * Accepts multipart/form-data with field name "images" (array of files).
 */
router.post('/', upload.array('images', 5), async (req, res) => {
    try {
        // Authenticate manually for REST route since GraphQL context isn't running here
        const user = await authMiddleware(req);
        if (!user || user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Unauthorized or Forbidden' });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files provided' });
        }

        // Upload all buffers to Cloudinary
        const uploadPromises = req.files.map((file) => uploadBufferToCloudinary(file.buffer));
        const urls = await Promise.all(uploadPromises);

        res.status(200).json({ urls });
    } catch (error) {
        console.error('❌ [REST Upload] Error:', error);
        res.status(500).json({ error: error.message || 'Server error during upload' });
    }
});

export default router;
