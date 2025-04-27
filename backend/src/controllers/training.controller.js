import Skill from '../models/Skill.js';
import Character from '../models/Character.js';
import NPC from '../models/NPC.js';
import { asyncHandler } from '../middleware/error.middleware.js';

// @desc    Get available skills for training
// @route   GET /api/training/:npcId
// @access  Private
export const getAvailableSkills = asyncHandler(async (req, res) => {
  const npc = await NPC.findById(req.params.npcId)
    .populate('training.skills.skill');
  
  if (!npc) {
    res.status(404);
    throw new Error('Trainer not found');
  }
  
  if (npc.type !== 'trainer') {
    res.status(400);
    throw new Error('This NPC is not a trainer');
  }
  
  res.status(200).json({
    success: true,
    data: npc.training.skills
  });
});

// @desc    Learn skill from trainer
// @route   POST /api/training/:npcId/learn
// @access  Private
export const learnSkill = asyncHandler(async (req, res) => {
  const { characterId, skillId } = req.body;
  
  const character = await Character.findById(characterId);
  const npc = await NPC.findById(req.params.npcId);
  const skill = await Skill.findById(skillId);
  
  if (!character) {
    res.status(404);
    throw new Error('Character not found');
  }
  
  if (!npc) {
    res.status(404);
    throw new Error('Trainer not found');
  }
  
  if (!skill) {
    res.status(404);
    throw new Error('Skill not found');
  }
  
  // Make sure user owns character
  if (character.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to use this character');
  }
  
  // Check if NPC can teach this skill
  const trainerSkill = npc.training.skills.find(
    s => s.skill.toString() === skillId
  );
  
  if (!trainerSkill) {
    res.status(400);
    throw new Error('This trainer cannot teach this skill');
  }
  
  // Check if character meets requirements
  if (!skill.canLearn(character)) {
    res.status(400);
    throw new Error('Character does not meet requirements to learn this skill');
  }
  
  // Check if character already knows the skill
  const existingSkill = character.skills.find(
    s => s.skill.toString() === skillId
  );
  
  if (existingSkill) {
    // Check if can level up the skill
    if (existingSkill.level >= trainerSkill.maxLevel) {
      res.status(400);
      throw new Error('Skill is already at maximum level this trainer can teach');
    }
    
    // Calculate cost for next level
    const cost = trainerSkill.price * (existingSkill.level + 1);
    
    if (character.gold < cost) {
      res.status(400);
      throw new Error('Not enough gold to level up this skill');
    }
    
    // Deduct gold and level up skill
    character.gold -= cost;
    existingSkill.level += 1;
  } else {
    // Learn new skill
    if (character.gold < trainerSkill.price) {
      res.status(400);
      throw new Error('Not enough gold to learn this skill');
    }
    
    // Deduct gold and add skill
    character.gold -= trainerSkill.price;
    character.skills.push({
      skill: skillId,
      level: 1
    });
  }
  
  await character.save();
  
  res.status(200).json({
    success: true,
    data: character
  });
});

// @desc    Get all trainers
// @route   GET /api/training
// @access  Private
export const getAllTrainers = asyncHandler(async (req, res) => {
  const trainers = await NPC.find({ type: 'trainer' })
    .select('name title location training');
  
  res.status(200).json({
    success: true,
    count: trainers.length,
    data: trainers
  });
});

// @desc    Get character's learnable skills
// @route   GET /api/training/learnable/:characterId
// @access  Private
export const getLearnableSkills = asyncHandler(async (req, res) => {
  const character = await Character.findById(req.params.characterId)
    .populate('skills.skill');
  
  if (!character) {
    res.status(404);
    throw new Error('Character not found');
  }
  
  // Make sure user owns character
  if (character.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to access this character');
  }
  
  // Get all skills for character's class
  const skills = await Skill.find({
    $or: [
      { class: character.class },
      { class: 'all' }
    ]
  });
  
  // Filter skills the character can learn
  const learnableSkills = skills.filter(skill => {
    // Check if already learned
    const learned = character.skills.find(
      s => s.skill._id.toString() === skill._id.toString()
    );
    
    if (learned) {
      // Can still learn if not at max level
      return learned.level < skill.maxLevel;
    }
    
    // Check if can learn the skill
    return skill.canLearn(character);
  });
  
  res.status(200).json({
    success: true,
    data: learnableSkills
  });
});