import Character from '../../models/Character.js';

const movementHandler = async (ws, data, clients) => {
  const { characterId, x, y, direction } = data;
  
  try {
    // Update character position in database
    const character = await Character.findById(characterId);
    if (!character) {
      ws.send(JSON.stringify({
        type: 'ERROR',
        message: 'Character not found'
      }));
      return;
    }
    
    // Validate movement (e.g., check for obstacles, map boundaries)
    // TODO: Implement proper collision detection
    
    // Update position
    character.position.x = x;
    character.position.y = y;
    character.lastActive = new Date();
    await character.save();
    
    // Broadcast movement to other players in the same area
    const movementMessage = {
      type: 'CHARACTER_MOVEMENT',
      characterId,
      position: {
        x,
        y,
        direction,
        map: character.position.map
      },
      characterInfo: {
        name: character.name,
        level: character.level,
        class: character.class
      }
    };
    
    // Send to all clients in the same map except the sender
    clients.forEach((client) => {
      if (client.characterId && 
          client.characterId !== characterId && 
          client.ws.readyState === 1) {
        // Check if characters are in the same map
        Character.findById(client.characterId).then(clientCharacter => {
          if (clientCharacter && 
              clientCharacter.position.map === character.position.map) {
            client.ws.send(JSON.stringify(movementMessage));
          }
        });
      }
    });
    
    // Send confirmation to sender
    ws.send(JSON.stringify({
      type: 'MOVEMENT_CONFIRMED',
      position: character.position
    }));
    
  } catch (error) {
    console.error('Movement handler error:', error);
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: 'Failed to update position'
    }));
  }
};

export default movementHandler;