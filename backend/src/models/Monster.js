import mongoose from 'mongoose';

const monsterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Monster name is required'],
    trim: true
  },
  description: {
    type: String
  },
  type: {
    type: String,
    required: true,
    enum: ['normal', 'elite', 'boss', 'rare']
  },
  level: {
    type: Number,
    required: true,
    min: 1
  },
  health: {
    current: { type: Number },
    max: { type: Number, required: true }
  },
  mana: {
    current: { type: Number, default: 0 },
    max: { type: Number, default: 0 }
  },
  stats: {
    strength: { type: Number, default: 10 },
    intelligence: { type: Number, default: 10 },
    dexterity: { type: Number, default: 10 },
    vitality: { type: Number, default: 10 }
  },
  damage: {
    min: { type: Number, required: true },
    max: { type: Number, required: true }
  },
  defense: {
    type: Number,
    default: 0
  },
  experienceValue: {
    type: Number,
    required: true
  },
  goldValue: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 }
  },
  drops: [{
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
    chance: { type: Number, default: 10, min: 0, max: 100 }, // percentage
    minQuantity: { type: Number, default: 1 },
    maxQuantity: { type: Number, default: 1 }
  }],
  skills: [{
    skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
    chance: { type: Number, default: 10, min: 0, max: 100 } // percentage chance to use
  }],
  behavior: {
    aggressive: { type: Boolean, default: true },
    aggroRange: { type: Number, default: 10 },
    leashRange: { type: Number, default: 20 },
    attackSpeed: { type: Number, default: 2000 }, // in milliseconds
    movementSpeed: { type: Number, default: 5 }
  },
  spawnLocations: [{
    map: { type: String, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    radius: { type: Number, default: 10 }
  }],
  respawnTime: {
    type: Number,
    default: 300 // in seconds
  },
  faction: {
    type: String,
    default: 'hostile'
  },
  model: {
    type: String,
    default: 'default_monster'
  },
  animations: {
    idle: { type: String, default: 'idle' },
    attack: { type: String, default: 'attack' },
    death: { type: String, default: 'death' },
    hit: { type: String, default: 'hit' }
  }
});

// Initialize current health when creating monster
monsterSchema.pre('save', function(next) {
  if (this.isNew && !this.health.current) {
    this.health.current = this.health.max;
  }
  next();
});

// Method to calculate random damage
monsterSchema.methods.calculateDamage = function() {
  return Math.floor(Math.random() * (this.damage.max - this.damage.min + 1)) + this.damage.min;
};

// Method to calculate gold drop
monsterSchema.methods.calculateGoldDrop = function() {
  return Math.floor(Math.random() * (this.goldValue.max - this.goldValue.min + 1)) + this.goldValue.min;
};

// Method to generate loot
monsterSchema.methods.generateLoot = async function() {
  const loot = [];
  
  for (const drop of this.drops) {
    if (Math.random() * 100 < drop.chance) {
      const quantity = drop.minQuantity === drop.maxQuantity ? 
        drop.minQuantity : 
        Math.floor(Math.random() * (drop.maxQuantity - drop.minQuantity + 1)) + drop.minQuantity;
      
      loot.push({
        item: drop.item,
        quantity: quantity
      });
    }
  }
  
  return loot;
};

export default mongoose.models.Monster || mongoose.model('Monster', monsterSchema);