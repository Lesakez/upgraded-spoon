import express from 'express';
import {
  getTavernInfo,
  useTavernService,
  gamble
} from '../controllers/tavern.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/', getTavernInfo);
router.post('/service', useTavernService);
router.post('/gamble', gamble);

export default router;