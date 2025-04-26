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

    // Seed Items
    const items = await Item.create([
      // Weapons
      {
        name: 'Rusty Sword',
        description: 'A worn but functional sword',
        type: 'weapon',
        rarity: 'common',
        requirements: { level: 1 },
        stats: { damage: 5 },
        value: 10,
        stackable: false,
        isTradeable: true,
        isSellable: true
      },
      {
        name: 'Iron Sword',
        description: 'A well-crafted iron sword',
        type: 'weapon',
        rarity: 'uncommon',
        requirements: { level: 5 },
        stats: { damage: 12, strength: 2 },
        value: 50,
        stackable: false,
        isTradeable: true,
        isSellable: true
      },
      {
        name: 'Magic Staff',
        description: 'A staff imbued with magical energy',
        type: 'weapon',
        rarity: 'uncommon',
        requirements: { level: 5, class: ['mage'] },
        stats: { magicPower: 15, intelligence: 3 },
        value: 60,
        stackable: false,
        isTradeable: true,
        isSellable: true
      },
      // Armor
      {
        name: 'Leather Armor',
        description: 'Basic leather protection',
        type: 'armor',
        rarity: 'common',
        requirements: { level: 1 },
        stats: { defense: 5 },
        value: 15,
        stackable: false,
        isTradeable: true,
        isSellable: true
      },
      {
        name: 'Iron Chestplate',
        description: 'Sturdy iron armor',
        type: 'armor',
        rarity: 'uncommon',
        requirements: { level: 5 },
        stats: { defense: 12, vitality: 2 },
        value: 70,
        stackable: false,
        isTradeable: true,
        isSellable: true
      },
      // Consumables
      {
        name: 'Health Potion',
        description: 'Restores 50 health points',
        type: 'consumable',
        rarity: 'common',
        requirements: { level: 1 },
        effects: [{ type: 'heal', value: 50, duration: 0 }],
        value: 20,
        stackable: true,
        maxStack: 10,
        isTradeable: true,
        isSellable: true
      },
      {
        name: 'Mana Potion',
        description: 'Restores 30 mana points',
        type: 'consumable',
        rarity: 'common',
        requirements: { level: 1 },
        effects: [{ type: 'mana', value: 30, duration: 0 }],
        value: 20,
        stackable: true,
        maxStack: 10,
        isTradeable: true,
        isSellable: true
      },
      // Materials
      {
        name: 'Wolf Pelt',
        description: 'The hide of a wolf, used for crafting',
        type: 'material',
        rarity: 'common',
        requirements: { level: 1 },
        value: 5,
        stackable: true,
        maxStack: 20,
        isTradeable: true,
        isSellable: true
      }
    ]);

    console.log('Created items:', items.length);

    // Seed Skills
    const skills = await Skill.create([
      // Warrior skills
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
        name: 'Battle Cry',
        description: 'Increase strength for a short time',
        type: 'active',
        category: 'buff',
        class: 'warrior',
        levelRequired: 3,
        manaCost: 15,
        cooldown: 30,
        effects: [{
          type: 'buff',
          target: 'self',
          value: { base: 5 },
          duration: 10
        }]
      },
      // Mage skills
      {
        name: 'Fireball',
        description: 'Hurls a ball of fire at the enemy',
        type: 'active',
        category: 'combat',
        class: 'mage',
        levelRequired: 1,
        manaCost: 15,
        cooldown: 6,
        range: 20,
        effects: [{
          type: 'damage',
          target: 'enemy',
          value: { base: 25, scaling: { stat: 'intelligence', ratio: 2 } }
        }]
      },
      {
        name: 'Ice Shield',
        description: 'Creates a protective shield of ice',
        type: 'active',
        category: 'buff',
        class: 'mage',
        levelRequired: 3,
        manaCost: 20,
        cooldown: 25,
        effects: [{
          type: 'buff',
          target: 'self',
          value: { base: 10 },
          duration: 15
        }]
      },
      // Healer skills
      {
        name: 'Heal',
        description: 'Restores health to a target',
        type: 'active',
        category: 'healing',
        class: 'healer',
        levelRequired: 1,
        manaCost: 20,
        cooldown: 8,
        range: 15,
        effects: [{
          type: 'heal',
          target: 'ally',
          value: { base: 30, scaling: { stat: 'intelligence', ratio: 1.2 } }
        }]
      }
    ]);

    console.log('Created skills:', skills.length);

    // Seed Monsters
    const monsters = await Monster.create([
      {
        name: 'Wolf',
        description: 'A fierce forest predator',
        type: 'normal',
        level: 1,
        health: { max: 50 },
        stats: { strength: 8, dexterity: 12, vitality: 5 },
        damage: { min: 3, max: 7 },
        defense: 2,
        experienceValue: 15,
        goldValue: { min: 2, max: 5 },
        drops: [
          { item: items.find(i => i.name === 'Wolf Pelt')._id, chance: 30, minQuantity: 1, maxQuantity: 1 }
        ],
        behavior: { aggressive: true, aggroRange: 10 },
        spawnLocations: [{ map: 'forest', x: 100, y: 100, radius: 20 }],
        respawnTime: 60
      },
      {
        name: 'Goblin',
        description: 'A small but cunning creature',
        type: 'normal',
        level: 3,
        health: { max: 70 },
        stats: { strength: 10, dexterity: 10, vitality: 8 },
        damage: { min: 5, max: 10 },
        defense: 3,
        experienceValue: 25,
        goldValue: { min: 5, max: 10 },
        behavior: { aggressive: true, aggroRange: 12 },
        spawnLocations: [{ map: 'forest', x: 200, y: 200, radius: 30 }],
        respawnTime: 90
      },
      {
        name: 'Forest Guardian',
        description: 'A powerful protector of the forest',
        type: 'boss',
        level: 10,
        health: { max: 500 },
        stats: { strength: 25, dexterity: 15, vitality: 30, intelligence: 20 },
        damage: { min: 15, max: 25 },
        defense: 15,
        experienceValue: 200,
        goldValue: { min: 50, max: 100 },
        drops: [
          { item: items.find(i => i.name === 'Iron Sword')._id, chance: 10, minQuantity: 1, maxQuantity: 1 },
          { item: items.find(i => i.name === 'Magic Staff')._id, chance: 10, minQuantity: 1, maxQuantity: 1 }
        ],
        skills: [],
        behavior: { aggressive: true, aggroRange: 20 },
        spawnLocations: [{ map: 'forest_boss_room', x: 50, y: 50, radius: 0 }],
        respawnTime: 3600
      }
    ]);

    console.log('Created monsters:', monsters.length);

    // Seed NPCs
    const npcs = await NPC.create([
      {
        name: 'Elder Thorn',
        title: 'Village Elder',
        description: 'The wise leader of the village',
        type: 'quest_giver',
        location: { map: 'town', x: 50, y: 50 },
        dialogues: {
          greeting: 'Greetings, adventurer. How may I help you?',
          farewell: 'May the spirits guide your path.',
          idle: ['The forest has become dangerous lately...', 'We need brave souls like you.']
        }
      },
      {
        name: 'Marcus',
        title: 'Blacksmith',
        description: 'The town blacksmith',
        type: 'merchant',
        location: { map: 'town', x: 100, y: 50 },
        dialogues: {
          greeting: 'Welcome to my shop! Looking for weapons or armor?',
          farewell: 'Come back when you need quality equipment!'
        },
        shop: {
          items: [
            { item: items.find(i => i.name === 'Rusty Sword')._id, stock: -1, price: 10 },
            { item: items.find(i => i.name === 'Leather Armor')._id, stock: -1, price: 15 },
            { item: items.find(i => i.name === 'Health Potion')._id, stock: -1, price: 20 }
          ],
          buyMultiplier: 0.5
        }
      }
    ]);

    console.log('Created NPCs:', npcs.length);

    // Seed Quests
    const quests = await Quest.create([
      {
        name: 'Wolf Problem',
        description: 'The wolves have been attacking travelers on the road. Help us deal with them.',
        type: 'kill',
        requirements: { level: 1 },
        objectives: [{
          type: 'kill',
          target: monsters.find(m => m.name === 'Wolf')._id.toString(),
          quantity: 5,
          description: 'Kill 5 wolves'
        }],
        rewards: {
          experience: 100,
          gold: 20,
          items: [{ item: items.find(i => i.name === 'Health Potion')._id, quantity: 2 }]
        },
        npc: {
          start: npcs.find(n => n.name === 'Elder Thorn')._id,
          end: npcs.find(n => n.name === 'Elder Thorn')._id
        },
        dialogues: {
          start: 'Wolves have been terrorizing our village. Could you help us?',
          progress: 'Have you dealt with the wolves yet?',
          complete: 'Thank you! The village is safer now.'
        }
      }
    ]);

    console.log('Created quests:', quests.length);

    // Seed Dungeons
    const dungeons = await Dungeon.create([
      {
        name: 'Forest Cave',
        description: 'A dark cave deep in the forest, home to many dangers',
        difficulty: 'normal',
        requirements: { minLevel: 5, maxLevel: 10 },
        layout: {
          width: 10,
          height: 10,
          rooms: [
            {
              id: 'entrance',
              x: 0,
              y: 0,
              type: 'entrance',
              connections: ['room1']
            },
            {
              id: 'room1',
              x: 1,
              y: 0,
              type: 'normal',
              connections: ['entrance', 'room2'],
              monsters: [
                { monster: monsters.find(m => m.name === 'Goblin')._id, quantity: 2, respawnTime: 300 }
              ]
            },
            {
              id: 'room2',
              x: 2,
              y: 0,
              type: 'treasure',
              connections: ['room1', 'boss_room'],
              treasures: [
                { item: items.find(i => i.name === 'Iron Sword')._id, quantity: 1, chance: 30 }
              ]
            },
            {
              id: 'boss_room',
              x: 3,
              y: 0,
              type: 'boss',
              connections: ['room2'],
              monsters: [
                { monster: monsters.find(m => m.name === 'Forest Guardian')._id, quantity: 1, respawnTime: 3600 }
              ]
            }
          ]
        },
        boss: {
          monster: monsters.find(m => m.name === 'Forest Guardian')._id,
          respawnTime: 3600,
          rewards: {
            guaranteed: [
              { item: items.find(i => i.name === 'Iron Chestplate')._id, quantity: 1 }
            ],
            chances: [
              { item: items.find(i => i.name === 'Magic Staff')._id, quantity: 1, chance: 20 }
            ]
          }
        },
        maxPlayers: 5,
        timeLimit: 0,
        cooldown: 1800
      }
    ]);

    console.log('Created dungeons:', dungeons.length);
    console.log('Seed completed successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();