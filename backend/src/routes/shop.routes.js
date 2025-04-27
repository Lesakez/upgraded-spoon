import express from 'express';
import {
  getAllShops,
  getShopItems,
  buyItem,
  sellItem
} from '../controllers/shop.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/', getAllShops);
router.get('/:npcId', getShopItems);
router.post('/:npcId/buy', buyItem);
router.post('/:npcId/sell', sellItem);

export default router;