import express from 'express';
import {
  getAllTrainers,
  getAvailableSkills,
  learnSkill,
  getLearnableSkills
} from '../controllers/training.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/', getAllTrainers);
router.get('/learnable/:characterId', getLearnableSkills);
router.get('/:npcId', getAvailableSkills);
router.post('/:npcId/learn', learnSkill);

export default router;