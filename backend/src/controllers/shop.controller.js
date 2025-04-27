import Item from '../models/Item.js';
import Character from '../models/Character.js';
import NPC from '../models/NPC.js';
import { asyncHandler } from '../middleware/error.middleware.js';

// @desc    Get shop items
// @route   GET /api/shops/:npcId
// @access  Private
export const getShopItems = asyncHandler(async (req, res) => {
  const npc = await NPC.findById(req.params.npcId)
    .populate('shop.items.item');
  
  if (!npc) {
    res.status(404);
    throw new Error('Shop not found');
  }
  
  if (npc.type !== 'merchant') {
    res.status(400);
    throw new Error('This NPC is not a merchant');
  }
  
  res.status(200).json({
    success: true,
    data: npc.shop
  });
});

// @desc    Buy item from shop
// @route   POST /api/shops/:npcId/buy
// @access  Private
export const buyItem = asyncHandler(async (req, res) => {
  const { characterId, itemId, quantity = 1 } = req.body;
  
  const character = await Character.findById(characterId);
  const npc = await NPC.findById(req.params.npcId);
  
  if (!character) {
    res.status(404);
    throw new Error('Character not found');
  }
  
  if (!npc) {
    res.status(404);
    throw new Error('Shop not found');
  }
  
  // Make sure user owns character
  if (character.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to use this character');
  }
  
  // Find item in shop
  const shopItem = npc.shop.items.find(item => item.item.toString() === itemId);
  if (!shopItem) {
    res.status(404);
    throw new Error('Item not found in this shop');
  }
  
  // Check stock
  if (shopItem.stock !== -1 && shopItem.stock < quantity) {
    res.status(400);
    throw new Error('Not enough stock');
  }
  
  // Calculate total price
  const totalPrice = shopItem.price * quantity;
  
  // Check if character has enough gold
  if (character.gold < totalPrice) {
    res.status(400);
    throw new Error('Not enough gold');
  }
  
  // Deduct gold
  character.gold -= totalPrice;
  
  // Add item to inventory
  const item = await Item.findById(itemId);
  const existingItemIndex = character.inventory.findIndex(
    invItem => invItem.item.toString() === itemId
  );
  
  if (existingItemIndex > -1 && item.stackable) {
    // Add to existing stack
    const newQuantity = character.inventory[existingItemIndex].quantity + quantity;
    if (newQuantity > item.maxStack) {
      res.status(400);
      throw new Error(`Cannot exceed max stack size of ${item.maxStack}`);
    }
    character.inventory[existingItemIndex].quantity = newQuantity;
  } else {
    // Add new item
    character.inventory.push({
      item: itemId,
      quantity: quantity
    });
  }
  
  // Update stock if not unlimited
  if (shopItem.stock !== -1) {
    shopItem.stock -= quantity;
    await npc.save();
  }
  
  await character.save();
  
  res.status(200).json({
    success: true,
    data: {
      character,
      purchasedItem: {
        item,
        quantity,
        totalPrice
      }
    }
  });
});

// @desc    Sell item to shop
// @route   POST /api/shops/:npcId/sell
// @access  Private
export const sellItem = asyncHandler(async (req, res) => {
  const { characterId, itemId, quantity = 1 } = req.body;
  
  const character = await Character.findById(characterId);
  const npc = await NPC.findById(req.params.npcId);
  
  if (!character) {
    res.status(404);
    throw new Error('Character not found');
  }
  
  if (!npc) {
    res.status(404);
    throw new Error('Shop not found');
  }
  
  // Make sure user owns character
  if (character.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to use this character');
  }
  
  // Find item in inventory
  const inventoryItemIndex = character.inventory.findIndex(
    invItem => invItem.item.toString() === itemId
  );
  
  if (inventoryItemIndex === -1) {
    res.status(404);
    throw new Error('Item not found in inventory');
  }
  
  // Check if have enough quantity
  if (character.inventory[inventoryItemIndex].quantity < quantity) {
    res.status(400);
    throw new Error('Not enough items to sell');
  }
  
  const item = await Item.findById(itemId);
  
  // Check if item is sellable
  if (!item.isSellable) {
    res.status(400);
    throw new Error('This item cannot be sold');
  }
  
  // Calculate sell price (usually 50% of item value)
  const sellPrice = Math.floor(item.value * npc.shop.buyMultiplier) * quantity;
  
  // Update inventory
  character.inventory[inventoryItemIndex].quantity -= quantity;
  if (character.inventory[inventoryItemIndex].quantity <= 0) {
    character.inventory.splice(inventoryItemIndex, 1);
  }
  
  // Add gold
  character.gold += sellPrice;
  
  await character.save();
  
  res.status(200).json({
    success: true,
    data: {
      character,
      soldItem: {
        item,
        quantity,
        sellPrice
      }
    }
  });
});

// @desc    Get all shops
// @route   GET /api/shops
// @access  Private
export const getAllShops = asyncHandler(async (req, res) => {
  const shops = await NPC.find({ type: 'merchant' })
    .select('name title location shop')
    .populate('shop.items.item');
  
  res.status(200).json({
    success: true,
    count: shops.length,
    data: shops
  });
});