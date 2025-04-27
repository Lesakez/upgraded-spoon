import Character from '../models/Character.js';
import Item from '../models/Item.js';
import { asyncHandler } from '../middleware/error.middleware.js';

// @desc    Get character inventory
// @route   GET /api/characters/:characterId/inventory
// @access  Private
export const getInventory = asyncHandler(async (req, res) => {
  try {
    const character = await Character.findById(req.params.characterId)
      .populate('inventory.item');

    if (!character) {
      res.status(404);
      throw new Error('Character not found');
    }

    // Make sure user owns character
    if (character.user.toString() !== req.user.id) {
      res.status(401);
      throw new Error('Not authorized to access this character\'s inventory');
    }

    // Return the character's inventory directly
    res.status(200).json({
      success: true,
      data: character.inventory || []
    });
  } catch (error) {
    console.error('Error in getInventory:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch inventory'
    });
  }
});

// @desc    Add item to inventory
// @route   POST /api/characters/:characterId/inventory
// @access  Private
export const addItemToInventory = asyncHandler(async (req, res) => {
  const { itemId, quantity = 1 } = req.body;
  const character = await Character.findById(req.params.characterId);
  const item = await Item.findById(itemId);

  if (!character) {
    res.status(404);
    throw new Error('Character not found');
  }

  if (!item) {
    res.status(404);
    throw new Error('Item not found');
  }

  // Make sure user owns character
  if (character.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to access this character\'s inventory');
  }

  // Check if item already exists in inventory
  const existingItemIndex = character.inventory.findIndex(
    invItem => invItem.item.toString() === itemId
  );

  if (existingItemIndex > -1) {
    // If item is stackable, increase quantity
    if (item.stackable) {
      const newQuantity = character.inventory[existingItemIndex].quantity + quantity;
      
      if (newQuantity > item.maxStack) {
        res.status(400);
        throw new Error(`Cannot exceed max stack size of ${item.maxStack}`);
      }
      
      character.inventory[existingItemIndex].quantity = newQuantity;
    } else {
      res.status(400);
      throw new Error('Item is not stackable');
    }
  } else {
    // Add new item to inventory
    character.inventory.push({
      item: itemId,
      quantity: quantity
    });
  }

  await character.save();

  res.status(200).json({
    success: true,
    data: character.inventory
  });
});

// @desc    Remove item from inventory
// @route   DELETE /api/characters/:characterId/inventory/:itemId
// @access  Private
export const removeItemFromInventory = asyncHandler(async (req, res) => {
  const { quantity = 1 } = req.body;
  const character = await Character.findById(req.params.characterId);

  if (!character) {
    res.status(404);
    throw new Error('Character not found');
  }

  // Make sure user owns character
  if (character.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to access this character\'s inventory');
  }

  // Find item in inventory
  const itemIndex = character.inventory.findIndex(
    invItem => invItem.item.toString() === req.params.itemId
  );

  if (itemIndex === -1) {
    res.status(404);
    throw new Error('Item not found in inventory');
  }

  // Check if we have enough quantity
  if (character.inventory[itemIndex].quantity < quantity) {
    res.status(400);
    throw new Error('Not enough items in inventory');
  }

  // Remove specified quantity
  character.inventory[itemIndex].quantity -= quantity;

  // If quantity reaches 0, remove item completely
  if (character.inventory[itemIndex].quantity <= 0) {
    character.inventory.splice(itemIndex, 1);
  }

  await character.save();

  res.status(200).json({
    success: true,
    data: character.inventory
  });
});

// @desc    Use item
// @route   POST /api/characters/:characterId/inventory/:itemId/use
// @access  Private
export const useItem = asyncHandler(async (req, res) => {
  const character = await Character.findById(req.params.characterId);
  const item = await Item.findById(req.params.itemId);

  if (!character) {
    res.status(404);
    throw new Error('Character not found');
  }

  if (!item) {
    res.status(404);
    throw new Error('Item not found');
  }

  // Make sure user owns character
  if (character.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to use items for this character');
  }

  // Check if item exists in inventory
  const itemIndex = character.inventory.findIndex(
    invItem => invItem.item.toString() === req.params.itemId
  );

  if (itemIndex === -1) {
    res.status(404);
    throw new Error('Item not found in inventory');
  }

  // Check if item is consumable
  if (item.type !== 'consumable') {
    res.status(400);
    throw new Error('Item is not consumable');
  }

  // Apply item effects
  item.effects.forEach(effect => {
    switch (effect.type) {
      case 'heal':
        character.health.current = Math.min(
          character.health.current + effect.value,
          character.health.max
        );
        break;
      case 'mana':
        character.mana.current = Math.min(
          character.mana.current + effect.value,
          character.mana.max
        );
        break;
      case 'buff':
        // Implement buff system here
        break;
    }
  });

  // Remove one item from inventory
  character.inventory[itemIndex].quantity -= 1;
  if (character.inventory[itemIndex].quantity <= 0) {
    character.inventory.splice(itemIndex, 1);
  }

  await character.save();

  res.status(200).json({
    success: true,
    data: {
      character,
      itemUsed: item
    }
  });
});

// @desc    Drop item
// @route   POST /api/characters/:characterId/inventory/:itemId/drop
// @access  Private
export const dropItem = asyncHandler(async (req, res) => {
  const { quantity = 1 } = req.body;
  const character = await Character.findById(req.params.characterId);
  const item = await Item.findById(req.params.itemId);

  if (!character) {
    res.status(404);
    throw new Error('Character not found');
  }

  if (!item) {
    res.status(404);
    throw new Error('Item not found');
  }

  // Make sure user owns character
  if (character.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to drop items for this character');
  }

  // Find item in inventory
  const itemIndex = character.inventory.findIndex(
    invItem => invItem.item.toString() === req.params.itemId
  );

  if (itemIndex === -1) {
    res.status(404);
    throw new Error('Item not found in inventory');
  }

  // Check if we have enough quantity
  if (character.inventory[itemIndex].quantity < quantity) {
    res.status(400);
    throw new Error('Not enough items in inventory');
  }

  // Check if item is not quest item
  if (item.isQuestItem) {
    res.status(400);
    throw new Error('Cannot drop quest items');
  }

  // Remove specified quantity
  character.inventory[itemIndex].quantity -= quantity;

  // If quantity reaches 0, remove item completely
  if (character.inventory[itemIndex].quantity <= 0) {
    character.inventory.splice(itemIndex, 1);
  }

  await character.save();

  // TODO: Create dropped item on the map

  res.status(200).json({
    success: true,
    data: character.inventory
  });
});

// @desc    Transfer item between characters
// @route   POST /api/characters/:characterId/inventory/:itemId/transfer
// @access  Private
export const transferItem = asyncHandler(async (req, res) => {
  const { targetCharacterId, quantity = 1 } = req.body;
  const sourceCharacter = await Character.findById(req.params.characterId);
  const targetCharacter = await Character.findById(targetCharacterId);
  const item = await Item.findById(req.params.itemId);

  if (!sourceCharacter || !targetCharacter) {
    res.status(404);
    throw new Error('Character not found');
  }

  if (!item) {
    res.status(404);
    throw new Error('Item not found');
  }

  // Make sure user owns source character
  if (sourceCharacter.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to transfer items from this character');
  }

  // Check if item is tradeable
  if (!item.isTradeable) {
    res.status(400);
    throw new Error('Item is not tradeable');
  }

  // Find item in source inventory
  const sourceItemIndex = sourceCharacter.inventory.findIndex(
    invItem => invItem.item.toString() === req.params.itemId
  );

  if (sourceItemIndex === -1) {
    res.status(404);
    throw new Error('Item not found in inventory');
  }

  // Check if we have enough quantity
  if (sourceCharacter.inventory[sourceItemIndex].quantity < quantity) {
    res.status(400);
    throw new Error('Not enough items in inventory');
  }

  // Remove from source inventory
  sourceCharacter.inventory[sourceItemIndex].quantity -= quantity;
  if (sourceCharacter.inventory[sourceItemIndex].quantity <= 0) {
    sourceCharacter.inventory.splice(sourceItemIndex, 1);
  }

  // Add to target inventory
  const targetItemIndex = targetCharacter.inventory.findIndex(
    invItem => invItem.item.toString() === req.params.itemId
  );

  if (targetItemIndex > -1) {
    targetCharacter.inventory[targetItemIndex].quantity += quantity;
  } else {
    targetCharacter.inventory.push({
      item: req.params.itemId,
      quantity: quantity
    });
  }

  await sourceCharacter.save();
  await targetCharacter.save();

  res.status(200).json({
    success: true,
    data: {
      sourceInventory: sourceCharacter.inventory,
      targetInventory: targetCharacter.inventory
    }
  });
});