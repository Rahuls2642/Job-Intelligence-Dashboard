import express from 'express';
import { matchController } from '../controllers/match.controller.js';
import auth from '../middleware/auth.middleware.js';

const router = express.Router();

// match can be protected or public depending on your flow
router.post('/', auth, matchController);

export default router;
