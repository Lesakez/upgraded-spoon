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
  layout: {
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    rooms: [{
      id: { type: String, required: true },
      x: { type: Number, required: true },
      y: { type: Number, required: true },
      width: { type: Number, default: 1 },
      height: { type: Number, default: 1 },
      type: {
        type: String,
        enum: ['entrance', 'normal', 'treasure', 'boss', 'secret'],
        default: 'normal'
      },
      connections: [{ type: String }], // IDs of connected rooms
      monsters: [{
        monster: { type: mongoose.Schema.Types.ObjectId, ref: 'Monster' },
        quantity: { type: Number, default: 1 },
        respawnTime: { type: Number, default: 300 } // in seconds
      }],
      treasures: [{
        item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
        quantity: { type: Number, default: 1 },
        chance: { type: Number, default: 100, min: 0, max: 100 } // percentage
      }]
    }]
  },
  boss: {
    monster: { type: mongoose.Schema.Types.ObjectId, ref: 'Monster' },
    respawnTime: { type: Number, default: 3600 }, // in seconds
    rewards: {
      guaranteed: [{
        item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
        quantity: { type: Number, default: 1 }
      }],
      chances: [{
        item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
        quantity: { type: Number, default: 1 },
        chance: { type: Number, default: 10, min: 0, max: 100 } // percentage
      }]
    }
  },
  instances: [{
    id: { type: String, required: true },
    players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Character' }],
    state: {
      type: String,
      enum: ['active', 'completed', 'failed'],
      default: 'active'
    },
    startedAt: { type: Date, default: Date.now },
    completedAt: Date,
    monstersDefeated: {
      type: Map,
      of: Number,
      default: {}
    },
    bossDefeated: {
      type: Boolean,
      default: false
    },
    treasuresLooted: {
      type: Map,
      of: Boolean,
      default: {}
    }
  }],
  maxPlayers: {
    type: Number,
    default: 5,
    min: 1
  },
  timeLimit: {
    type: Number, // in seconds, 0 for no limit
    default: 0
  },
  cooldown: {
    type: Number, // in seconds
    default: 3600 // 1 hour
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

// Method to create a new instance
dungeonSchema.methods.createInstance = function(players) {
  const instanceId = `${this._id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const instance = {
    id: instanceId,
    players: players,
    state: 'active',
    startedAt: new Date(),
    monstersDefeated: new Map(),
    bossDefeated: false,
    treasuresLooted: new Map()
  };
  
  this.instances.push(instance);
  return instance;
};

// Method to check if character can enter
dungeonSchema.methods.canEnter = function(character) {
  // Check level requirements
  if (character.level < this.requirements.minLevel || character.level > this.requirements.maxLevel) {
    return false;
  }
  
  // Check if required quest is completed
  if (this.requirements.requiredQuest) {
    const hasCompletedQuest = character.completedQuests.some(
      completedQuest => completedQuest.quest.toString() === this.requirements.requiredQuest.toString()
    );
    if (!hasCompletedQuest) {
      return false;
    }
  }
  
  // Check if character has the key item
  if (this.requirements.keyItem) {
    const hasKeyItem = character.inventory.some(
      inventoryItem => inventoryItem.item.toString() === this.requirements.keyItem.toString()
    );
    if (!hasKeyItem) {
      return false;
    }
  }
  
  // Check cooldown
  const lastCompletion = this.instances
    .filter(instance => 
      instance.players.includes(character._id) && 
      instance.state === 'completed'
    )
    .sort((a, b) => b.completedAt - a.completedAt)[0];
  
  if (lastCompletion) {
    const timeSinceCompletion = Date.now() - lastCompletion.completedAt.getTime();
    if (timeSinceCompletion < this.cooldown * 1000) {
      return false;
    }
  }
  
  return true;
};

export default mongoose.models.Dungeon || mongoose.model('Dungeon', dungeonSchema);