import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import chatHandler from './handlers/chat.js';
import movementHandler from './handlers/movement.js';
import combatHandler from './handlers/combat.js';

export const initializeWebSocket = (server) => {
  const wss = new WebSocketServer({ server });

  // Store active connections
  const clients = new Map();

  wss.on('connection', (ws, req) => {
    // Extract token from query string
    const token = new URL(req.url, 'http://localhost').searchParams.get('token');
    
    if (!token) {
      ws.close(1008, 'Token is required');
      return;
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Store client information
      const clientInfo = {
        userId: decoded.id,
        characterId: null,
        ws: ws
      };
      
      clients.set(ws, clientInfo);
      
      // Set up message handler
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          
          switch (data.type) {
            case 'SELECT_CHARACTER':
              clientInfo.characterId = data.characterId;
              // Notify other players that character is online
              broadcastCharacterStatus(clients, clientInfo.characterId, true);
              break;
              
            case 'CHAT':
              chatHandler(ws, data, clients);
              break;
              
            case 'MOVEMENT':
              movementHandler(ws, data, clients);
              break;
              
            case 'COMBAT':
              combatHandler(ws, data, clients);
              break;
              
            default:
              console.log('Unknown message type:', data.type);
          }
        } catch (error) {
          console.error('Error processing message:', error);
        }
      });
      
      // Handle disconnection
      ws.on('close', () => {
        const client = clients.get(ws);
        if (client && client.characterId) {
          // Notify other players that character is offline
          broadcastCharacterStatus(clients, client.characterId, false);
        }
        clients.delete(ws);
      });
      
      // Handle errors
      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        clients.delete(ws);
      });
      
      // Send initial connection success message
      ws.send(JSON.stringify({
        type: 'CONNECTION_SUCCESS',
        message: 'Connected to game server'
      }));
      
    } catch (error) {
      console.error('Token verification failed:', error);
      ws.close(1008, 'Invalid token');
    }
  });

  // Broadcast functions
  const broadcastCharacterStatus = (clients, characterId, isOnline) => {
    const message = JSON.stringify({
      type: 'CHARACTER_STATUS',
      characterId,
      isOnline
    });
    
    clients.forEach((client) => {
      if (client.ws.readyState === 1) { // WebSocket.OPEN
        client.ws.send(message);
      }
    });
  };

  const broadcastToMap = (clients, map, message, excludeCharacterId = null) => {
    clients.forEach((client) => {
      if (client.characterId && 
          client.characterId !== excludeCharacterId && 
          client.ws.readyState === 1) {
        // TODO: Check if character is on the same map
        client.ws.send(JSON.stringify(message));
      }
    });
  };

  // Export functions for handlers to use
  return {
    clients,
    broadcastCharacterStatus,
    broadcastToMap
  };
};