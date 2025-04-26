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
    this.emit('CHAT', { message, channel });
  }

  moveCharacter(x, y, direction) {
    this.emit('MOVEMENT', { x, y, direction });
  }

  attack(targetId, targetType = 'monster') {
    this.emit('COMBAT', { action: 'ATTACK', targetId, targetType });
  }

  useSkill(skillId, targetId, targetType = 'monster') {
    this.emit('COMBAT', { action: 'SKILL', skillId, targetId, targetType });
  }
}

const socketService = new SocketService();
export default socketService;