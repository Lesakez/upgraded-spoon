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

router.route('/characters/:characterId/inventory')
  .get(getInventory)
  .post(addItemToInventory);

router.route('/characters/:characterId/inventory/:itemId')
  .delete(removeItemFromInventory);

router.post('/characters/:characterId/inventory/:itemId/use', useItem);
router.post('/characters/:characterId/inventory/:itemId/drop', dropItem);
router.post('/characters/:characterId/inventory/:itemId/transfer', transferItem);

export default router;