import express from 'express';
import { matchController } from '../controllers/match.controller.js';
import auth from '../middleware/auth.middleware.js';

const router = express.Router();


router.post('/', auth, matchController);

export default router;
