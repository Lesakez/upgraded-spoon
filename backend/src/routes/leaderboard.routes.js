import express from 'express';
import {
  getLeaderboard,
  getCharacterRank,
  forceUpdateLeaderboard
} from '../controllers/leaderboard.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/:type', getLeaderboard);
router.get('/:type/rank/:characterId', getCharacterRank);
router.post('/:type/update', authorize('admin'), forceUpdateLeaderboard);

export default router;