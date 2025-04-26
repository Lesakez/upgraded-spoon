import Character from '../models/Character.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/error.middleware.js';

// @desc    Create new character
// @route   POST /api/characters
// @access  Private
export const createCharacter = asyncHandler(async (req, res) => {
  const { name, class: characterClass } = req.body;

  // Check if character name is taken
  const existingCharacter = await Character.findOne({ name });
  if (existingCharacter) {
    res.status(400);
    throw new Error('Character name is already taken');
  }

  // Create character
  const character = await Character.create({
    user: req.user.id,
    name,
    class: characterClass
  });

  // Add character to user's characters array
  await User.findByIdAndUpdate(req.user.id, {
    $push: { characters: character._id }
  });

  res.status(201).json({
    success: true,
    data: character
  });
});

// @desc    Get all characters for user
// @route   GET /api/characters
// @access  Private
export const getCharacters = asyncHandler(async (req, res) => {
  const characters = await Character.find({ user: req.user.id })
    .populate('equipment.weapon')
    .populate('equipment.armor')
    .populate('equipment.helmet')
    .populate('equipment.boots')
    .populate('equipment.accessory');

  res.status(200).json({
    success: true,
    count: characters.length,
    data: characters
  });
});

// @desc    Get single character
// @route   GET /api/characters/:id
// @access  Private
export const getCharacter = asyncHandler(async (req, res) => {
  const character = await Character.findById(req.params.id)
    .populate('equipment.weapon')
    .populate('equipment.armor')
    .populate('equipment.helmet')
    .populate('equipment.boots')
    .populate('equipment.accessory')
    .populate('inventory.item')
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

  res.status(200).json({
    success: true,
    data: character
  });
});

// @desc    Update character
// @route   PUT /api/characters/:id
// @access  Private
export const updateCharacter = asyncHandler(async (req, res) => {
  let character = await Character.findById(req.params.id);

  if (!character) {
    res.status(404);
    throw new Error('Character not found');
  }

  // Make sure user owns character
  if (character.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to update this character');
  }

  character = await Character.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: character
  });
});

// @desc    Delete character
// @route   DELETE /api/characters/:id
// @access  Private
export const deleteCharacter = asyncHandler(async (req, res) => {
  const character = await Character.findById(req.params.id);

  if (!character) {
    res.status(404);
    throw new Error('Character not found');
  }

  // Make sure user owns character
  if (character.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to delete this character');
  }

  await character.deleteOne();

  // Remove character from user's characters array
  await User.findByIdAndUpdate(req.user.id, {
    $pull: { characters: character._id }
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Move character
// @route   PUT /api/characters/:id/move
// @access  Private
export const moveCharacter = asyncHandler(async (req, res) => {
  const { x, y, map } = req.body;
  
  const character = await Character.findById(req.params.id);

  if (!character) {
    res.status(404);
    throw new Error('Character not found');
  }

  // Make sure user owns character
  if (character.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to move this character');
  }

  character.position = { x, y, map };
  await character.save();

  res.status(200).json({
    success: true,
    data: character.position
  });
});

// @desc    Level up character
// @route   PUT /api/characters/:id/levelup
// @access  Private
export const levelUpCharacter = asyncHandler(async (req, res) => {
  const character = await Character.findById(req.params.id);

  if (!character) {
    res.status(404);
    throw new Error('Character not found');
  }

  // Make sure user owns character
  if (character.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to level up this character');
  }

  if (!character.canLevelUp()) {
    res.status(400);
    throw new Error('Not enough experience to level up');
  }

  character.levelUp();
  await character.save();

  res.status(200).json({
    success: true,
    data: character
  });
});

// @desc    Equip item
// @route   PUT /api/characters/:id/equip
// @access  Private
export const equipItem = asyncHandler(async (req, res) => {
  const { itemId, slot } = req.body;
  
  const character = await Character.findById(req.params.id);

  if (!character) {
    res.status(404);
    throw new Error('Character not found');
  }

  // Make sure user owns character
  if (character.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to equip items on this character');
  }

  // Check if item exists in inventory
  const inventoryItemIndex = character.inventory.findIndex(
    item => item.item.toString() === itemId
  );

  if (inventoryItemIndex === -1) {
    res.status(400);
    throw new Error('Item not found in inventory');
  }

  // Remove item from inventory
  const [inventoryItem] = character.inventory.splice(inventoryItemIndex, 1);

  // Unequip current item if any
  if (character.equipment[slot]) {
    character.inventory.push({
      item: character.equipment[slot],
      quantity: 1
    });
  }

  // Equip new item
  character.equipment[slot] = inventoryItem.item;
  await character.save();

  res.status(200).json({
    success: true,
    data: character
  });
});

// @desc    Unequip item
// @route   PUT /api/characters/:id/unequip
// @access  Private
export const unequipItem = asyncHandler(async (req, res) => {
  const { slot } = req.body;
  
  const character = await Character.findById(req.params.id);

  if (!character) {
    res.status(404);
    throw new Error('Character not found');
  }

  // Make sure user owns character
  if (character.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to unequip items on this character');
  }

  if (!character.equipment[slot]) {
    res.status(400);
    throw new Error('No item equipped in this slot');
  }

  // Move item to inventory
  character.inventory.push({
    item: character.equipment[slot],
    quantity: 1
  });

  // Remove from equipment
  character.equipment[slot] = null;
  await character.save();

  res.status(200).json({
    success: true,
    data: character
  });
});