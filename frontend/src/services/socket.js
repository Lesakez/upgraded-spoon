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
    });

    this.socket.on('connect', () => {
      console.log('Connected to game server');
      this.connected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from game server');
      this.connected = false;
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
    this.emit('CHAT', { 
      characterId: localStorage.getItem('selectedCharacterId'), // We might need to store this
      message, 
      channel 
    });
  }

  attack(targetId, targetType = 'monster') {
    this.emit('COMBAT', { 
      characterId: localStorage.getItem('selectedCharacterId'),
      action: 'ATTACK', 
      targetId, 
      targetType 
    });
  }

  useSkill(skillId, targetId, targetType = 'monster') {
    this.emit('COMBAT', { 
      characterId: localStorage.getItem('selectedCharacterId'),
      action: 'SKILL', 
      skillId, 
      targetId, 
      targetType 
    });
  }

  useItem(itemId, targetId = null) {
    this.emit('COMBAT', { 
      characterId: localStorage.getItem('selectedCharacterId'),
      action: 'ITEM', 
      itemId, 
      targetId 
    });
  }

  startBattle(dungeonId) {
    this.emit('START_BATTLE', { 
      characterId: localStorage.getItem('selectedCharacterId'),
      dungeonId 
    });
  }

  leaveBattle() {
    this.emit('LEAVE_BATTLE', {
      characterId: localStorage.getItem('selectedCharacterId')
    });
  }

  joinParty(partyId) {
    this.emit('JOIN_PARTY', { 
      characterId: localStorage.getItem('selectedCharacterId'),
      partyId 
    });
  }

  leaveParty() {
    this.emit('LEAVE_PARTY', {
      characterId: localStorage.getItem('selectedCharacterId')
    });
  }
}

const socketService = new SocketService();
export default socketService;