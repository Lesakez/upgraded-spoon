import Quest from '../models/Quest.js';
import Character from '../models/Character.js';
import NPC from '../models/NPC.js';
import { asyncHandler } from '../middleware/error.middleware.js';

// @desc    Get all available quests for character
// @route   GET /api/quests/available/:characterId
// @access  Private
export const getAvailableQuests = asyncHandler(async (req, res) => {
  const character = await Character.findById(req.params.characterId)
    .populate('activeQuests.quest')
    .populate('completedQuests.quest');

  if (!character) {
    res.status(404);
    throw new Error('Character not found');
  }

  // Make sure user owns character
  if (character.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to access this character');
  }

  const availableQuests = await Quest.find({ isActive: true })
    .populate('npc.start')
    .populate('rewards.items.item');

  const filteredQuests = availableQuests.filter(quest => 
    quest.canBeAcceptedBy(character)
  );

  res.status(200).json({
    success: true,
    count: filteredQuests.length,
    data: filteredQuests
  });
});

// @desc    Accept quest
// @route   POST /api/quests/:questId/accept
// @access  Private
export const acceptQuest = asyncHandler(async (req, res) => {
  try {
    const { characterId } = req.body;
    
    if (!characterId) {
      res.status(400);
      throw new Error('Character ID is required');
    }

    const quest = await Quest.findById(req.params.questId);
    const character = await Character.findById(characterId);

    if (!quest) {
      res.status(404);
      throw new Error('Quest not found');
    }

    if (!character) {
      res.status(404);
      throw new Error('Character not found');
    }

    // Make sure user owns character
    if (character.user.toString() !== req.user.id) {
      res.status(401);
      throw new Error('Not authorized to accept quest for this character');
    }

    // Check if character can accept quest
    if (!quest.canBeAcceptedBy(character)) {
      res.status(400);
      throw new Error('Character cannot accept this quest');
    }

    // Add quest to character's active quests
    character.activeQuests.push({
      quest: quest._id,
      progress: new Map(quest.objectives.map(obj => [obj.target, 0])),
      startedAt: new Date()
    });

    await character.save();

    res.status(200).json({
      success: true,
      data: {
        quest,
        startedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error in acceptQuest:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to accept quest'
    });
  }
});

// @desc    Update quest progress
// @route   PUT /api/quests/:questId/progress
// @access  Private
export const updateQuestProgress = asyncHandler(async (req, res) => {
  const { characterId, targetId, amount } = req.body;
  const character = await Character.findById(characterId);

  if (!character) {
    res.status(404);
    throw new Error('Character not found');
  }

  // Make sure user owns character
  if (character.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to update quest progress for this character');
  }

  // Find active quest
  const activeQuestIndex = character.activeQuests.findIndex(
    q => q.quest.toString() === req.params.questId
  );

  if (activeQuestIndex === -1) {
    res.status(400);
    throw new Error('Quest not found in active quests');
  }

  // Update progress
  const currentProgress = character.activeQuests[activeQuestIndex].progress.get(targetId) || 0;
  character.activeQuests[activeQuestIndex].progress.set(targetId, currentProgress + amount);
  
  await character.save();

  res.status(200).json({
    success: true,
    data: character.activeQuests[activeQuestIndex]
  });
});

// @desc    Complete quest
// @route   POST /api/quests/:questId/complete
// @access  Private
export const completeQuest = asyncHandler(async (req, res) => {
  const { characterId } = req.body;
  const quest = await Quest.findById(req.params.questId)
    .populate('rewards.items.item');
  const character = await Character.findById(characterId);

  if (!quest) {
    res.status(404);
    throw new Error('Quest not found');
  }

  if (!character) {
    res.status(404);
    throw new Error('Character not found');
  }

  // Make sure user owns character
  if (character.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to complete quest for this character');
  }

  // Find active quest
  const activeQuestIndex = character.activeQuests.findIndex(
    q => q.quest.toString() === req.params.questId
  );

  if (activeQuestIndex === -1) {
    res.status(400);
    throw new Error('Quest not found in active quests');
  }

  // Check if all objectives are completed
  const activeQuest = character.activeQuests[activeQuestIndex];
  const isCompleted = quest.objectives.every(objective => {
    const progress = activeQuest.progress.get(objective.target) || 0;
    return progress >= objective.quantity;
  });

  if (!isCompleted) {
    res.status(400);
    throw new Error('Quest objectives not completed');
  }

  // Remove from active quests
  character.activeQuests.splice(activeQuestIndex, 1);

  // Add to completed quests
  character.completedQuests.push({
    quest: quest._id,
    completedAt: new Date()
  });

  // Give rewards
  character.experience += quest.rewards.experience;
  character.gold += quest.rewards.gold;

  // Add items to inventory
  quest.rewards.items.forEach(reward => {
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
  });

  // Check for level up
  while (character.canLevelUp()) {
    character.levelUp();
  }

  await character.save();

  res.status(200).json({
    success: true,
    data: {
      experience: quest.rewards.experience,
      gold: quest.rewards.gold,
      items: quest.rewards.items,
      newLevel: character.level
    }
  });
});

// @desc    Abandon quest
// @route   POST /api/quests/:questId/abandon
// @access  Private
export const abandonQuest = asyncHandler(async (req, res) => {
  const { characterId } = req.body;
  const character = await Character.findById(characterId);

  if (!character) {
    res.status(404);
    throw new Error('Character not found');
  }

  // Make sure user owns character
  if (character.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to abandon quest for this character');
  }

  // Find active quest
  const activeQuestIndex = character.activeQuests.findIndex(
    q => q.quest.toString() === req.params.questId
  );

  if (activeQuestIndex === -1) {
    res.status(400);
    throw new Error('Quest not found in active quests');
  }

  // Remove from active quests
  character.activeQuests.splice(activeQuestIndex, 1);
  await character.save();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get quest details
// @route   GET /api/quests/:id
// @access  Private
export const getQuest = asyncHandler(async (req, res) => {
  const quest = await Quest.findById(req.params.id)
    .populate('npc.start')
    .populate('npc.end')
    .populate('rewards.items.item')
    .populate('requirements.prerequisiteQuests');

  if (!quest) {
    res.status(404);
    throw new Error('Quest not found');
  }

  res.status(200).json({
    success: true,
    data: quest
  });
});