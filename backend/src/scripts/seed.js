import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Item from '../models/Item.js';
import Monster from '../models/Monster.js';
import NPC from '../models/NPC.js';
import Quest from '../models/Quest.js';
import Dungeon from '../models/Dungeon.js';
import Skill from '../models/Skill.js';

// Load env vars
dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Item.deleteMany();
    await Monster.deleteMany();
    await NPC.deleteMany();
    await Quest.deleteMany();
    await Dungeon.deleteMany();
    await Skill.deleteMany();
    
    console.log('Cleared existing data');

    // ITEMS SEED DATA
    const items = await Item.create([
      // Starting Items (Level 1)
      {
        name: 'Wooden Sword',
        description: 'A simple wooden training sword',
        type: 'weapon',
        rarity: 'common',
        requirements: { level: 1 },
        stats: { damage: 2 },
        value: 5,
        stackable: false,
        isTradeable: true,
        isSellable: true
      },
      {
        name: 'Novice Staff',
        description: 'A basic staff for apprentice mages',
        type: 'weapon',
        rarity: 'common',
        requirements: { level: 1, class: ['mage', 'healer'] },
        stats: { magicPower: 3, intelligence: 1 },
        value: 5,
        stackable: false,
        isTradeable: true,
        isSellable: true
      },
      {
        name: 'Small Dagger',
        description: 'A small but sharp dagger',
        type: 'weapon',
        rarity: 'common',
        requirements: { level: 1, class: ['rogue'] },
        stats: { damage: 3, dexterity: 1 },
        value: 5,
        stackable: false,
        isTradeable: true,
        isSellable: true
      },
      {
        name: 'Cloth Robe',
        description: 'Basic cloth armor for magic users',
        type: 'armor',
        rarity: 'common',
        requirements: { level: 1, class: ['mage', 'healer'] },
        stats: { defense: 2, mana: 10 },
        value: 8,
        stackable: false,
        isTradeable: true,
        isSellable: true
      },
      {
        name: 'Leather Vest',
        description: 'Light leather armor',
        type: 'armor',
        rarity: 'common',
        requirements: { level: 1 },
        stats: { defense: 4 },
        value: 10,
        stackable: false,
        isTradeable: true,
        isSellable: true
      },

      // Level 2-3 Items
      {
        name: 'Iron Sword',
        description: 'A well-made iron sword',
        type: 'weapon',
        rarity: 'uncommon',
        requirements: { level: 3 },
        stats: { damage: 8, strength: 2 },
        value: 50,
        stackable: false,
        isTradeable: true,
        isSellable: true
      },
      {
        name: 'Apprentice Wand',
        description: 'A wand that channels magical energy',
        type: 'weapon',
        rarity: 'uncommon',
        requirements: { level: 3, class: ['mage'] },
        stats: { magicPower: 10, intelligence: 3 },
        value: 50,
        stackable: false,
        isTradeable: true,
        isSellable: true
      },
      {
        name: 'Reinforced Leather Armor',
        description: 'Leather armor reinforced with metal studs',
        type: 'armor',
        rarity: 'uncommon',
        requirements: { level: 3 },
        stats: { defense: 8, dexterity: 1 },
        value: 60,
        stackable: false,
        isTradeable: true,
        isSellable: true
      },

      // Level 4-6 Items
      {
        name: 'Steel Sword',
        description: 'A strong steel sword',
        type: 'weapon',
        rarity: 'uncommon',
        requirements: { level: 5 },
        stats: { damage: 15, strength: 3 },
        value: 100,
        stackable: false,
        isTradeable: true,
        isSellable: true
      },
      {
        name: 'Battle Axe',
        description: 'A two-handed battle axe',
        type: 'weapon',
        rarity: 'uncommon',
        requirements: { level: 5, class: ['warrior'] },
        stats: { damage: 18, strength: 4 },
        value: 120,
        stackable: false,
        isTradeable: true,
        isSellable: true
      },
      {
        name: 'Elemental Staff',
        description: 'A staff infused with elemental magic',
        type: 'weapon',
        rarity: 'rare',
        requirements: { level: 6, class: ['mage'] },
        stats: { magicPower: 20, intelligence: 5 },
        value: 150,
        stackable: false,
        isTradeable: true,
        isSellable: true
      },
      {
        name: 'Chainmail Armor',
        description: 'Strong armor made of interlocking rings',
        type: 'armor',
        rarity: 'uncommon',
        requirements: { level: 5 },
        stats: { defense: 15, vitality: 2 },
        value: 120,
        stackable: false,
        isTradeable: true,
        isSellable: true
      },

      // Level 7-10 Items
      {
        name: 'Enchanted Blade',
        description: 'A sword enchanted with magical runes',
        type: 'weapon',
        rarity: 'rare',
        requirements: { level: 8 },
        stats: { damage: 25, strength: 5, magicPower: 10 },
        value: 300,
        stackable: false,
        isTradeable: true,
        isSellable: true
      },
      {
        name: 'Shadowblade',
        description: 'A dagger that seems to absorb light',
        type: 'weapon',
        rarity: 'rare',
        requirements: { level: 8, class: ['rogue'] },
        stats: { damage: 22, dexterity: 6 },
        effects: [{ type: 'critical', value: 15 }],
        value: 300,
        stackable: false,
        isTradeable: true,
        isSellable: true
      },
      {
        name: 'Holy Staff',
        description: 'A staff blessed by divine powers',
        type: 'weapon',
        rarity: 'rare',
        requirements: { level: 8, class: ['healer'] },
        stats: { magicPower: 20, intelligence: 5, mana: 30 },
        effects: [{ type: 'healing', value: 20 }],
        value: 300,
        stackable: false,
        isTradeable: true,
        isSellable: true
      },
      {
        name: 'Dragon Scale Armor',
        description: 'Armor crafted from dragon scales',
        type: 'armor',
        rarity: 'epic',
        requirements: { level: 10 },
        stats: { defense: 35, vitality: 8, health: 50 },
        value: 500,
        stackable: false,
        isTradeable: true,
        isSellable: true
      },

      // Consumables
      {
        name: 'Minor Health Potion',
        description: 'Restores 30 health points',
        type: 'consumable',
        rarity: 'common',
        requirements: { level: 1 },
        effects: [{ type: 'heal', value: 30, duration: 0 }],
        value: 10,
        stackable: true,
        maxStack: 20,
        isTradeable: true,
        isSellable: true
      },
      {
        name: 'Health Potion',
        description: 'Restores 75 health points',
        type: 'consumable',
        rarity: 'common',
        requirements: { level: 3 },
        effects: [{ type: 'heal', value: 75, duration: 0 }],
        value: 25,
        stackable: true,
        maxStack: 20,
        isTradeable: true,
        isSellable: true
      },
      {
        name: 'Greater Health Potion',
        description: 'Restores 150 health points',
        type: 'consumable',
        rarity: 'uncommon',
        requirements: { level: 6 },
        effects: [{ type: 'heal', value: 150, duration: 0 }],
        value: 50,
        stackable: true,
        maxStack: 20,
        isTradeable: true,
        isSellable: true
      },
      {
        name: 'Minor Mana Potion',
        description: 'Restores 20 mana points',
        type: 'consumable',
        rarity: 'common',
        requirements: { level: 1 },
        effects: [{ type: 'mana', value: 20, duration: 0 }],
        value: 10,
        stackable: true,
        maxStack: 20,
        isTradeable: true,
        isSellable: true
      },
      {
        name: 'Mana Potion',
        description: 'Restores 50 mana points',
        type: 'consumable',
        rarity: 'common',
        requirements: { level: 3 },
        effects: [{ type: 'mana', value: 50, duration: 0 }],
        value: 25,
        stackable: true,
        maxStack: 20,
        isTradeable: true,
        isSellable: true
      },

      // Materials
      {
        name: 'Wolf Pelt',
        description: 'A soft wolf pelt, used for crafting',
        type: 'material',
        rarity: 'common',
        requirements: { level: 1 },
        value: 5,
        stackable: true,
        maxStack: 50,
        isTradeable: true,
        isSellable: true
      },
      {
        name: 'Bear Claw',
        description: 'A sharp bear claw, used for crafting',
        type: 'material',
        rarity: 'uncommon',
        requirements: { level: 3 },
        value: 10,
        stackable: true,
        maxStack: 50,
        isTradeable: true,
        isSellable: true
      },
      {
        name: 'Spider Silk',
        description: 'Strong silk from giant spiders',
        type: 'material',
        rarity: 'uncommon',
        requirements: { level: 4 },
        value: 15,
        stackable: true,
        maxStack: 50,
        isTradeable: true,
        isSellable: true
      },
      {
        name: 'Orc Tusk',
        description: 'A large tusk from an orc',
        type: 'material',
        rarity: 'uncommon',
        requirements: { level: 6 },
        value: 20,
        stackable: true,
        maxStack: 50,
        isTradeable: true,
        isSellable: true
      },
      {
        name: 'Dragon Scale',
        description: 'A rare scale from a dragon',
        type: 'material',
        rarity: 'rare',
        requirements: { level: 10 },
        value: 100,
        stackable: true,
        maxStack: 20,
        isTradeable: true,
        isSellable: true
      }
    ]);

    console.log('Created items:', items.length);

    // MONSTERS SEED DATA
    const monsters = await Monster.create([
      // Level 1 Monsters
      {
        name: 'Forest Rat',
        description: 'A large, aggressive rat',
        type: 'normal',
        level: 1,
        health: { max: 30 },
        damage: { min: 2, max: 4 },
        defense: 1,
        experienceValue: 10,
        goldValue: { min: 1, max: 3 },
        drops: [],
        behavior: { aggressive: false, aggroRange: 5 },
        spawnLocations: [{ map: 'forest_entrance', x: 50, y: 50, radius: 20 }],
        respawnTime: 30
      },
      {
        name: 'Young Wolf',
        description: 'A young but dangerous wolf',
        type: 'normal',
        level: 1,
        health: { max: 40 },
        damage: { min: 3, max: 5 },
        defense: 2,
        experienceValue: 15,
        goldValue: { min: 2, max: 4 },
        drops: [
          { item: items.find(i => i.name === 'Wolf Pelt')._id, chance: 30, minQuantity: 1, maxQuantity: 1 }
        ],
        behavior: { aggressive: true, aggroRange: 10 },
        spawnLocations: [{ map: 'forest_entrance', x: 100, y: 100, radius: 30 }],
        respawnTime: 60
      },

      // Level 2-3 Monsters
      {
        name: 'Wild Boar',
        description: 'An aggressive wild boar',
        type: 'normal',
        level: 2,
        health: { max: 60 },
        damage: { min: 4, max: 7 },
        defense: 3,
        experienceValue: 25,
        goldValue: { min: 3, max: 6 },
        drops: [],
        behavior: { aggressive: true, aggroRange: 8 },
        spawnLocations: [{ map: 'forest', x: 150, y: 150, radius: 30 }],
        respawnTime: 90
      },
      {
        name: 'Goblin Scout',
        description: 'A cunning goblin scout',
        type: 'normal',
        level: 3,
        health: { max: 80 },
        damage: { min: 5, max: 9 },
        defense: 4,
        experienceValue: 35,
        goldValue: { min: 5, max: 10 },
        drops: [
          { item: items.find(i => i.name === 'Small Dagger')._id, chance: 5, minQuantity: 1, maxQuantity: 1 }
        ],
        behavior: { aggressive: true, aggroRange: 12 },
        spawnLocations: [{ map: 'forest', x: 200, y: 200, radius: 40 }],
        respawnTime: 120
      },
      {
        name: 'Forest Bear',
        description: 'A large and dangerous bear',
        type: 'elite',
        level: 3,
        health: { max: 150 },
        damage: { min: 8, max: 12 },
        defense: 6,
        experienceValue: 75,
        goldValue: { min: 10, max: 20 },
        drops: [
          { item: items.find(i => i.name === 'Bear Claw')._id, chance: 50, minQuantity: 1, maxQuantity: 2 }
        ],
        behavior: { aggressive: true, aggroRange: 15 },
        spawnLocations: [{ map: 'deep_forest', x: 100, y: 100, radius: 20 }],
        respawnTime: 300
      },

      // Level 4-6 Monsters
      {
        name: 'Giant Spider',
        description: 'A huge venomous spider',
        type: 'normal',
        level: 4,
        health: { max: 100 },
        damage: { min: 7, max: 11 },
        defense: 5,
        experienceValue: 50,
        goldValue: { min: 8, max: 15 },
        drops: [
          { item: items.find(i => i.name === 'Spider Silk')._id, chance: 40, minQuantity: 1, maxQuantity: 2 }
        ],
        behavior: { aggressive: true, aggroRange: 10 },
        spawnLocations: [{ map: 'spider_cave', x: 50, y: 50, radius: 30 }],
        respawnTime: 120
      },
      {
        name: 'Orc Warrior',
        description: 'A fierce orc warrior',
        type: 'normal',
        level: 5,
        health: { max: 130 },
        damage: { min: 10, max: 15 },
        defense: 8,
        experienceValue: 75,
        goldValue: { min: 15, max: 25 },
        drops: [
          { item: items.find(i => i.name === 'Iron Sword')._id, chance: 5, minQuantity: 1, maxQuantity: 1 },
          { item: items.find(i => i.name === 'Orc Tusk')._id, chance: 30, minQuantity: 1, maxQuantity: 1 }
        ],
        behavior: { aggressive: true, aggroRange: 12 },
        spawnLocations: [{ map: 'orc_camp', x: 100, y: 100, radius: 50 }],
        respawnTime: 180
      },
      {
        name: 'Dark Mage',
        description: 'A corrupted mage',
        type: 'elite',
        level: 6,
        health: { max: 200 },
        damage: { min: 15, max: 20 },
        defense: 6,
        experienceValue: 150,
        goldValue: { min: 30, max: 50 },
        drops: [
          { item: items.find(i => i.name === 'Elemental Staff')._id, chance: 10, minQuantity: 1, maxQuantity: 1 }
        ],
        behavior: { aggressive: true, aggroRange: 20 },
        spawnLocations: [{ map: 'dark_tower', x: 50, y: 50, radius: 10 }],
        respawnTime: 600
      },

      // Level 7-10 Monsters
      {
        name: 'Skeleton Warrior',
        description: 'An undead warrior',
        type: 'normal',
        level: 7,
        health: { max: 160 },
        damage: { min: 13, max: 18 },
        defense: 10,
        experienceValue: 100,
        goldValue: { min: 20, max: 35 },
        drops: [
          { item: items.find(i => i.name === 'Steel Sword')._id, chance: 5, minQuantity: 1, maxQuantity: 1 }
        ],
        behavior: { aggressive: true, aggroRange: 10 },
        spawnLocations: [{ map: 'undead_crypt', x: 100, y: 100, radius: 40 }],
        respawnTime: 180
      },
      {
        name: 'Shadow Assassin',
        description: 'A deadly shadow assassin',
        type: 'elite',
        level: 8,
        health: { max: 250 },
        damage: { min: 18, max: 25 },
        defense: 12,
        experienceValue: 200,
        goldValue: { min: 40, max: 70 },
        drops: [
          { item: items.find(i => i.name === 'Shadowblade')._id, chance: 15, minQuantity: 1, maxQuantity: 1 }
        ],
        behavior: { aggressive: true, aggroRange: 15 },
        spawnLocations: [{ map: 'shadow_realm', x: 75, y: 75, radius: 20 }],
        respawnTime: 600
      },
      {
        name: 'Fire Elemental',
        description: 'A being of pure fire',
        type: 'elite',
        level: 9,
        health: { max: 300 },
        damage: { min: 22, max: 30 },
        defense: 15,
        experienceValue: 250,
        goldValue: { min: 50, max: 90 },
        drops: [],
        behavior: { aggressive: true, aggroRange: 20 },
        spawnLocations: [{ map: 'volcano', x: 150, y: 150, radius: 30 }],
        respawnTime: 900
      },
      {
        name: 'Young Dragon',
        description: 'A fierce young dragon',
        type: 'boss',
        level: 10,
        health: { max: 1000 },
        damage: { min: 30, max: 45 },
        defense: 25,
        experienceValue: 1000,
        goldValue: { min: 200, max: 500 },
        drops: [
          { item: items.find(i => i.name === 'Dragon Scale Armor')._id, chance: 25, minQuantity: 1, maxQuantity: 1 },
          { item: items.find(i => i.name === 'Dragon Scale')._id, chance: 100, minQuantity: 1, maxQuantity: 3 }
        ],
        behavior: { aggressive: true, aggroRange: 30 },
        spawnLocations: [{ map: 'dragon_lair', x: 200, y: 200, radius: 10 }],
        respawnTime: 3600
      }
    ]);

    console.log('Created monsters:', monsters.length);

    // SKILLS SEED DATA
    const skills = await Skill.create([
      // Warrior Skills
      {
        name: 'Power Strike',
        description: 'A powerful melee attack',
        type: 'active',
        category: 'combat',
        class: 'warrior',
        levelRequired: 1,
        manaCost: 10,
        cooldown: 5,
        range: 1,
        effects: [{
          type: 'damage',
          target: 'enemy',
          value: { base: 20, scaling: { stat: 'strength', ratio: 1.5 } }
        }]
      },
      {
        name: 'Shield Block',
        description: 'Block incoming damage with your shield',
        type: 'active',
        category: 'buff',
        class: 'warrior',
        levelRequired: 3,
        manaCost: 15,
        cooldown: 20,
        effects: [{
          type: 'buff',
          target: 'self',
          value: { base: 10 },
          duration: 5
        }]
      },
      {
        name: 'Battle Cry',
        description: 'Increase party strength temporarily',
        type: 'active',
        category: 'buff',
        class: 'warrior',
        levelRequired: 5,
        manaCost: 20,
        cooldown: 30,
        areaOfEffect: { type: 'circle', radius: 10 },
        effects: [{
          type: 'buff',
          target: 'ally',
          value: { base: 5 },
          duration: 10
        }]
      },
      {
        name: 'Whirlwind',
        description: 'Damage all nearby enemies',
        type: 'active',
        category: 'combat',
        class: 'warrior',
        levelRequired: 8,
        manaCost: 30,
        cooldown: 25,
        areaOfEffect: { type: 'circle', radius: 5 },
        effects: [{
          type: 'damage',
          target: 'enemy',
          value: { base: 40, scaling: { stat: 'strength', ratio: 2 } }
        }]
      },

      // Mage Skills
      {
        name: 'Fire Bolt',
        description: 'Launch a bolt of fire at an enemy',
        type: 'active',
        category: 'combat',
        class: 'mage',
        levelRequired: 1,
        manaCost: 15,
        cooldown: 2,
        range: 20,
        effects: [{
          type: 'damage',
          target: 'enemy',
          value: { base: 25, scaling: { stat: 'intelligence', ratio: 2 } }
        }]
      },
      {
        name: 'Ice Shield',
        description: 'Create a protective shield of ice',
        type: 'active',
        category: 'buff',
        class: 'mage',
        levelRequired: 3,
        manaCost: 25,
        cooldown: 20,
        effects: [{
          type: 'buff',
          target: 'self',
          value: { base: 15 },
          duration: 10
        }]
      },
      {
        name: 'Fireball',
        description: 'Hurl an explosive fireball',
        type: 'active',
        category: 'combat',
        class: 'mage',
        levelRequired: 5,
        manaCost: 35,
        cooldown: 8,
        range: 25,
        areaOfEffect: { type: 'circle', radius: 5 },
        effects: [{
          type: 'damage',
          target: 'enemy',
          value: { base: 50, scaling: { stat: 'intelligence', ratio: 2.5 } }
        }]
      },
      {
        name: 'Chain Lightning',
        description: 'Lightning that jumps between enemies',
        type: 'active',
        category: 'combat',
        class: 'mage',
        levelRequired: 8,
        manaCost: 50,
        cooldown: 15,
        range: 25,
        effects: [{
          type: 'damage',
          target: 'enemy',
          value: { base: 60, scaling: { stat: 'intelligence', ratio: 3 } }
        }]
      },

      // Rogue Skills
      {
        name: 'Quick Strike',
        description: 'A fast attack that can critical',
        type: 'active',
        category: 'combat',
        class: 'rogue',
        levelRequired: 1,
        manaCost: 8,
        cooldown: 3,
        range: 1,
        effects: [{
          type: 'damage',
          target: 'enemy',
          value: { base: 15, scaling: { stat: 'dexterity', ratio: 1.8 } }
        }]
      },
      {
        name: 'Stealth',
        description: 'Become invisible to enemies',
        type: 'active',
        category: 'utility',
        class: 'rogue',
        levelRequired: 3,
        manaCost: 20,
        cooldown: 30,
        effects: [{
          type: 'buff',
          target: 'self',
          value: { base: 1 },
          duration: 15
        }]
      },
      {
        name: 'Backstab',
        description: 'Deal extra damage from behind',
        type: 'active',
        category: 'combat',
        class: 'rogue',
        levelRequired: 5,
        manaCost: 15,
        cooldown: 10,
        range: 1,
        effects: [{
          type: 'damage',
          target: 'enemy',
          value: { base: 40, scaling: { stat: 'dexterity', ratio: 2.5 } }
        }]
      },
      {
        name: 'Smoke Bomb',
        description: 'Disorient all nearby enemies',
        type: 'active',
        category: 'debuff',
        class: 'rogue',
        levelRequired: 8,
        manaCost: 30,
        cooldown: 45,
        areaOfEffect: { type: 'circle', radius: 8 },
        effects: [{
          type: 'debuff',
          target: 'enemy',
          value: { base: 5 },
          duration: 8,
          status: 'stun'  // Changed from 'blind' to 'stun'
        }]
      },

      // Healer Skills
      {
        name: 'Minor Heal',
        description: 'Restore health to a target',
        type: 'active',
        category: 'healing',
        class: 'healer',
        levelRequired: 1,
        manaCost: 15,
        cooldown: 3,
        range: 15,
        effects: [{
          type: 'heal',
          target: 'ally',
          value: { base: 30, scaling: { stat: 'intelligence', ratio: 1.2 } }
        }]
      },
      {
        name: 'Blessing',
        description: 'Increase ally defense temporarily',
        type: 'active',
        category: 'buff',
        class: 'healer',
        levelRequired: 3,
        manaCost: 20,
        cooldown: 15,
        range: 15,
        effects: [{
          type: 'buff',
          target: 'ally',
          value: { base: 8 },
          duration: 30
        }]
      },
      {
        name: 'Group Heal',
        description: 'Heal all nearby allies',
        type: 'active',
        category: 'healing',
        class: 'healer',
        levelRequired: 5,
        manaCost: 40,
        cooldown: 20,
        areaOfEffect: { type: 'circle', radius: 10 },
        effects: [{
          type: 'heal',
          target: 'ally',
          value: { base: 50, scaling: { stat: 'intelligence', ratio: 1.5 } }
        }]
      },
      {
        name: 'Resurrection',
        description: 'Revive a fallen ally',
        type: 'active',
        category: 'healing',
        class: 'healer',
        levelRequired: 8,
        manaCost: 100,
        cooldown: 180,
        range: 10,
        effects: [{
          type: 'heal',
          target: 'ally',
          value: { base: 300, scaling: { stat: 'intelligence', ratio: 3 } }
        }]
      }
    ]);

    console.log('Created skills:', skills.length);

    // NPCs SEED DATA
    const npcs = await NPC.create([
      // Town NPCs
      {
        name: 'Captain Marcus',
        title: 'Town Guard Captain',
        description: 'The stern but fair captain of the town guard',
        type: 'quest_giver',
        location: { map: 'town', x: 50, y: 50 },
        dialogues: {
          greeting: 'Welcome, adventurer. The town needs your help.',
          farewell: 'Safe travels, and may your blade stay sharp.',
          idle: ['Keep your weapons ready.', 'The wilds are dangerous these days.']
        }
      },
      {
        name: 'Elara',
        title: 'Herbalist',
        description: 'A knowledgeable herbalist',
        type: 'merchant',
        location: { map: 'town', x: 100, y: 75 },
        dialogues: {
          greeting: 'Welcome! Looking for potions?',
          farewell: 'May the herbs keep you healthy!'
        },
        shop: {
          items: [
            { item: items.find(i => i.name === 'Minor Health Potion')._id, stock: -1, price: 15 },
            { item: items.find(i => i.name === 'Minor Mana Potion')._id, stock: -1, price: 15 },
            { item: items.find(i => i.name === 'Health Potion')._id, stock: -1, price: 35 },
            { item: items.find(i => i.name === 'Mana Potion')._id, stock: -1, price: 35 }
          ],
          buyMultiplier: 0.5
        }
      },
      {
        name: 'Blacksmith Grom',
        title: 'Master Blacksmith',
        description: 'A skilled dwarven blacksmith',
        type: 'merchant',
        location: { map: 'town', x: 150, y: 50 },
        dialogues: {
          greeting: 'Aye, looking for weapons or armor?',
          farewell: 'May your steel never dull!'
        },
        shop: {
          items: [
            { item: items.find(i => i.name === 'Wooden Sword')._id, stock: -1, price: 10 },
            { item: items.find(i => i.name === 'Iron Sword')._id, stock: -1, price: 75 },
            { item: items.find(i => i.name === 'Steel Sword')._id, stock: -1, price: 150 },
            { item: items.find(i => i.name === 'Leather Vest')._id, stock: -1, price: 20 },
            { item: items.find(i => i.name === 'Reinforced Leather Armor')._id, stock: -1, price: 90 },
            { item: items.find(i => i.name === 'Chainmail Armor')._id, stock: -1, price: 180 }
          ],
          buyMultiplier: 0.4
        }
      },
      {
        name: 'Master Aldric',
        title: 'Warrior Trainer',
        description: 'A veteran warrior trainer',
        type: 'trainer',
        location: { map: 'town', x: 75, y: 125 },
        dialogues: {
          greeting: 'Ready to learn the ways of steel?',
          farewell: 'Remember, strength alone is not enough.'
        },
        training: {
          skills: [
            { skill: skills.find(s => s.name === 'Power Strike')._id, maxLevel: 10, price: 50, requiredLevel: 1 },
            { skill: skills.find(s => s.name === 'Shield Block')._id, maxLevel: 10, price: 100, requiredLevel: 3 },
            { skill: skills.find(s => s.name === 'Battle Cry')._id, maxLevel: 10, price: 200, requiredLevel: 5 },
            { skill: skills.find(s => s.name === 'Whirlwind')._id, maxLevel: 10, price: 500, requiredLevel: 8 }
          ]
        }
      },
      {
        name: 'Archmage Seraphine',
        title: 'Master of Magic',
        description: 'A powerful archmage',
        type: 'trainer',
        location: { map: 'town', x: 125, y: 125 },
        dialogues: {
          greeting: 'The arcane arts await your study.',
          farewell: 'May magic guide your path.'
        },
        training: {
          skills: [
            { skill: skills.find(s => s.name === 'Fire Bolt')._id, maxLevel: 10, price: 50, requiredLevel: 1 },
            { skill: skills.find(s => s.name === 'Ice Shield')._id, maxLevel: 10, price: 100, requiredLevel: 3 },
            { skill: skills.find(s => s.name === 'Fireball')._id, maxLevel: 10, price: 200, requiredLevel: 5 },
            { skill: skills.find(s => s.name === 'Chain Lightning')._id, maxLevel: 10, price: 500, requiredLevel: 8 }
          ]
        }
      },
      {
        name: 'Shadow Master Raven',
        title: 'Rogue Trainer',
        description: 'A mysterious rogue trainer',
        type: 'trainer',
        location: { map: 'town', x: 175, y: 125 },
        dialogues: {
          greeting: 'The shadows welcome you...',
          farewell: 'Stay unseen, stay alive.'
        },
        training: {
          skills: [
            { skill: skills.find(s => s.name === 'Quick Strike')._id, maxLevel: 10, price: 50, requiredLevel: 1 },
            { skill: skills.find(s => s.name === 'Stealth')._id, maxLevel: 10, price: 100, requiredLevel: 3 },
            { skill: skills.find(s => s.name === 'Backstab')._id, maxLevel: 10, price: 200, requiredLevel: 5 },
            { skill: skills.find(s => s.name === 'Smoke Bomb')._id, maxLevel: 10, price: 500, requiredLevel: 8 }
          ]
        }
      },
      {
        name: 'High Priestess Aria',
        title: 'Divine Healer',
        description: 'A wise and compassionate healer',
        type: 'trainer',
        location: { map: 'town', x: 225, y: 125 },
        dialogues: {
          greeting: 'The light guides your way.',
          farewell: 'May you bring healing to those in need.'
        },
        training: {
          skills: [
            { skill: skills.find(s => s.name === 'Minor Heal')._id, maxLevel: 10, price: 50, requiredLevel: 1 },
            { skill: skills.find(s => s.name === 'Blessing')._id, maxLevel: 10, price: 100, requiredLevel: 3 },
            { skill: skills.find(s => s.name === 'Group Heal')._id, maxLevel: 10, price: 200, requiredLevel: 5 },
            { skill: skills.find(s => s.name === 'Resurrection')._id, maxLevel: 10, price: 500, requiredLevel: 8 }
          ]
        }
      }
    ]);

    console.log('Created NPCs:', npcs.length);

    // QUESTS SEED DATA
    const quests = await Quest.create([
      // Level 1 Quests
      {
        name: 'Rat Infestation',
        description: 'Help clear the forest of aggressive rats.',
        type: 'kill',
        requirements: { level: 1 },
        objectives: [{
          type: 'kill',
          target: monsters.find(m => m.name === 'Forest Rat')._id.toString(),
          quantity: 5,
          description: 'Kill 5 Forest Rats'
        }],
        rewards: {
          experience: 50,
          gold: 20,
          items: [{ item: items.find(i => i.name === 'Minor Health Potion')._id, quantity: 3 }]
        },
        npc: {
          start: npcs.find(n => n.name === 'Captain Marcus')._id,
          end: npcs.find(n => n.name === 'Captain Marcus')._id
        },
        dialogues: {
          start: 'The rats have been multiplying. Can you thin their numbers?',
          progress: 'Have you dealt with those rats yet?',
          complete: 'Well done! Here\'s your reward.'
        }
      },
      {
        name: 'Wolf Trouble',
        description: 'Young wolves have been attacking travelers.',
        type: 'kill',
        requirements: { level: 1 },
        objectives: [{
          type: 'kill',
          target: monsters.find(m => m.name === 'Young Wolf')._id.toString(),
          quantity: 7,
          description: 'Kill 7 Young Wolves'
        }],
        rewards: {
          experience: 100,
          gold: 30,
          items: [{ item: items.find(i => i.name === 'Minor Health Potion')._id, quantity: 2 }]
        },
        npc: {
          start: npcs.find(n => n.name === 'Captain Marcus')._id,
          end: npcs.find(n => n.name === 'Captain Marcus')._id
        },
        dialogues: {
          start: 'The wolves are becoming more aggressive. Help us deal with them.',
          progress: 'How goes the wolf hunt?',
          complete: 'Excellent work! The roads will be safer now.'
        }
      },

      // Level 2-3 Quests
      {
        name: 'Boar Hunt',
        description: 'Wild boars are destroying the farmers\' crops.',
        type: 'kill',
        requirements: { level: 2 },
        objectives: [{
          type: 'kill',
          target: monsters.find(m => m.name === 'Wild Boar')._id.toString(),
          quantity: 10,
          description: 'Kill 10 Wild Boars'
        }],
        rewards: {
          experience: 200,
          gold: 50,
          items: [{ item: items.find(i => i.name === 'Health Potion')._id, quantity: 2 }]
        },
        npc: {
          start: npcs.find(n => n.name === 'Captain Marcus')._id,
          end: npcs.find(n => n.name === 'Captain Marcus')._id
        },
        dialogues: {
          start: 'The farmers need help with the wild boars.',
          progress: 'Are the boars still troubling the farms?',
          complete: 'The farmers will be grateful for your help.'
        }
      },
      {
        name: 'Goblin Scouts',
        description: 'Goblin scouts have been spotted near the village.',
        type: 'kill',
        requirements: { level: 3 },
        objectives: [{
          type: 'kill',
          target: monsters.find(m => m.name === 'Goblin Scout')._id.toString(),
          quantity: 12,
          description: 'Kill 12 Goblin Scouts'
        }],
        rewards: {
          experience: 300,
          gold: 75,
          items: [{ item: items.find(i => i.name === 'Iron Sword')._id, quantity: 1 }]
        },
        npc: {
          start: npcs.find(n => n.name === 'Captain Marcus')._id,
          end: npcs.find(n => n.name === 'Captain Marcus')._id
        },
        dialogues: {
          start: 'We\'ve spotted goblin scouts. This could mean trouble.',
          progress: 'Have you found those goblin scouts?',
          complete: 'Good work. We\'ll need to stay vigilant.'
        }
      },

      // Level 4-6 Quests
      {
        name: 'Spider Nest',
        description: 'Clear out a nest of giant spiders in the cave.',
        type: 'kill',
        requirements: { level: 4 },
        objectives: [{
          type: 'kill',
          target: monsters.find(m => m.name === 'Giant Spider')._id.toString(),
          quantity: 15,
          description: 'Kill 15 Giant Spiders'
        }],
        rewards: {
          experience: 500,
          gold: 125,
          items: [{ item: items.find(i => i.name === 'Reinforced Leather Armor')._id, quantity: 1 }]
        },
        npc: {
          start: npcs.find(n => n.name === 'Captain Marcus')._id,
          end: npcs.find(n => n.name === 'Captain Marcus')._id
        },
        dialogues: {
          start: 'Spiders have taken over the cave. It needs to be cleared.',
          progress: 'How\'s the spider situation?',
          complete: 'The cave is safe now, thanks to you.'
        }
      },
      {
        name: 'Orc Threat',
        description: 'The orc camp is growing. Time to push them back.',
        type: 'kill',
        requirements: { level: 5 },
        objectives: [{
          type: 'kill',
          target: monsters.find(m => m.name === 'Orc Warrior')._id.toString(),
          quantity: 20,
          description: 'Kill 20 Orc Warriors'
        }],
        rewards: {
          experience: 750,
          gold: 200,
          items: [{ item: items.find(i => i.name === 'Steel Sword')._id, quantity: 1 }]
        },
        npc: {
          start: npcs.find(n => n.name === 'Captain Marcus')._id,
          end: npcs.find(n => n.name === 'Captain Marcus')._id
        },
        dialogues: {
          start: 'The orc camp is growing too large. We need to act.',
          progress: 'Have you weakened their forces?',
          complete: 'Excellent. This should slow their expansion.'
        }
      },

      // Level 7-10 Quests
      {
        name: 'Undead Uprising',
        description: 'The undead are rising from the crypt.',
        type: 'kill',
        requirements: { level: 7 },
        objectives: [{
          type: 'kill',
          target: monsters.find(m => m.name === 'Skeleton Warrior')._id.toString(),
          quantity: 25,
          description: 'Kill 25 Skeleton Warriors'
        }],
        rewards: {
          experience: 1250,
          gold: 300,
          items: [{ item: items.find(i => i.name === 'Chainmail Armor')._id, quantity: 1 }]
        },
        npc: {
          start: npcs.find(n => n.name === 'Captain Marcus')._id,
          end: npcs.find(n => n.name === 'Captain Marcus')._id
        },
        dialogues: {
          start: 'The dead are restless. The crypt must be cleansed.',
          progress: 'Are the undead still rising?',
          complete: 'You\'ve done the town a great service.'
        }
      },
      {
        name: 'Dragon\'s Scales',
        description: 'Collect dragon scales for crafting legendary armor.',
        type: 'collect',
        requirements: { level: 10 },
        objectives: [{
          type: 'collect',
          target: items.find(i => i.name === 'Dragon Scale')._id.toString(),
          quantity: 5,
          description: 'Collect 5 Dragon Scales'
        }],
        rewards: {
          experience: 2000,
          gold: 1000,
          items: [{ item: items.find(i => i.name === 'Dragon Scale Armor')._id, quantity: 1 }]
        },
        npc: {
          start: npcs.find(n => n.name === 'Blacksmith Grom')._id,
          end: npcs.find(n => n.name === 'Blacksmith Grom')._id
        },
        dialogues: {
          start: 'I need dragon scales to craft legendary armor. Can you obtain them?',
          progress: 'Have you gathered the scales yet?',
          complete: 'Perfect! Let me craft you something special.'
        }
      }
    ]);

    console.log('Created quests:', quests.length);

    // DUNGEONS SEED DATA
    // DUNGEONS SEED DATA with Floor System
const dungeons = await Dungeon.create([
  // Level 1-3 Dungeon
  {
    name: 'Forest Cave',
    description: 'A small cave system inhabited by wolves and goblins',
    difficulty: 'easy',
    requirements: { minLevel: 1, maxLevel: 5 },
    totalFloors: 5,
    floors: [
      {
        number: 1,
        type: 'monster',
        monster: monsters.find(m => m.name === 'Forest Rat')._id,
        energyCost: 5
      },
      {
        number: 2,
        type: 'monster',
        monster: monsters.find(m => m.name === 'Young Wolf')._id,
        energyCost: 5
      },
      {
        number: 3,
        type: 'treasure',
        treasures: [
          { item: items.find(i => i.name === 'Health Potion')._id, quantity: 2, chance: 100 },
          { item: items.find(i => i.name === 'Iron Sword')._id, quantity: 1, chance: 30 }
        ],
        energyCost: 5
      },
      {
        number: 4,
        type: 'monster',
        monster: monsters.find(m => m.name === 'Goblin Scout')._id,
        energyCost: 10
      },
      {
        number: 5,
        type: 'boss',
        boss: {
          monster: monsters.find(m => m.name === 'Forest Bear')._id,
          rewards: {
            guaranteed: [
              { item: items.find(i => i.name === 'Bear Claw')._id, quantity: 2 },
              { item: items.find(i => i.name === 'Health Potion')._id, quantity: 3 }
            ],
            chances: [
              { item: items.find(i => i.name === 'Reinforced Leather Armor')._id, quantity: 1, chance: 50 }
            ]
          }
        },
        energyCost: 15
      }
    ],
    maxPlayers: 3,
    cooldown: 1800
  },

  // Level 4-6 Dungeon
  {
    name: 'Spider Caverns',
    description: 'A dark cave system filled with giant spiders',
    difficulty: 'normal',
    requirements: { minLevel: 4, maxLevel: 8 },
    totalFloors: 8,
    floors: [
      {
        number: 1,
        type: 'monster',
        monster: monsters.find(m => m.name === 'Giant Spider')._id,
        energyCost: 10
      },
      {
        number: 2,
        type: 'event',
        events: [{
          type: 'trap',
          description: 'Spider webs slow your movement',
          effect: { type: 'debuff', value: 30, duration: 60 }
        }],
        energyCost: 5
      },
      {
        number: 3,
        type: 'monster',
        monster: monsters.find(m => m.name === 'Giant Spider')._id,
        energyCost: 10
      },
      {
        number: 4,
        type: 'treasure',
        treasures: [
          { item: items.find(i => i.name === 'Spider Silk')._id, quantity: 3, chance: 100 },
          { item: items.find(i => i.name === 'Greater Health Potion')._id, quantity: 2, chance: 50 }
        ],
        energyCost: 5
      },
      {
        number: 5,
        type: 'monster',
        monster: monsters.find(m => m.name === 'Orc Warrior')._id,
        energyCost: 15
      },
      {
        number: 6,
        type: 'rest',
        events: [{
          type: 'buff',
          description: 'A magical fountain restores your health',
          effect: { type: 'heal', value: 100 }
        }],
        energyCost: 0
      },
      {
        number: 7,
        type: 'monster',
        monster: monsters.find(m => m.name === 'Giant Spider')._id,
        energyCost: 15
      },
      {
        number: 8,
        type: 'boss',
        boss: {
          monster: monsters.find(m => m.name === 'Dark Mage')._id,
          rewards: {
            guaranteed: [
              { item: items.find(i => i.name === 'Spider Silk')._id, quantity: 5 },
              { item: items.find(i => i.name === 'Greater Health Potion')._id, quantity: 3 }
            ],
            chances: [
              { item: items.find(i => i.name === 'Elemental Staff')._id, quantity: 1, chance: 40 },
              { item: items.find(i => i.name === 'Chainmail Armor')._id, quantity: 1, chance: 30 }
            ]
          }
        },
        energyCost: 20
      }
    ],
    maxPlayers: 5,
    cooldown: 3600
  },

  // Level 7-10 Dungeon
  {
    name: 'Dragon\'s Lair',
    description: 'The lair of a young but dangerous dragon',
    difficulty: 'hard',
    requirements: { minLevel: 8, maxLevel: 12 },
    totalFloors: 12,
    floors: [
      {
        number: 1,
        type: 'monster',
        monster: monsters.find(m => m.name === 'Skeleton Warrior')._id,
        energyCost: 15
      },
      {
        number: 2,
        type: 'monster',
        monster: monsters.find(m => m.name === 'Skeleton Warrior')._id,
        energyCost: 15
      },
      {
        number: 3,
        type: 'event',
        events: [{
          type: 'trap',
          description: 'Lava pits damage you as you pass',
          effect: { type: 'damage', value: 50 }
        }],
        energyCost: 10
      },
      {
        number: 4,
        type: 'treasure',
        treasures: [
          { item: items.find(i => i.name === 'Greater Health Potion')._id, quantity: 3, chance: 100 },
          { item: items.find(i => i.name === 'Enchanted Blade')._id, quantity: 1, chance: 20 }
        ],
        energyCost: 10
      },
      {
        number: 5,
        type: 'monster',
        monster: monsters.find(m => m.name === 'Shadow Assassin')._id,
        energyCost: 20
      },
      {
        number: 6,
        type: 'event',
        events: [{
          type: 'merchant',
          description: 'A mysterious merchant offers rare items',
          effect: { type: 'buff', value: 0 }
        }],
        energyCost: 5
      },
      {
        number: 7,
        type: 'monster',
        monster: monsters.find(m => m.name === 'Fire Elemental')._id,
        energyCost: 20
      },
      {
        number: 8,
        type: 'rest',
        events: [{
          type: 'buff',
          description: 'An ancient shrine grants you protection',
          effect: { type: 'buff', value: 20, duration: 300 }
        }],
        energyCost: 0
      },
      {
        number: 9,
        type: 'monster',
        monster: monsters.find(m => m.name === 'Fire Elemental')._id,
        energyCost: 20
      },
      {
        number: 10,
        type: 'monster',
        monster: monsters.find(m => m.name === 'Shadow Assassin')._id,
        energyCost: 25
      },
      {
        number: 11,
        type: 'treasure',
        treasures: [
          { item: items.find(i => i.name === 'Dragon Scale')._id, quantity: 1, chance: 30 },
          { item: items.find(i => i.name === 'Greater Health Potion')._id, quantity: 5, chance: 100 }
        ],
        energyCost: 15
      },
      {
        number: 12,
        type: 'boss',
        boss: {
          monster: monsters.find(m => m.name === 'Young Dragon')._id,
          rewards: {
            guaranteed: [
              { item: items.find(i => i.name === 'Dragon Scale')._id, quantity: 3 },
              { item: items.find(i => i.name === 'Greater Health Potion')._id, quantity: 5 }
            ],
            chances: [
              { item: items.find(i => i.name === 'Dragon Scale Armor')._id, quantity: 1, chance: 50 },
              { item: items.find(i => i.name === 'Enchanted Blade')._id, quantity: 1, chance: 40 },
              { item: items.find(i => i.name === 'Shadowblade')._id, quantity: 1, chance: 40 },
              { item: items.find(i => i.name === 'Holy Staff')._id, quantity: 1, chance: 40 }
            ]
          }
        },
        energyCost: 30
      }
    ],
    maxPlayers: 10,
    cooldown: 7200
  }
]);

    console.log('Created dungeons:', dungeons.length);

    console.log('Seed completed successfully!');
    console.log('Summary:');
    console.log(`- ${items.length} items`);
    console.log(`- ${monsters.length} monsters`);
    console.log(`- ${skills.length} skills`);
    console.log(`- ${npcs.length} NPCs`);
    console.log(`- ${quests.length} quests`);
    console.log(`- ${dungeons.length} dungeons`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();