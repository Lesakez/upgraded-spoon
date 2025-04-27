import express from 'express';
import {
  joinPvPQueue,
  leavePvPQueue,
  getPvPLeaderboard
} from '../controllers/pvp.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/queue', joinPvPQueue);
router.post('/queue/leave', leavePvPQueue);
router.get('/leaderboard', getPvPLeaderboard);

export default router;