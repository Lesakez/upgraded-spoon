import mongoose from 'mongoose';

const questSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Quest name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Quest description is required']
  },
  type: {
    type: String,
    required: true,
    enum: ['kill', 'collect', 'deliver', 'explore', 'escort']
  },
  requirements: {
    level: { type: Number, default: 1 },
    class: [{ type: String, enum: ['warrior', 'mage', 'rogue', 'healer'] }],
    prerequisiteQuests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quest' }]
  },
  objectives: [{
    type: {
      type: String,
      required: true,
      enum: ['kill', 'collect', 'deliver', 'explore', 'talk']
    },
    target: {
      type: String, // monster ID, item ID, NPC ID, or location ID
      required: true
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1
    },
    description: String
  }],
  rewards: {
    experience: { type: Number, default: 0 },
    gold: { type: Number, default: 0 },
    items: [{
      item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
      quantity: { type: Number, default: 1 }
    }],
    reputation: [{
      faction: { type: String },
      amount: { type: Number }
    }]
  },
  npc: {
    start: { type: mongoose.Schema.Types.ObjectId, ref: 'NPC', required: true },
    end: { type: mongoose.Schema.Types.ObjectId, ref: 'NPC', required: true }
  },
  dialogues: {
    start: { type: String, required: true },
    progress: { type: String },
    complete: { type: String, required: true }
  },
  isRepeatable: {
    type: Boolean,
    default: false
  },
  repeatCooldown: {
    type: Number, // in seconds
    default: 86400 // 24 hours
  },
  timeLimit: {
    type: Number, // in seconds, 0 for no limit
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

// Method to check if character can accept this quest
questSchema.methods.canBeAcceptedBy = function(character) {
  // Check level requirement
  if (character.level < this.requirements.level) {
    return false;
  }
  
  // Check class requirement
  if (this.requirements.class.length > 0 && !this.requirements.class.includes(character.class)) {
    return false;
  }
  
  // Check prerequisite quests
  if (this.requirements.prerequisiteQuests.length > 0) {
    const completedQuestIds = character.completedQuests.map(q => q.quest.toString());
    const hasAllPrerequisites = this.requirements.prerequisiteQuests.every(
      prereqId => completedQuestIds.includes(prereqId.toString())
    );
    if (!hasAllPrerequisites) {
      return false;
    }
  }
  
  // Check if character already has this quest
  const hasQuest = character.activeQuests.some(
    activeQuest => activeQuest.quest.toString() === this._id.toString()
  );
  if (hasQuest) {
    return false;
  }
  
  // Check if quest is repeatable and cooldown has passed
  if (!this.isRepeatable) {
    const hasCompleted = character.completedQuests.some(
      completedQuest => completedQuest.quest.toString() === this._id.toString()
    );
    if (hasCompleted) {
      return false;
    }
  } else {
    const lastCompletion = character.completedQuests
      .filter(completedQuest => completedQuest.quest.toString() === this._id.toString())
      .sort((a, b) => b.completedAt - a.completedAt)[0];
    
    if (lastCompletion) {
      const timeSinceCompletion = Date.now() - lastCompletion.completedAt.getTime();
      if (timeSinceCompletion < this.repeatCooldown * 1000) {
        return false;
      }
    }
  }
  
  return true;
};

export default mongoose.models.Quest || mongoose.model('Quest', questSchema);