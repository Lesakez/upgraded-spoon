import express from 'express';
import {
  getDungeons,
  getDungeon,
  enterDungeon,
  leaveDungeon,
  updateDungeonProgress,
  completeDungeon,
  getDungeonInstances
} from '../controllers/dungeon.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/', getDungeons);
router.get('/:id', getDungeon);
router.get('/:id/instances', getDungeonInstances);
router.post('/:id/enter', enterDungeon);
router.post('/:id/leave', leaveDungeon);
router.put('/:id/progress', updateDungeonProgress);
router.post('/:id/complete', completeDungeon);

export default router;