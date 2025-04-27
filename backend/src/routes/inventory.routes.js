import express from 'express';
import {
  getInventory,
  addItemToInventory,
  removeItemFromInventory,
  useItem,
  dropItem,
  transferItem
} from '../controllers/inventory.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Fix the route parameters - remove redundant path
router.get('/:characterId/inventory', getInventory);
router.post('/:characterId/inventory', addItemToInventory);
router.delete('/:characterId/inventory/:itemId', removeItemFromInventory);
router.post('/:characterId/inventory/:itemId/use', useItem);
router.post('/:characterId/inventory/:itemId/drop', dropItem);
router.post('/:characterId/inventory/:itemId/transfer', transferItem);

export default router;