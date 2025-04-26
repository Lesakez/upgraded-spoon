import mongoose from 'mongoose';

const npcSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'NPC name is required'],
    trim: true
  },
  title: {
    type: String,
    trim: true
  },
  description: {
    type: String
  },
  type: {
    type: String,
    required: true,
    enum: ['quest_giver', 'merchant', 'trainer', 'guard', 'civilian']
  },
  location: {
    map: { type: String, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  },
  dialogues: {
    greeting: { type: String, default: 'Hello, adventurer!' },
    farewell: { type: String, default: 'Goodbye!' },
    idle: [{ type: String }],
    custom: {
      type: Map,
      of: String
    }
  },
  quests: [{
    quest: { type: mongoose.Schema.Types.ObjectId, ref: 'Quest' },
    type: {
      type: String,
      enum: ['start', 'progress', 'end'],
      required: true
    }
  }],
  shop: {
    items: [{
      item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
      stock: { type: Number, default: -1 }, // -1 for unlimited
      price: { type: Number, required: true },
      requiredReputation: { type: Number, default: 0 }
    }],
    buyMultiplier: { type: Number, default: 0.5 }, // How much NPC pays for items (50% of value)
    refreshInterval: { type: Number, default: 86400 } // in seconds
  },
  training: {
    skills: [{
      skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
      maxLevel: { type: Number, default: 10 },
      price: { type: Number, required: true },
      requiredLevel: { type: Number, default: 1 }
    }]
  },
  faction: {
    type: String,
    default: 'neutral'
  },
  hostility: {
    type: String,
    enum: ['friendly', 'neutral', 'hostile'],
    default: 'neutral'
  },
  isEssential: {
    type: Boolean,
    default: false // Essential NPCs cannot be killed
  },
  respawnTime: {
    type: Number,
    default: 300 // in seconds
  },
  appearance: {
    model: { type: String, default: 'default_npc' },
    scale: { type: Number, default: 1 },
    animations: {
      idle: { type: String, default: 'idle' },
      talking: { type: String, default: 'talk' }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

// Method to get available quests for a character
npcSchema.methods.getAvailableQuests = function(character) {
  return this.quests
    .filter(questData => questData.type === 'start')
    .map(questData => questData.quest)
    .filter(quest => quest.canBeAcceptedBy(character));
};

// Method to get shop items available to a character
npcSchema.methods.getAvailableItems = function(character) {
  return this.shop.items.filter(shopItem => {
    // Check reputation requirement
    const characterReputation = character.reputation?.[this.faction] || 0;
    return characterReputation >= shopItem.requiredReputation;
  });
};

// Method to generate dialogue based on character state
npcSchema.methods.getDialogue = function(character, context = 'greeting') {
  // Check for custom dialogues based on character state
  if (this.dialogues.custom) {
    // Check for quest-related dialogues
    const activeQuests = character.activeQuests.map(q => q.quest.toString());
    const completedQuests = character.completedQuests.map(q => q.quest.toString());
    
    for (const [key, dialogue] of this.dialogues.custom) {
      // Custom logic for different dialogue conditions
      if (key.startsWith('quest_') && activeQuests.includes(key.replace('quest_', ''))) {
        return dialogue;
      }
    }
  }
  
  // Return default dialogue for the context
  switch (context) {
    case 'greeting':
      return this.dialogues.greeting;
    case 'farewell':
      return this.dialogues.farewell;
    case 'idle':
      return this.dialogues.idle[Math.floor(Math.random() * this.dialogues.idle.length)] || this.dialogues.greeting;
    default:
      return this.dialogues.greeting;
  }
};

export default mongoose.models.NPC || mongoose.model('NPC', npcSchema);