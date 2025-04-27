import express from 'express';
import {
  createGuild,
  getGuilds,
  getGuild,
  applyToGuild,
  handleApplication,
  leaveGuild,
  kickMember,
  changeMemberRole,
  disbandGuild
} from '../controllers/guild.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .get(getGuilds)
  .post(createGuild);

router.route('/:id')
  .get(getGuild)
  .delete(disbandGuild);

router.post('/:id/apply', applyToGuild);
router.put('/:id/applications/:applicationId', handleApplication);
router.post('/:id/leave', leaveGuild);
router.post('/:id/kick', kickMember);
router.put('/:id/members/:memberId/role', changeMemberRole);

export default router;