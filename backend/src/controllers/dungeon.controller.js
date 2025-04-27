import Dungeon from '../models/Dungeon.js';
import Character from '../models/Character.js';
import { asyncHandler } from '../middleware/error.middleware.js';

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

export const getDungeon = asyncHandler(async (req, res) => {
  const dungeon = await Dungeon.findById(req.params.id)
    .populate('requirements.requiredQuest')
    .populate('requirements.keyItem')
    .populate('floors.monster')
    .populate('floors.boss.monster')
    .populate('floors.boss.rewards.guaranteed.item')
    .populate('floors.boss.rewards.chances.item')
    .populate('floors.treasures.item');

  if (!dungeon) {
    res.status(404);
    throw new Error('Dungeon not found');
  }

  res.status(200).json({
    success: true,
    data: dungeon
  });
});

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

  if (character.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to enter dungeon with this character');
  }

  const canEnterResult = dungeon.canEnter(character);
  if (!canEnterResult.canEnter) {
    res.status(400);
    throw new Error(canEnterResult.reason);
  }

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

  character.inBattle = true;
  character.currentBattle = {
    dungeonId: dungeon._id,
    instanceId: instance.id,
    startedAt: new Date()
  };
  await character.save();

  res.status(200).json({
    success: true,
    data: {
      instanceId: instance.id,
      dungeon: dungeon._id,
      currentFloor: instance.currentFloor,
      totalFloors: dungeon.totalFloors
    }
  });
});

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

  if (character.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to leave dungeon with this character');
  }

  const instance = dungeon.instances.find(inst => inst.id === instanceId);
  if (!instance) {
    res.status(404);
    throw new Error('Instance not found');
  }

  instance.players = instance.players.filter(
    playerId => playerId.toString() !== character._id.toString()
  );

  if (instance.players.length === 0) {
    instance.state = 'completed';
    instance.completedAt = new Date();
  }

  await dungeon.save();

  character.inBattle = false;
  character.currentBattle = undefined;
  await character.save();

  res.status(200).json({
    success: true,
    data: {}
  });
});

export const moveToNextFloor = asyncHandler(async (req, res) => {
  const { characterId, instanceId } = req.body;
  const dungeon = await Dungeon.findById(req.params.id)
    .populate('floors.monster')
    .populate('floors.boss.monster')
    .populate('floors.treasures.item');
  const character = await Character.findById(characterId);

  if (!dungeon) {
    res.status(404);
    throw new Error('Dungeon not found');
  }

  if (!character) {
    res.status(404);
    throw new Error('Character not found');
  }

  if (character.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to move floors with this character');
  }

  const instance = dungeon.instances.find(inst => inst.id === instanceId);
  if (!instance) {
    res.status(404);
    throw new Error('Instance not found');
  }

  if (instance.currentFloor >= dungeon.totalFloors) {
    res.status(400);
    throw new Error('Already on the last floor');
  }

  const currentFloorData = dungeon.floors.find(f => f.number === instance.currentFloor);
  
  if (currentFloorData.type === 'monster' || currentFloorData.type === 'boss') {
    const monsterId = currentFloorData.type === 'monster' ? 
      currentFloorData.monster._id.toString() : 
      currentFloorData.boss.monster._id.toString();
    
    if (!instance.monstersDefeated.has(monsterId)) {
      res.status(400);
      throw new Error('Current floor not cleared');
    }
  }

  instance.currentFloor += 1;
  instance.floorsCompleted.push(instance.currentFloor - 1);
  
  const nextFloorData = dungeon.floors.find(f => f.number === instance.currentFloor);

  await dungeon.save();
  await character.save();

  res.status(200).json({
    success: true,
    data: {
      currentFloor: instance.currentFloor,
      floorData: nextFloorData
    }
  });
});

export const updateDungeonProgress = asyncHandler(async (req, res) => {
  const { instanceId, monsterId, action } = req.body;
  const dungeon = await Dungeon.findById(req.params.id);

  if (!dungeon) {
    res.status(404);
    throw new Error('Dungeon not found');
  }

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
  }

  await dungeon.save();

  res.status(200).json({
    success: true,
    data: instance
  });
});

export const completeDungeon = asyncHandler(async (req, res) => {
  const { instanceId, characterId } = req.body;
  const dungeon = await Dungeon.findById(req.params.id)
    .populate('floors.boss.rewards.guaranteed.item')
    .populate('floors.boss.rewards.chances.item');
  const character = await Character.findById(characterId);

  if (!dungeon) {
    res.status(404);
    throw new Error('Dungeon not found');
  }

  if (!character) {
    res.status(404);
    throw new Error('Character not found');
  }

  if (character.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to complete dungeon with this character');
  }

  const instance = dungeon.instances.find(inst => inst.id === instanceId);
  if (!instance) {
    res.status(404);
    throw new Error('Instance not found');
  }

  if (instance.currentFloor < dungeon.totalFloors) {
    res.status(400);
    throw new Error('Dungeon not fully completed');
  }

  instance.state = 'completed';
  instance.completedAt = new Date();

  const rewards = {
    guaranteed: [],
    chances: []
  };

  const bossFloor = dungeon.floors.find(f => f.type === 'boss');
  if (bossFloor && bossFloor.boss) {
    bossFloor.boss.rewards.guaranteed.forEach(reward => {
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

    bossFloor.boss.rewards.chances.forEach(reward => {
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
  }

  character.inBattle = false;
  character.currentBattle = undefined;
  character.completedDungeons.push({
    dungeon: dungeon._id,
    completedAt: new Date()
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

export const getDungeonInstances = asyncHandler(async (req, res) => {
  const dungeon = await Dungeon.findById(req.params.id)
    .populate('instances.players', 'name level class');

  if (!dungeon) {
    res.status(404);
    throw new Error('Dungeon not found');
  }

  const activeInstances = dungeon.instances.filter(
    instance => instance.state === 'active'
  );

  res.status(200).json({
    success: true,
    count: activeInstances.length,
    data: activeInstances
  });
});