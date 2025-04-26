import Dungeon from '../models/Dungeon.js';
import Character from '../models/Character.js';
import { asyncHandler } from '../middleware/error.middleware.js';

// @desc    Get all dungeons
// @route   GET /api/dungeons
// @access  Private
export const getDungeons = asyncHandler(async (req, res) => {
  const dungeons = await Dungeon.find({ isActive: true })
    .populate('requirements.requiredQuest')
    .populate('requirements.keyItem');

  res.status(200).json({
    success: true,
    count: dungeons.length,
    data: dungeons
  });
});

// @desc    Get single dungeon
// @route   GET /api/dungeons/:id
// @access  Private
export const getDungeon = asyncHandler(async (req, res) => {
  const dungeon = await Dungeon.findById(req.params.id)
    .populate('requirements.requiredQuest')
    .populate('requirements.keyItem')
    .populate('layout.rooms.monsters.monster')
    .populate('layout.rooms.treasures.item')
    .populate('boss.monster')
    .populate('boss.rewards.guaranteed.item')
    .populate('boss.rewards.chances.item');

  if (!dungeon) {
    res.status(404);
    throw new Error('Dungeon not found');
  }

  res.status(200).json({
    success: true,
    data: dungeon
  });
});

// @desc    Enter dungeon
// @route   POST /api/dungeons/:id/enter
// @access  Private
export const enterDungeon = asyncHandler(async (req, res) => {
  const { characterId } = req.body;
  const dungeon = await Dungeon.findById(req.params.id);
  const character = await Character.findById(characterId);

  if (!dungeon) {
    res.status(404);
    throw new Error('Dungeon not found');
  }

  if (!character) {
    res.status(404);
    throw new Error('Character not found');
  }

  // Make sure user owns character
  if (character.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to enter dungeon with this character');
  }

  // Check if character can enter
  if (!dungeon.canEnter(character)) {
    res.status(400);
    throw new Error('Character cannot enter this dungeon');
  }

  // Create or join instance
  let instance = dungeon.instances.find(inst => 
    inst.state === 'active' && 
    inst.players.length < dungeon.maxPlayers
  );

  if (!instance) {
    instance = dungeon.createInstance([character._id]);
  } else {
    instance.players.push(character._id);
  }

  await dungeon.save();

  // Update character position
  character.position.map = `dungeon_${dungeon._id}`;
  character.position.x = 0; // Starting position
  character.position.y = 0;
  await character.save();

  res.status(200).json({
    success: true,
    data: {
      instanceId: instance.id,
      dungeon: dungeon._id
    }
  });
});

// @desc    Leave dungeon
// @route   POST /api/dungeons/:id/leave
// @access  Private
export const leaveDungeon = asyncHandler(async (req, res) => {
  const { characterId, instanceId } = req.body;
  const dungeon = await Dungeon.findById(req.params.id);
  const character = await Character.findById(characterId);

  if (!dungeon) {
    res.status(404);
    throw new Error('Dungeon not found');
  }

  if (!character) {
    res.status(404);
    throw new Error('Character not found');
  }

  // Make sure user owns character
  if (character.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to leave dungeon with this character');
  }

  // Find instance
  const instance = dungeon.instances.find(inst => inst.id === instanceId);
  if (!instance) {
    res.status(404);
    throw new Error('Instance not found');
  }

  // Remove player from instance
  instance.players = instance.players.filter(
    playerId => playerId.toString() !== character._id.toString()
  );

  // If no players left, mark instance as completed
  if (instance.players.length === 0) {
    instance.state = 'completed';
    instance.completedAt = new Date();
  }

  await dungeon.save();

  // Update character position to town
  character.position.map = 'town';
  character.position.x = 0;
  character.position.y = 0;
  await character.save();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Update dungeon progress
// @route   PUT /api/dungeons/:id/progress
// @access  Private
export const updateDungeonProgress = asyncHandler(async (req, res) => {
  const { instanceId, monsterId, roomId, action } = req.body;
  const dungeon = await Dungeon.findById(req.params.id);

  if (!dungeon) {
    res.status(404);
    throw new Error('Dungeon not found');
  }

  // Find instance
  const instance = dungeon.instances.find(inst => inst.id === instanceId);
  if (!instance) {
    res.status(404);
    throw new Error('Instance not found');
  }

  switch (action) {
    case 'monster_killed':
      const currentKills = instance.monstersDefeated.get(monsterId) || 0;
      instance.monstersDefeated.set(monsterId, currentKills + 1);
      break;
    
    case 'boss_defeated':
      instance.bossDefeated = true;
      break;
    
    case 'treasure_looted':
      instance.treasuresLooted.set(roomId, true);
      break;
  }

  await dungeon.save();

  res.status(200).json({
    success: true,
    data: instance
  });
});

// @desc    Complete dungeon
// @route   POST /api/dungeons/:id/complete
// @access  Private
export const completeDungeon = asyncHandler(async (req, res) => {
  const { instanceId, characterId } = req.body;
  const dungeon = await Dungeon.findById(req.params.id)
    .populate('boss.rewards.guaranteed.item')
    .populate('boss.rewards.chances.item');
  const character = await Character.findById(characterId);

  if (!dungeon) {
    res.status(404);
    throw new Error('Dungeon not found');
  }

  if (!character) {
    res.status(404);
    throw new Error('Character not found');
  }

  // Make sure user owns character
  if (character.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to complete dungeon with this character');
  }

  // Find instance
  const instance = dungeon.instances.find(inst => inst.id === instanceId);
  if (!instance) {
    res.status(404);
    throw new Error('Instance not found');
  }

  // Check if boss is defeated
  if (!instance.bossDefeated) {
    res.status(400);
    throw new Error('Boss not defeated');
  }

  // Mark instance as completed
  instance.state = 'completed';
  instance.completedAt = new Date();

  // Give rewards
  const rewards = {
    guaranteed: [],
    chances: []
  };

  // Guaranteed rewards
  dungeon.boss.rewards.guaranteed.forEach(reward => {
    const existingItemIndex = character.inventory.findIndex(
      item => item.item.toString() === reward.item._id.toString()
    );

    if (existingItemIndex > -1) {
      character.inventory[existingItemIndex].quantity += reward.quantity;
    } else {
      character.inventory.push({
        item: reward.item._id,
        quantity: reward.quantity
      });
    }

    rewards.guaranteed.push({
      item: reward.item,
      quantity: reward.quantity
    });
  });

  // Chance-based rewards
  dungeon.boss.rewards.chances.forEach(reward => {
    if (Math.random() * 100 < reward.chance) {
      const existingItemIndex = character.inventory.findIndex(
        item => item.item.toString() === reward.item._id.toString()
      );

      if (existingItemIndex > -1) {
        character.inventory[existingItemIndex].quantity += reward.quantity;
      } else {
        character.inventory.push({
          item: reward.item._id,
          quantity: reward.quantity
        });
      }

      rewards.chances.push({
        item: reward.item,
        quantity: reward.quantity
      });
    }
  });

  await dungeon.save();
  await character.save();

  res.status(200).json({
    success: true,
    data: {
      rewards,
      completedAt: instance.completedAt
    }
  });
});

// @desc    Get dungeon instances
// @route   GET /api/dungeons/:id/instances
// @access  Private
export const getDungeonInstances = asyncHandler(async (req, res) => {
  const dungeon = await Dungeon.findById(req.params.id)
    .populate('instances.players', 'name level class');

  if (!dungeon) {
    res.status(404);
    throw new Error('Dungeon not found');
  }

  // Filter active instances
  const activeInstances = dungeon.instances.filter(
    instance => instance.state === 'active'
  );

  res.status(200).json({
    success: true,
    count: activeInstances.length,
    data: activeInstances
  });
});