import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Skill name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Skill description is required']
  },
  type: {
    type: String,
    required: true,
    enum: ['active', 'passive']
  },
  category: {
    type: String,
    required: true,
    enum: ['combat', 'healing', 'buff', 'debuff', 'utility']
  },
  class: {
    type: String,
    required: true,
    enum: ['warrior', 'mage', 'rogue', 'healer', 'all']
  },
  levelRequired: {
    type: Number,
    default: 1,
    min: 1
  },
  manaCost: {
    type: Number,
    default: 0,
    min: 0
  },
  cooldown: {
    type: Number,
    default: 0, // in seconds
    min: 0
  },
  range: {
    type: Number,
    default: 0 // 0 for melee/self
  },
  areaOfEffect: {
    type: {
      type: String,
      enum: ['none', 'circle', 'cone', 'line'],
      default: 'none'
    },
    radius: { type: Number, default: 0 }
  },
  effects: [{
    type: {
      type: String,
      required: true,
      enum: ['damage', 'heal', 'buff', 'debuff', 'status']
    },
    target: {
      type: String,
      enum: ['self', 'enemy', 'ally', 'all'],
      default: 'enemy'
    },
    value: {
      base: { type: Number, default: 0 },
      scaling: {
        stat: { type: String, enum: ['strength', 'intelligence', 'dexterity', 'vitality'] },
        ratio: { type: Number, default: 0 }
      }
    },
    duration: {
      type: Number,
      default: 0 // in seconds, 0 for instant
    },
    status: {
      type: String,
      enum: ['stun', 'slow', 'poison', 'burn', 'freeze', 'silence', 'bleed']
    }
  }],
  prerequisites: [{
    skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
    level: { type: Number, default: 1 }
  }],
  icon: {
    type: String,
    default: 'default_skill.png'
  },
  animation: {
    type: String,
    default: 'default_cast'
  },
  maxLevel: {
    type: Number,
    default: 10,
    min: 1
  }
});

// Method to calculate skill effect
skillSchema.methods.calculateEffect = function(caster, skillLevel) {
  const effects = [];
  
  this.effects.forEach(effect => {
    let value = effect.value.base;
    
    // Add scaling based on caster stats
    if (effect.value.scaling && effect.value.scaling.stat) {
      const statValue = caster.stats[effect.value.scaling.stat] || 0;
      value += statValue * effect.value.scaling.ratio;
    }
    
    // Scale with skill level
    value *= (1 + (skillLevel - 1) * 0.1); // 10% increase per level
    
    effects.push({
      type: effect.type,
      target: effect.target,
      value: Math.floor(value),
      duration: effect.duration,
      status: effect.status
    });
  });
  
  return effects;
};

// Method to check if character can learn this skill
skillSchema.methods.canLearn = function(character) {
  // Check class requirement
  if (this.class !== 'all' && this.class !== character.class) {
    return false;
  }
  
  // Check level requirement
  if (character.level < this.levelRequired) {
    return false;
  }
  
  // Check prerequisites
  for (const prereq of this.prerequisites) {
    const characterSkill = character.skills.find(
      s => s.skill.toString() === prereq.skill.toString()
    );
    
    if (!characterSkill || characterSkill.level < prereq.level) {
      return false;
    }
  }
  
  return true;
};

export default mongoose.models.Skill || mongoose.model('Skill', skillSchema);