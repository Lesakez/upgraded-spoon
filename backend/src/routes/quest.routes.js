import express from 'express';
import {
  getAvailableQuests,
  acceptQuest,
  updateQuestProgress,
  completeQuest,
  abandonQuest,
  getQuest
} from '../controllers/quest.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/available/:characterId', getAvailableQuests);
router.get('/:id', getQuest);
router.post('/:questId/accept', acceptQuest);
router.put('/:questId/progress', updateQuestProgress);
router.post('/:questId/complete', completeQuest);
router.post('/:questId/abandon', abandonQuest);

export default router;