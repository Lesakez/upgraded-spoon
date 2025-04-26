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
        // Send to party members
        clients.forEach((client) => {
          if (client.partyId === clients.get(ws).partyId && client.ws.readyState === 1) {
            client.ws.send(JSON.stringify(chatMessage));
          }
        });
        break;
        
      case 'guild':
        // Send to guild members
        clients.forEach((client) => {
          if (client.guildId === clients.get(ws).guildId && client.ws.readyState === 1) {
            client.ws.send(JSON.stringify(chatMessage));
          }
        });
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