import mongoose from 'mongoose';

const dungeonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Dungeon name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Dungeon description is required']
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['easy', 'normal', 'hard', 'expert', 'legendary'],
    default: 'normal'
  },
  requirements: {
    minLevel: { type: Number, default: 1 },
    maxLevel: { type: Number, default: 100 },
    requiredQuest: { type: mongoose.Schema.Types.ObjectId, ref: 'Quest' },
    keyItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' }
  },
  totalFloors: {
    type: Number,
    required: true,
    default: 5
  },
  floors: [{
    number: { type: Number, required: true },
    type: { 
      type: String, 
      enum: ['monster', 'boss', 'treasure', 'event', 'rest'],
      default: 'monster'
    },
    monster: { type: mongoose.Schema.Types.ObjectId, ref: 'Monster' },
    boss: { 
      monster: { type: mongoose.Schema.Types.ObjectId, ref: 'Monster' },
      rewards: {
        guaranteed: [{
          item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
          quantity: { type: Number, default: 1 }
        }],
        chances: [{
          item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
          quantity: { type: Number, default: 1 },
          chance: { type: Number, default: 10, min: 0, max: 100 }
        }]
      }
    },
    treasures: [{
      item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
      quantity: { type: Number, default: 1 },
      chance: { type: Number, default: 100, min: 0, max: 100 }
    }],
    events: [{
      type: { type: String, enum: ['trap', 'buff', 'merchant', 'puzzle'] },
      description: String,
      effect: {
        type: { type: String, enum: ['damage', 'heal', 'buff', 'debuff'] },
        value: Number,
        duration: Number
      }
    }],
    energyCost: { type: Number, default: 10 }
  }],
  instances: [{
    id: { type: String, required: true },
    players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Character' }],
    state: {
      type: String,
      enum: ['active', 'completed', 'failed'],
      default: 'active'
    },
    currentFloor: { type: Number, default: 1 },
    startedAt: { type: Date, default: Date.now },
    completedAt: Date,
    floorsCompleted: [{ type: Number }],
    monstersDefeated: {
      type: Map,
      of: Number,
      default: {}
    },
    bossDefeated: {
      type: Boolean,
      default: false
    }
  }],
  maxPlayers: {
    type: Number,
    default: 5,
    min: 1
  },
  cooldown: {
    type: Number,
    default: 3600
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

dungeonSchema.methods.createInstance = function(players) {
  const instanceId = `${this._id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const instance = {
    id: instanceId,
    players: players,
    state: 'active',
    currentFloor: 1,
    startedAt: new Date(),
    floorsCompleted: [],
    monstersDefeated: new Map(),
    bossDefeated: false
  };
  
  this.instances.push(instance);
  return instance;
};

dungeonSchema.methods.canEnter = function(character) {
  if (character.level < this.requirements.minLevel || character.level > this.requirements.maxLevel) {
    return { canEnter: false, reason: 'Level requirements not met' };
  }
  
  const lastCompletion = character.completedDungeons
    .filter(completion => completion.dungeon.toString() === this._id.toString())
    .sort((a, b) => b.completedAt - a.completedAt)[0];
  
  if (lastCompletion) {
    const timeSinceCompletion = Date.now() - lastCompletion.completedAt.getTime();
    const remainingCooldown = this.cooldown * 1000 - timeSinceCompletion;
    
    if (remainingCooldown > 0) {
      return { 
        canEnter: false, 
        reason: 'Dungeon on cooldown',
        remainingTime: Math.ceil(remainingCooldown / 1000)
      };
    }
  }
  
  return { canEnter: true };
};

export default mongoose.models.Dungeon || mongoose.model('Dungeon', dungeonSchema);