import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

export const characterAPI = {
  getCharacters: () => api.get('/characters'),
  createCharacter: (characterData) => api.post('/characters', characterData),
  getCharacter: (id) => api.get(`/characters/${id}`),
  updateCharacter: (id, data) => api.put(`/characters/${id}`, data),
  deleteCharacter: (id) => api.delete(`/characters/${id}`),
  moveCharacter: (id, position) => api.put(`/characters/${id}/move`, position),
  levelUp: (id) => api.put(`/characters/${id}/levelup`),
  equipItem: (id, data) => api.put(`/characters/${id}/equip`, data),
  unequipItem: (id, data) => api.put(`/characters/${id}/unequip`, data),
};

export const questAPI = {
  getAvailableQuests: (characterId) => api.get(`/quests/available/${characterId}`),
  acceptQuest: (questId, characterId) => api.post(`/quests/${questId}/accept`, { characterId }),
  updateProgress: (questId, data) => api.put(`/quests/${questId}/progress`, data),
  completeQuest: (questId, characterId) => api.post(`/quests/${questId}/complete`, { characterId }),
  abandonQuest: (questId, characterId) => api.post(`/quests/${questId}/abandon`, { characterId }),
};

export const dungeonAPI = {
  getDungeons: () => api.get('/dungeons'),
  getDungeon: (id) => api.get(`/dungeons/${id}`),
  enterDungeon: (id, characterId) => api.post(`/dungeons/${id}/enter`, { characterId }),
  leaveDungeon: (id, data) => api.post(`/dungeons/${id}/leave`, data),
  updateProgress: (id, data) => api.put(`/dungeons/${id}/progress`, data),
  completeDungeon: (id, data) => api.post(`/dungeons/${id}/complete`, data),
};

export const inventoryAPI = {
  getInventory: (characterId) => api.get(`/characters/${characterId}/inventory`),
  addItem: (characterId, data) => api.post(`/characters/${characterId}/inventory`, data),
  removeItem: (characterId, itemId, data) => api.delete(`/characters/${characterId}/inventory/${itemId}`, { data }),
  useItem: (characterId, itemId) => api.post(`/characters/${characterId}/inventory/${itemId}/use`),
  dropItem: (characterId, itemId, data) => api.post(`/characters/${characterId}/inventory/${itemId}/drop`, data),
  transferItem: (characterId, itemId, data) => api.post(`/characters/${characterId}/inventory/${itemId}/transfer`, data),
};

export default api;