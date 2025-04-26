import Character from '../../models/Character.js';

const chatHandler = async (ws, data, clients) => {
  const { characterId, message, channel } = data;
  
  try {
    // Get character info
    const character = await Character.findById(characterId);
    if (!character) {
      ws.send(JSON.stringify({
        type: 'ERROR',
        message: 'Character not found'
      }));
      return;
    }
    
    // Prepare chat message
    const chatMessage = {
      type: 'CHAT_MESSAGE',
      channel,
      sender: {
        id: character._id,
        name: character.name,
        level: character.level,
        class: character.class
      },
      message,
      timestamp: new Date()
    };
    
    switch (channel) {
      case 'global':
        // Send to all connected clients
        clients.forEach((client) => {
          if (client.ws.readyState === 1) {
            client.ws.send(JSON.stringify(chatMessage));
          }
        });
        break;
        
      case 'local':
        // Send to clients in the same map/area
        clients.forEach((client) => {
          if (client.characterId && client.ws.readyState === 1) {
            // TODO: Check if characters are in the same location
            Character.findById(client.characterId).then(clientCharacter => {
              if (clientCharacter && 
                  clientCharacter.position.map === character.position.map &&
                  // Check if within local chat range (e.g., 50 units)
                  Math.abs(clientCharacter.position.x - character.position.x) <= 50 &&
                  Math.abs(clientCharacter.position.y - character.position.y) <= 50) {
                client.ws.send(JSON.stringify(chatMessage));
              }
            });
          }
        });
        break;
        
      case 'whisper':
        // Send to specific character
        const targetCharacter = data.targetCharacterId;
        clients.forEach((client) => {
          if (client.characterId === targetCharacter && client.ws.readyState === 1) {
            client.ws.send(JSON.stringify({
              ...chatMessage,
              channel: 'whisper'
            }));
          }
        });
        // Send confirmation to sender
        ws.send(JSON.stringify({
          ...chatMessage,
          channel: 'whisper',
          target: targetCharacter
        }));
        break;
        
      case 'party':
        // TODO: Implement party chat
        break;
        
      case 'guild':
        // TODO: Implement guild chat
        break;
    }
    
  } catch (error) {
    console.error('Chat handler error:', error);
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: 'Failed to send chat message'
    }));
  }
};

export default chatHandler;