import Character from '../models/Character.js';
import { asyncHandler } from '../middleware/error.middleware.js';

// @desc    Get tavern info and rumors
// @route   GET /api/tavern
// @access  Private
export const getTavernInfo = asyncHandler(async (req, res) => {
  // Get online players count
  const onlinePlayersCount = await Character.countDocuments({ isOnline: true });
  
  // Get recent activities (rumors)
  const recentActivities = [
    {
      type: 'dungeon_cleared',
      message: 'A group of adventurers cleared the Dark Forest Dungeon!',
      timestamp: new Date(Date.now() - 15 * 60 * 1000) // 15 minutes ago
    },
    {
      type: 'rare_drop',
      message: 'Someone found a legendary sword in the Ancient Ruins!',
      timestamp: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
    },
    {
      type: 'boss_spawn',
      message: 'The Dragon Lord has awakened in the Mountain Peak!',
      timestamp: new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
    }
  ];
  
  // Get top players currently online
  const topPlayers = await Character.find({ isOnline: true })
    .sort({ level: -1, experience: -1 })
    .limit(5)
    .select('name level class');
  
  res.status(200).json({
    success: true,
    data: {
      onlinePlayersCount,
      recentActivities,
      topPlayers,
      services: [
        {
          name: 'Buy Drinks',
          description: 'Restore Health',
          cost: 10,
          type: 'heal',
          value: 50
        },
        {
          name: 'Rest',
          description: 'Restore HP & MP',
          cost: 50,
          type: 'rest',
          value: 'full'
        }
      ]
    }
  });
});

// @desc    Use tavern service (rest, buy drinks, etc.)
// @route   POST /api/tavern/service
// @access  Private
export const useTavernService = asyncHandler(async (req, res) => {
  const { characterId, service } = req.body;
  
  const character = await Character.findById(characterId);
  
  if (!character) {
    res.status(404);
    throw new Error('Character not found');
  }
  
  // Make sure user owns character
  if (character.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to use this character');
  }
  
  switch (service) {
    case 'drinks':
      // Buy drinks (heal 50 HP)
      const drinksCost = 10;
      
      if (character.gold < drinksCost) {
        res.status(400);
        throw new Error('Not enough gold for drinks');
      }
      
      character.gold -= drinksCost;
      character.health.current = Math.min(
        character.health.current + 50,
        character.health.max
      );
      break;
      
    case 'rest':
      // Rest (full heal)
      const restCost = 50;
      
      if (character.gold < restCost) {
        res.status(400);
        throw new Error('Not enough gold to rest');
      }
      
      character.gold -= restCost;
      character.health.current = character.health.max;
      character.mana.current = character.mana.max;
      break;
      
    default:
      res.status(400);
      throw new Error('Invalid service');
  }
  
  await character.save();
  
  res.status(200).json({
    success: true,
    data: character
  });
});

// @desc    Join gambling game
// @route   POST /api/tavern/gamble
// @access  Private
export const gamble = asyncHandler(async (req, res) => {
  const { characterId, amount } = req.body;
  
  const character = await Character.findById(characterId);
  
  if (!character) {
    res.status(404);
    throw new Error('Character not found');
  }
  
  // Make sure user owns character
  if (character.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to use this character');
  }
  
  // Validate amount
  const minBet = 10;
  const maxBet = Math.min(1000, character.gold);
  
  if (amount < minBet) {
    res.status(400);
    throw new Error(`Minimum bet is ${minBet} gold`);
  }
  
  if (amount > maxBet) {
    res.status(400);
    throw new Error(`Maximum bet is ${maxBet} gold`);
  }
  
  if (character.gold < amount) {
    res.status(400);
    throw new Error('Not enough gold to gamble');
  }
  
  // Simple gambling game - 45% win chance
  const roll = Math.random();
  let winAmount = 0;
  let result = 'lose';
  
  if (roll < 0.45) {
    // Win - double your money
    winAmount = amount;
    character.gold += winAmount;
    result = 'win';
  } else {
    // Lose
    character.gold -= amount;
  }
  
  await character.save();
  
  res.status(200).json({
    success: true,
    data: {
      result,
      roll: roll.toFixed(2),
      amount,
      winAmount,
      newGold: character.gold
    }
  });
});