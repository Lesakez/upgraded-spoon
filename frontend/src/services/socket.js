import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.listeners = new Map();
  }

  connect() {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found, cannot connect to socket');
      return;
    }

    this.socket = io('ws://localhost:5000', {
      query: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.socket.on('connect', () => {
      console.log('Connected to game server');
      this.connected = true;
      // Повторно выбираем персонажа после переподключения
      const selectedCharacterId = localStorage.getItem('selectedCharacterId');
      if (selectedCharacterId) {
        this.selectCharacter(selectedCharacterId);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from game server');
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Reattach existing listeners
    this.listeners.forEach((callback, event) => {
      this.socket.on(event, callback);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  emit(event, data) {
    if (this.socket && this.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit event:', event);
      // Попытка переподключения
      if (!this.socket) {
        this.connect();
      }
    }
  }

  on(event, callback) {
    this.listeners.set(event, callback);
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event) {
    this.listeners.delete(event);
    if (this.socket) {
      this.socket.off(event);
    }
  }

  // Game specific methods
  selectCharacter(characterId) {
    this.emit('SELECT_CHARACTER', { characterId });
  }

  sendChatMessage(message, channel = 'global') {
    const characterId = localStorage.getItem('selectedCharacterId');
    if (!characterId) {
      console.error('No selected character ID found');
      return;
    }
    this.emit('CHAT', { 
      characterId,
      message, 
      channel 
    });
  }

  attack(targetId, targetType = 'monster') {
    const characterId = localStorage.getItem('selectedCharacterId');
    if (!characterId) {
      console.error('No selected character ID found');
      return;
    }
    this.emit('COMBAT', { 
      characterId,
      action: 'ATTACK', 
      targetId, 
      targetType 
    });
  }

  useSkill(skillId, targetId, targetType = 'monster') {
    const characterId = localStorage.getItem('selectedCharacterId');
    if (!characterId) {
      console.error('No selected character ID found');
      return;
    }
    this.emit('COMBAT', { 
      characterId,
      action: 'SKILL', 
      skillId, 
      targetId, 
      targetType 
    });
  }

  useItem(itemId, targetId = null) {
    const characterId = localStorage.getItem('selectedCharacterId');
    if (!characterId) {
      console.error('No selected character ID found');
      return;
    }
    this.emit('COMBAT', { 
      characterId,
      action: 'ITEM', 
      itemId, 
      targetId 
    });
  }

  startBattle(dungeonId) {
    const characterId = localStorage.getItem('selectedCharacterId');
    if (!characterId) {
      console.error('No selected character ID found');
      return;
    }
    this.emit('START_BATTLE', { 
      characterId,
      dungeonId 
    });
  }

  leaveBattle() {
    const characterId = localStorage.getItem('selectedCharacterId');
    if (!characterId) {
      console.error('No selected character ID found');
      return;
    }
    this.emit('LEAVE_BATTLE', {
      characterId
    });
  }

  joinParty(partyId) {
    const characterId = localStorage.getItem('selectedCharacterId');
    if (!characterId) {
      console.error('No selected character ID found');
      return;
    }
    this.emit('JOIN_PARTY', { 
      characterId,
      partyId 
    });
  }

  leaveParty() {
    const characterId = localStorage.getItem('selectedCharacterId');
    if (!characterId) {
      console.error('No selected character ID found');
      return;
    }
    this.emit('LEAVE_PARTY', {
      characterId
    });
  }
}

const socketService = new SocketService();
export default socketService;