import Leaderboard from '../models/Leaderboard.js';
import Character from '../models/Character.js';
import { asyncHandler } from '../middleware/error.middleware.js';

// @desc    Get leaderboard by type
// @route   GET /api/leaderboard/:type
// @access  Private
export const getLeaderboard = asyncHandler(async (req, res) => {
  const { type } = req.params;
  
  if (!['level', 'gold', 'pvp', 'dungeons', 'quests'].includes(type)) {
    res.status(400);
    throw new Error('Invalid leaderboard type');
  }
  
  let leaderboard = await Leaderboard.findOne({ type })
    .populate('entries.character', 'name level class gold');
  
  // If leaderboard doesn't exist or is older than 1 hour, update it
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  if (!leaderboard || leaderboard.lastUpdated < oneHourAgo) {
    await Leaderboard.updateLeaderboard(type);
    leaderboard = await Leaderboard.findOne({ type })
      .populate('entries.character', 'name level class gold pvpStats');
  }
  
  res.status(200).json({
    success: true,
    data: leaderboard
  });
});

// @desc    Get character rank
// @route   GET /api/leaderboard/:type/rank/:characterId
// @access  Private
export const getCharacterRank = asyncHandler(async (req, res) => {
  const { type, characterId } = req.params;
  
  if (!['level', 'gold', 'pvp', 'dungeons', 'quests'].includes(type)) {
    res.status(400);
    throw new Error('Invalid leaderboard type');
  }
  
  const character = await Character.findById(characterId);
  if (!character) {
    res.status(404);
    throw new Error('Character not found');
  }
  
  // Get current leaderboard
  const leaderboard = await Leaderboard.findOne({ type });
  if (!leaderboard) {
    res.status(404);
    throw new Error('Leaderboard not found');
  }
  
  // Find character's entry
  const entry = leaderboard.entries.find(e => e.character.toString() === characterId);
  
  // If character is not in top 100, calculate their rank
  if (!entry) {
    let rank = 0;
    let value = 0;
    
    switch (type) {
      case 'level':
        value = character.level;
        rank = await Character.countDocuments({
          $or: [
            { level: { $gt: character.level } },
            { level: character.level, experience: { $gt: character.experience } }
          ]
        }) + 1;
        break;
        
      case 'gold':
        value = character.gold;
        rank = await Character.countDocuments({ gold: { $gt: character.gold } }) + 1;
        break;
        
      case 'pvp':
        value = character.pvpStats?.wins || 0;
        rank = await Character.countDocuments({ 'pvpStats.wins': { $gt: value } }) + 1;
        break;
        
      case 'dungeons':
        value = character.completedDungeons?.length || 0;
        rank = await Character.countDocuments({
          completedDungeons: { $exists: true, $size: { $gt: value } }
        }) + 1;
        break;
        
      case 'quests':
        value = character.completedQuests?.length || 0;
        rank = await Character.countDocuments({
          completedQuests: { $exists: true, $size: { $gt: value } }
        }) + 1;
        break;
    }
    
    res.status(200).json({
      success: true,
      data: {
        character: character._id,
        rank,
        value,
        inTopList: false
      }
    });
  } else {
    res.status(200).json({
      success: true,
      data: {
        ...entry.toObject(),
        inTopList: true
      }
    });
  }
});

// @desc    Force update leaderboard
// @route   POST /api/leaderboard/:type/update
// @access  Private (admin only)
export const forceUpdateLeaderboard = asyncHandler(async (req, res) => {
  const { type } = req.params;
  
  if (!['level', 'gold', 'pvp', 'dungeons', 'quests'].includes(type)) {
    res.status(400);
    throw new Error('Invalid leaderboard type');
  }
  
  // Check if user is admin
  if (req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Only admins can force update leaderboards');
  }
  
  await Leaderboard.updateLeaderboard(type);
  
  const leaderboard = await Leaderboard.findOne({ type })
    .populate('entries.character', 'name level class gold pvpStats');
  
  res.status(200).json({
    success: true,
    data: leaderboard
  });
});