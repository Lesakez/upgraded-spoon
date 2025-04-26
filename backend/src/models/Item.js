import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Item description is required']
  },
  type: {
    type: String,
    required: true,
    enum: ['weapon', 'armor', 'helmet', 'boots', 'accessory', 'consumable', 'material', 'quest']
  },
  rarity: {
    type: String,
    required: true,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  requirements: {
    level: { type: Number, default: 1 },
    class: [{ type: String, enum: ['warrior', 'mage', 'rogue', 'healer'] }],
    stats: {
      strength: { type: Number, default: 0 },
      intelligence: { type: Number, default: 0 },
      dexterity: { type: Number, default: 0 },
      vitality: { type: Number, default: 0 }
    }
  },
  stats: {
    damage: { type: Number, default: 0 },
    defense: { type: Number, default: 0 },
    magicPower: { type: Number, default: 0 },
    health: { type: Number, default: 0 },
    mana: { type: Number, default: 0 },
    strength: { type: Number, default: 0 },
    intelligence: { type: Number, default: 0 },
    dexterity: { type: Number, default: 0 },
    vitality: { type: Number, default: 0 }
  },
  effects: [{
    type: { type: String },
    value: { type: Number },
    duration: { type: Number } // in seconds, 0 for permanent
  }],
  value: {
    type: Number,
    default: 0,
    min: 0
  },
  stackable: {
    type: Boolean,
    default: false
  },
  maxStack: {
    type: Number,
    default: 1,
    min: 1
  },
  icon: {
    type: String,
    default: 'default_item.png'
  },
  isQuestItem: {
    type: Boolean,
    default: false
  },
  isTradeable: {
    type: Boolean,
    default: true
  },
  isSellable: {
    type: Boolean,
    default: true
  }
});

// Method to check if character can use this item
itemSchema.methods.canBeUsedBy = function(character) {
  // Check level requirement
  if (character.level < this.requirements.level) {
    return false;
  }
  
  // Check class requirement
  if (this.requirements.class.length > 0 && !this.requirements.class.includes(character.class)) {
    return false;
  }
  
  // Check stats requirements
  for (const [stat, value] of Object.entries(this.requirements.stats)) {
    if (character.stats[stat] < value) {
      return false;
    }
  }
  
  return true;
};

export default mongoose.models.Item || mongoose.model('Item', itemSchema);