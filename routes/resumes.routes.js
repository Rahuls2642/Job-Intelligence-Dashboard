import express from 'express';
import { uploadResume, getResume } from '../controllers/resumes.controller.js';
import auth from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.middleware.js';

const router = express.Router();


router.post('/', auth, upload.single('file'), uploadResume);
router.get('/:id', auth, getResume);

export default router;
