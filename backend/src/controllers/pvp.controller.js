import Character from '../models/Character.js';
import { asyncHandler } from '../middleware/error.middleware.js';

// PvP matchmaking queue
const pvpQueue = new Map(); // { characterId: { character, joinedAt, matchType } }

// @desc    Join PvP queue
// @route   POST /api/pvp/queue
// @access  Private
export const joinPvPQueue = asyncHandler(async (req, res) => {
  const { characterId, matchType = 'ranked' } = req.body;
  
  const character = await Character.findById(characterId)
    .populate('equipment.weapon')
    .populate('equipment.armor')
    .populate('skills.skill');
  
  if (!character) {
    res.status(404);
    throw new Error('Character not found');
  }
  
  // Make sure user owns character
  if (character.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to use this character');
  }
  
  // Check if already in battle
  if (character.inBattle) {
    res.status(400);
    throw new Error('Character is already in battle');
  }
  
  // Check if already in queue
  if (pvpQueue.has(characterId)) {
    res.status(400);
    throw new Error('Character is already in queue');
  }
  
  // Add to queue
  pvpQueue.set(characterId, {
    character,
    joinedAt: new Date(),
    matchType
  });
  
  // Try to find a match
  const match = findMatch(characterId);
  
  if (match) {
    // Start battle
    const battleResult = await startPvPBattle(match.player1, match.player2);
    
    res.status(200).json({
      success: true,
      data: {
        status: 'matched',
        battle: battleResult
      }
    });
  } else {
    res.status(200).json({
      success: true,
      data: {
        status: 'queued',
        position: pvpQueue.size
      }
    });
  }
});

// @desc    Leave PvP queue
// @route   POST /api/pvp/queue/leave
// @access  Private
export const leavePvPQueue = asyncHandler(async (req, res) => {
  const { characterId } = req.body;
  
  if (pvpQueue.has(characterId)) {
    pvpQueue.delete(characterId);
    res.status(200).json({
      success: true,
      data: { message: 'Left PvP queue' }
    });
  } else {
    res.status(400);
    throw new Error('Character not in queue');
  }
});

// @desc    Get PvP leaderboard
// @route   GET /api/pvp/leaderboard
// @access  Private
export const getPvPLeaderboard = asyncHandler(async (req, res) => {
  const leaderboard = await Character.find()
    .sort({ 'pvpStats.rating': -1 })
    .limit(50)
    .select('name level class pvpStats');
  
  res.status(200).json({
    success: true,
    data: leaderboard
  });
});

// Helper function to find a match
function findMatch(characterId) {
  const queueEntry = pvpQueue.get(characterId);
  if (!queueEntry) return null;
  
  const { character, matchType } = queueEntry;
  
  // Simple matchmaking: find opponent within 200 rating
  for (const [opponentId, opponent] of pvpQueue) {
    if (opponentId === characterId) continue;
    if (opponent.matchType !== matchType) continue;
    
    const ratingDiff = Math.abs(character.pvpStats.rating - opponent.character.pvpStats.rating);
    if (ratingDiff <= 200) {
      // Remove both from queue
      pvpQueue.delete(characterId);
      pvpQueue.delete(opponentId);
      
      return {
        player1: character,
        player2: opponent.character
      };
    }
  }
  
  return null;
}

// Helper function to start PvP battle
async function startPvPBattle(player1, player2) {
  // Simple battle simulation
  const battle = {
    id: Date.now().toString(),
    participants: [player1._id, player2._id],
    startTime: new Date(),
    logs: []
  };
  
  // Mark characters as in battle
  player1.inBattle = true;
  player2.inBattle = true;
  await player1.save();
  await player2.save();
  
  // Simulate battle (simplified)
  let round = 1;
  let player1Health = player1.health.max;
  let player2Health = player2.health.max;
  
  while (player1Health > 0 && player2Health > 0 && round <= 20) {
    // Player 1 attacks
    const p1Damage = calculateDamage(player1);
    player2Health -= p1Damage;
    battle.logs.push(`Round ${round}: ${player1.name} deals ${p1Damage} damage to ${player2.name}`);
    
    if (player2Health <= 0) break;
    
    // Player 2 attacks
    const p2Damage = calculateDamage(player2);
    player1Health -= p2Damage;
    battle.logs.push(`Round ${round}: ${player2.name} deals ${p2Damage} damage to ${player1.name}`);
    
    round++;
  }
  
  // Determine winner
  const winner = player1Health > player2Health ? player1 : player2;
  const loser = winner === player1 ? player2 : player1;
  
  battle.winner = winner._id;
  battle.loser = loser._id;
  battle.endTime = new Date();
  
  // Update PvP stats
  winner.updatePvPStats('win');
  loser.updatePvPStats('loss');
  
  // Reset battle status
  player1.inBattle = false;
  player2.inBattle = false;
  await player1.save();
  await player2.save();
  
  return battle;
}

// Helper function to calculate damage
function calculateDamage(character) {
  let baseDamage = 10;
  
  // Add weapon damage
  if (character.equipment.weapon) {
    baseDamage += character.equipment.weapon.stats.damage || 0;
  }
  
  // Add stat bonuses
  switch (character.class) {
    case 'warrior':
      baseDamage += character.stats.strength * 2;
      break;
    case 'mage':
      baseDamage += character.stats.intelligence * 2;
      break;
    case 'rogue':
      baseDamage += character.stats.dexterity * 2;
      break;
    case 'healer':
      baseDamage += character.stats.intelligence * 1.5;
      break;
  }
  
  // Add some randomness
  return Math.floor(baseDamage * (0.8 + Math.random() * 0.4));
}