import express from 'express';
import {
  createCharacter,
  getCharacters,
  getCharacter,
  updateCharacter,
  deleteCharacter,
  levelUpCharacter,
  equipItem,
  unequipItem,
  restCharacter
} from '../controllers/character.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .get(getCharacters)
  .post(createCharacter);

router.route('/:id')
  .get(getCharacter)
  .put(updateCharacter)
  .delete(deleteCharacter);

router.put('/:id/levelup', levelUpCharacter);
router.put('/:id/equip', equipItem);
router.put('/:id/unequip', unequipItem);
router.put('/:id/rest', restCharacter);

export default router;