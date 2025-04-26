import Character from '../../models/Character.js';
import Dungeon from '../../models/Dungeon.js';
import Monster from '../../models/Monster.js';

const battleHandler = async (ws, data, clients) => {
  const { characterId, dungeonId } = data;
  
  try {
    const character = await Character.findById(characterId);
    if (!character) {
      ws.send(JSON.stringify({
        type: 'ERROR',
        message: 'Character not found'
      }));
      return;
    }
    
    switch (data.type) {
      case 'START_BATTLE':
        await startBattle(ws, character, dungeonId, clients);
        break;
        
      case 'LEAVE_BATTLE':
        await leaveBattle(ws, character, clients);
        break;
        
      default:
        ws.send(JSON.stringify({
          type: 'ERROR',
          message: 'Unknown battle action'
        }));
    }
    
  } catch (error) {
    console.error('Battle handler error:', error);
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: 'Battle action failed'
    }));
  }
};

const startBattle = async (ws, character, dungeonId, clients) => {
  const dungeon = await Dungeon.findById(dungeonId);
  if (!dungeon) {
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: 'Dungeon not found'
    }));
    return;
  }
  
  // Check if character can enter
  if (!dungeon.canEnter(character)) {
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: 'Character cannot enter this dungeon'
    }));
    return;
  }
  
  // Get or create instance
  let instance = dungeon.instances.find(inst => 
    inst.state === 'active' && 
    inst.players.length < dungeon.maxPlayers
  );
  
  if (!instance) {
    instance = dungeon.createInstance([character._id]);
  } else {
    instance.players.push(character._id);
  }
  
  await dungeon.save();
  
  // Get monsters for the dungeon
  const monsters = [];
  for (const room of dungeon.layout.rooms) {
    if (room.monsters && room.monsters.length > 0) {
      for (const monsterData of room.monsters) {
        const monster = await Monster.findById(monsterData.monster);
        if (monster) {
          monsters.push({
            ...monster.toObject(),
            roomId: room.id,
            quantity: monsterData.quantity
          });
        }
      }
    }
  }
  
  // Send battle started message
  ws.send(JSON.stringify({
    type: 'BATTLE_STARTED',
    dungeon: {
      id: dungeon._id,
      name: dungeon.name,
      difficulty: dungeon.difficulty
    },
    instance: {
      id: instance.id,
      players: instance.players
    },
    monsters: monsters
  }));
  
  // Notify other players in the instance
  clients.forEach((client) => {
    if (client.characterId && 
        instance.players.includes(client.characterId) && 
        client.ws !== ws && 
        client.ws.readyState === 1) {
      client.ws.send(JSON.stringify({
        type: 'PLAYER_JOINED_BATTLE',
        characterId: character._id,
        characterName: character.name
      }));
    }
  });
};

const leaveBattle = async (ws, character, clients) => {
  // Find the active dungeon instance
  const dungeon = await Dungeon.findOne({
    'instances.players': character._id,
    'instances.state': 'active'
  });
  
  if (!dungeon) {
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: 'No active battle found'
    }));
    return;
  }
  
  const instance = dungeon.instances.find(inst => 
    inst.players.includes(character._id) && 
    inst.state === 'active'
  );
  
  if (!instance) {
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: 'Instance not found'
    }));
    return;
  }
  
  // Remove player from instance
  instance.players = instance.players.filter(
    playerId => playerId.toString() !== character._id.toString()
  );
  
  // If no players left, mark instance as completed
  if (instance.players.length === 0) {
    instance.state = 'completed';
    instance.completedAt = new Date();
  }
  
  await dungeon.save();
  
  // Send confirmation
  ws.send(JSON.stringify({
    type: 'BATTLE_LEFT',
    dungeonId: dungeon._id
  }));
  
  // Notify other players in the instance
  clients.forEach((client) => {
    if (client.characterId && 
        instance.players.includes(client.characterId) && 
        client.ws !== ws && 
        client.ws.readyState === 1) {
      client.ws.send(JSON.stringify({
        type: 'PLAYER_LEFT_BATTLE',
        characterId: character._id,
        characterName: character.name
      }));
    }
  });
};

export default battleHandler;