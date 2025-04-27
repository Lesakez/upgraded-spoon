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
  levelUp: (id) => api.put(`/characters/${id}/levelup`),
  equipItem: (id, data) => api.put(`/characters/${id}/equip`, data),
  unequipItem: (id, data) => api.put(`/characters/${id}/unequip`, data),
  rest: (id) => api.put(`/characters/${id}/rest`),
};

export const questAPI = {
  getAvailableQuests: (characterId) => api.get(`/quests/available/${characterId}`),
  acceptQuest: (questId, data) => api.post(`/quests/${questId}/accept`, data),
  updateProgress: (questId, data) => api.put(`/quests/${questId}/progress`, data),
  completeQuest: (questId, data) => api.post(`/quests/${questId}/complete`, data),
  abandonQuest: (questId, data) => api.post(`/quests/${questId}/abandon`, data),
};

export const dungeonAPI = {
  getDungeons: () => api.get('/dungeons'),
  getDungeon: (id) => api.get(`/dungeons/${id}`),
  enterDungeon: (id, characterId) => api.post(`/dungeons/${id}/enter`, { characterId }),
  leaveDungeon: (id, data) => api.post(`/dungeons/${id}/leave`, data),
  moveToNextFloor: (id, data) => api.post(`/dungeons/${id}/nextFloor`, data),
  updateProgress: (id, data) => api.put(`/dungeons/${id}/progress`, data),
  completeDungeon: (id, data) => api.post(`/dungeons/${id}/complete`, data),
  getDungeonInstances: (id) => api.get(`/dungeons/${id}/instances`)
};

export const inventoryAPI = {
  getInventory: (characterId) => api.get(`/characters/${characterId}/inventory`),
  addItem: (characterId, data) => api.post(`/characters/${characterId}/inventory`, data),
  removeItem: (characterId, itemId, data) => api.delete(`/characters/${characterId}/inventory/${itemId}`, { data }),
  useItem: (characterId, itemId) => api.post(`/characters/${characterId}/inventory/${itemId}/use`),
  dropItem: (characterId, itemId, data) => api.post(`/characters/${characterId}/inventory/${itemId}/drop`, data),
  transferItem: (characterId, itemId, data) => api.post(`/characters/${characterId}/inventory/${itemId}/transfer`, data),
};

export const guildAPI = {
  getGuilds: () => api.get('/guilds'),
  getGuild: (id) => api.get(`/guilds/${id}`),
  createGuild: (data) => api.post('/guilds', data),
  applyToGuild: (id, data) => api.post(`/guilds/${id}/apply`, data),
  handleApplication: (id, applicationId, data) => api.put(`/guilds/${id}/applications/${applicationId}`, data),
  leaveGuild: (id, data) => api.post(`/guilds/${id}/leave`, data),
  kickMember: (id, data) => api.post(`/guilds/${id}/kick`, data),
  changeMemberRole: (id, memberId, data) => api.put(`/guilds/${id}/members/${memberId}/role`, data),
  disbandGuild: (id, data) => api.delete(`/guilds/${id}`, { data }),
};

export const shopAPI = {
  getAllShops: () => api.get('/shops'),
  getShopItems: (npcId) => api.get(`/shops/${npcId}`),
  buyItem: (npcId, data) => api.post(`/shops/${npcId}/buy`, data),
  sellItem: (npcId, data) => api.post(`/shops/${npcId}/sell`, data),
};

export const trainingAPI = {
  getAllTrainers: () => api.get('/training'),
  getAvailableSkills: (npcId) => api.get(`/training/${npcId}`),
  learnSkill: (npcId, data) => api.post(`/training/${npcId}/learn`, data),
  getLearnableSkills: (characterId) => api.get(`/training/learnable/${characterId}`),
};

export const tavernAPI = {
  getTavernInfo: () => api.get('/tavern'),
  useTavernService: (data) => api.post('/tavern/service', data),
  gamble: (data) => api.post('/tavern/gamble', data),
};

export const leaderboardAPI = {
  getLeaderboard: (type) => api.get(`/leaderboard/${type}`),
  getCharacterRank: (type, characterId) => api.get(`/leaderboard/${type}/rank/${characterId}`),
};

export const pvpAPI = {
  joinQueue: (data) => api.post('/pvp/queue', data),
  leaveQueue: (data) => api.post('/pvp/queue/leave', data),
  getPvPLeaderboard: () => api.get('/pvp/leaderboard'),
};

export default api;