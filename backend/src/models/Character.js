import mongoose from 'mongoose';

const characterSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Character name is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Character name must be at least 3 characters long'],
    maxlength: [20, 'Character name cannot exceed 20 characters']
  },
  class: {
    type: String,
    required: [true, 'Character class is required'],
    enum: ['warrior', 'mage', 'rogue', 'healer']
  },
  level: {
    type: Number,
    default: 1,
    min: 1,
    max: 100
  },
  experience: {
    type: Number,
    default: 0,
    min: 0
  },
  stats: {
    strength: { type: Number, default: 10 },
    intelligence: { type: Number, default: 10 },
    dexterity: { type: Number, default: 10 },
    vitality: { type: Number, default: 10 }
  },
  health: {
    current: { type: Number, default: 100 },
    max: { type: Number, default: 100 }
  },
  mana: {
    current: { type: Number, default: 100 },
    max: { type: Number, default: 100 }
  },
  gold: {
    type: Number,
    default: 0,
    min: 0
  },
  inventory: [{
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
    quantity: { type: Number, default: 1, min: 1 }
  }],
  equipment: {
    weapon: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
    armor: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
    helmet: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
    boots: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
    accessory: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' }
  },
  activeQuests: [{
    quest: { type: mongoose.Schema.Types.ObjectId, ref: 'Quest' },
    progress: {
      type: Map,
      of: Number,
      default: {}
    },
    startedAt: { type: Date, default: Date.now }
  }],
  completedQuests: [{
    quest: { type: mongoose.Schema.Types.ObjectId, ref: 'Quest' },
    completedAt: { type: Date, default: Date.now }
  }],
  skills: [{
    skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
    level: { type: Number, default: 1 }
  }],
  // Battle-related fields
  inBattle: {
    type: Boolean,
    default: false
  },
  currentBattle: {
    dungeonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dungeon' },
    instanceId: { type: String },
    startedAt: { type: Date }
  },
  // Social fields
  partyId: { type: String },
  guildId: { type: String },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Character' }],
  isOnline: {
    type: Boolean,
    default: false
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate experience needed for next level
characterSchema.methods.getExperienceForNextLevel = function() {
  return Math.floor(100 * Math.pow(1.5, this.level - 1));
};

// Check if character can level up
characterSchema.methods.canLevelUp = function() {
  return this.experience >= this.getExperienceForNextLevel();
};

// Level up character
characterSchema.methods.levelUp = function() {
  if (this.canLevelUp()) {
    this.level += 1;
    this.experience -= this.getExperienceForNextLevel();
    
    // Increase stats based on class
    switch (this.class) {
      case 'warrior':
        this.stats.strength += 3;
        this.stats.vitality += 2;
        this.stats.dexterity += 1;
        this.stats.intelligence += 1;
        break;
      case 'mage':
        this.stats.intelligence += 3;
        this.stats.vitality += 1;
        this.stats.dexterity += 1;
        this.stats.strength += 1;
        break;
      case 'rogue':
        this.stats.dexterity += 3;
        this.stats.strength += 2;
        this.stats.vitality += 1;
        this.stats.intelligence += 1;
        break;
      case 'healer':
        this.stats.intelligence += 2;
        this.stats.vitality += 2;
        this.stats.dexterity += 1;
        this.stats.strength += 1;
        break;
    }
    
    // Increase health and mana
    this.health.max += 10 + (this.stats.vitality * 2);
    this.mana.max += 10 + (this.stats.intelligence * 2);
    this.health.current = this.health.max;
    this.mana.current = this.mana.max;
    
    return true;
  }
  return false;
};

// Rest method to restore health and mana
characterSchema.methods.rest = function() {
  this.health.current = this.health.max;
  this.mana.current = this.mana.max;
  this.save();
};

export default mongoose.models.Character || mongoose.model('Character', characterSchema);