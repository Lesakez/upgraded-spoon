import Character from '../../models/Character.js';
import Monster from '../../models/Monster.js';
import Item from '../../models/Item.js';

const combatHandler = async (ws, data, clients) => {
  const { characterId, action, targetId, targetType } = data;
  
  try {
    const character = await Character.findById(characterId)
      .populate('equipment.weapon')
      .populate('skills.skill');
    
    if (!character) {
      ws.send(JSON.stringify({
        type: 'ERROR',
        message: 'Character not found'
      }));
      return;
    }
    
    let target;
    if (targetType === 'monster') {
      target = await Monster.findById(targetId);
    } else if (targetType === 'character') {
      target = await Character.findById(targetId);
    }
    
    if (!target) {
      ws.send(JSON.stringify({
        type: 'ERROR',
        message: 'Target not found'
      }));
      return;
    }
    
    switch (action) {
      case 'ATTACK':
        await handleAttack(character, target, ws, clients);
        break;
        
      case 'SKILL':
        await handleSkillUse(character, target, data.skillId, ws, clients);
        break;
        
      case 'ITEM':
        await handleItemUse(character, target, data.itemId, ws, clients);
        break;
        
      default:
        ws.send(JSON.stringify({
          type: 'ERROR',
          message: 'Unknown combat action'
        }));
    }
    
  } catch (error) {
    console.error('Combat handler error:', error);
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: 'Combat action failed'
    }));
  }
};

const handleAttack = async (attacker, target, ws, clients) => {
  // Calculate damage
  let damage = calculateBaseDamage(attacker);
  
  // Apply weapon damage if equipped
  if (attacker.equipment.weapon) {
    damage += attacker.equipment.weapon.stats.damage || 0;
  }
  
  // Apply defense
  const defense = calculateDefense(target);
  const finalDamage = Math.max(1, damage - defense);
  
  // Apply damage to target
  if (target.health) {
    target.health.current = Math.max(0, target.health.current - finalDamage);
    
    if (target.health.current <= 0) {
      await handleDeath(attacker, target, ws, clients);
    } else {
      await target.save();
    }
  }
  
  // Broadcast combat result
  const combatMessage = {
    type: 'COMBAT_RESULT',
    attackerId: attacker._id,
    targetId: target._id,
    damage: finalDamage,
    targetHealth: target.health?.current || 0,
    isDead: target.health?.current <= 0
  };
  
  // Send to all clients in the battle
  broadcastToBattle(attacker, combatMessage, clients);
};

const handleSkillUse = async (character, target, skillId, ws, clients) => {
  const skill = character.skills.find(s => s.skill._id.toString() === skillId);
  
  if (!skill) {
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: 'Skill not found'
    }));
    return;
  }
  
  // Check mana cost
  if (character.mana.current < skill.skill.manaCost) {
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: 'Not enough mana'
    }));
    return;
  }
  
  // Apply skill effects (simplified)
  const effects = skill.skill.calculateEffect(character, skill.level);
  let totalDamage = 0;
  let totalHeal = 0;
  
  effects.forEach(effect => {
    switch (effect.type) {
      case 'damage':
        totalDamage += effect.value;
        break;
      case 'heal':
        totalHeal += effect.value;
        break;
    }
  });
  
  // Apply damage or healing
  if (totalDamage > 0 && target.health) {
    target.health.current = Math.max(0, target.health.current - totalDamage);
    if (target.health.current <= 0) {
      await handleDeath(character, target, ws, clients);
    }
  }
  
  if (totalHeal > 0 && target.health) {
    target.health.current = Math.min(target.health.max, target.health.current + totalHeal);
  }
  
  // Deduct mana
  character.mana.current -= skill.skill.manaCost;
  await character.save();
  if (target.health) await target.save();
  
  // Broadcast skill use
  const skillMessage = {
    type: 'SKILL_USED',
    characterId: character._id,
    targetId: target._id,
    skillId: skillId,
    effects: effects.map(e => ({
      type: e.type,
      value: e.value
    }))
  };
  
  broadcastToBattle(character, skillMessage, clients);
};

const handleItemUse = async (character, target, itemId, ws, clients) => {
  // TODO: Implement combat item usage
};

const handleDeath = async (killer, victim, ws, clients) => {
  if (victim.constructor.modelName === 'Monster') {
    // Handle monster death
    await handleMonsterDeath(killer, victim, ws, clients);
  } else if (victim.constructor.modelName === 'Character') {
    // Handle character death
    await handleCharacterDeath(killer, victim, ws, clients);
  }
};

const handleMonsterDeath = async (character, monster, ws, clients) => {
  // Grant experience
  character.experience += monster.experienceValue || 10;
  
  // Check for level up
  while (character.canLevelUp()) {
    character.levelUp();
  }
  
  // Generate loot
  const loot = await monster.generateLoot();
  
  // Add loot to character inventory
  for (const item of loot) {
    const existingItemIndex = character.inventory.findIndex(
      invItem => invItem.item.toString() === item.item.toString()
    );
    
    if (existingItemIndex > -1 && item.item.stackable) {
      character.inventory[existingItemIndex].quantity += item.quantity;
    } else {
      character.inventory.push({
        item: item.item,
        quantity: item.quantity
      });
    }
  }
  
  // Add gold
  const goldDrop = monster.calculateGoldDrop();
  character.gold += goldDrop;
  
  await character.save();
  
  // Broadcast death message
  const deathMessage = {
    type: 'MONSTER_DEATH',
    monsterId: monster._id,
    killerId: character._id,
    experience: monster.experienceValue || 10,
    gold: goldDrop,
    loot: loot.map(item => ({
      id: item.item,
      quantity: item.quantity
    }))
  };
  
  broadcastToBattle(character, deathMessage, clients);
};

const handleCharacterDeath = async (killer, victim, ws, clients) => {
  // TODO: Implement character death logic
  // - Respawn in town
  // - Experience loss
  // - Item drop (PvP)
};

const calculateBaseDamage = (character) => {
  // Base damage calculation based on stats
  const baseDamage = character.stats.strength * 2;
  
  // Add class-specific modifiers
  switch (character.class) {
    case 'warrior':
      return baseDamage * 1.2;
    case 'mage':
      return character.stats.intelligence * 2;
    case 'rogue':
      return character.stats.dexterity * 2.5;
    case 'healer':
      return baseDamage * 0.8;
    default:
      return baseDamage;
  }
};

const calculateDefense = (target) => {
  let defense = 0;
  
  // Base defense from stats
  if (target.stats) {
    defense = target.stats.vitality * 1.5;
  }
  
  // Add equipment defense
  if (target.equipment) {
    if (target.equipment.armor) {
      defense += target.equipment.armor.stats?.defense || 0;
    }
    if (target.equipment.helmet) {
      defense += target.equipment.helmet.stats?.defense || 0;
    }
    if (target.equipment.boots) {
      defense += target.equipment.boots.stats?.defense || 0;
    }
  }
  
  return defense;
};

const broadcastToBattle = (character, message, clients) => {
  // Find all clients in the same battle
  clients.forEach((client) => {
    if (client.characterId && client.ws.readyState === 1) {
      // For now, just broadcast to all connected clients
      // In a real implementation, you'd check if they're in the same battle instance
      client.ws.send(JSON.stringify(message));
    }
  });
};

export default combatHandler;