import express from 'express';
import { uploadResume, getResume } from '../controllers/resumes.controller.js';
import auth from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.middleware.js';

const router = express.Router();

// protected upload (you can remove auth for now if you haven't set up users)
router.post('/', auth, upload.single('file'), uploadResume);
router.get('/:id', auth, getResume);

export default router;
