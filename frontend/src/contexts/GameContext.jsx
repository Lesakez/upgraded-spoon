import { createContext, useContext, useState, useEffect } from 'react';
import { characterAPI } from '../services/api';
import socketService from '../services/socket';

const GameContext = createContext(null);

export const GameProvider = ({ children }) => {
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [onlinePlayers, setOnlinePlayers] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [battleState, setBattleState] = useState(null);

  useEffect(() => {
    // Socket event listeners
    socketService.on('CHARACTER_STATUS', handleCharacterStatus);
    socketService.on('CHAT_MESSAGE', handleChatMessage);
    socketService.on('COMBAT_RESULT', handleCombatResult);
    socketService.on('BATTLE_UPDATE', handleBattleUpdate);

    return () => {
      socketService.off('CHARACTER_STATUS');
      socketService.off('CHAT_MESSAGE');
      socketService.off('COMBAT_RESULT');
      socketService.off('BATTLE_UPDATE');
    };
  }, []);

  const handleCharacterStatus = (data) => {
    setOnlinePlayers(prev => {
      if (data.isOnline) {
        return [...prev, data.characterId];
      } else {
        return prev.filter(id => id !== data.characterId);
      }
    });
  };

  const handleChatMessage = (message) => {
    setChatMessages(prev => [...prev, message]);
  };

  const handleCombatResult = (data) => {
    // Handle combat results (damage, death, etc.)
    if (selectedCharacter && data.targetId === selectedCharacter._id) {
      setSelectedCharacter(prev => ({
        ...prev,
        health: {
          ...prev.health,
          current: data.targetHealth,
        },
      }));
    }
  };

  const handleBattleUpdate = (data) => {
    setBattleState(data);
  };

  const fetchCharacters = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await characterAPI.getCharacters();
      setCharacters(response.data.data);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to fetch characters');
    } finally {
      setLoading(false);
    }
  };

  const createCharacter = async (characterData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await characterAPI.createCharacter(characterData);
      setCharacters(prev => [...prev, response.data.data]);
      return true;
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create character');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const selectCharacter = async (characterId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await characterAPI.getCharacter(characterId);
      setSelectedCharacter(response.data.data);
      // Store character ID in localStorage for socket service
      localStorage.setItem('selectedCharacterId', characterId);
      socketService.selectCharacter(characterId);
      return true;
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to select character');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const refreshCharacterData = async () => {
    if (!selectedCharacter) return;
    
    try {
      const response = await characterAPI.getCharacter(selectedCharacter._id);
      setSelectedCharacter(response.data.data);
    } catch (error) {
      console.error('Failed to refresh character data:', error);
    }
  };

  const sendChatMessage = (message, channel = 'global') => {
    if (selectedCharacter) {
      socketService.sendChatMessage(message, channel);
    }
  };

  const attackTarget = (targetId, targetType = 'monster') => {
    if (selectedCharacter) {
      socketService.attack(targetId, targetType);
    }
  };

  const useSkill = (skillId, targetId, targetType = 'monster') => {
    if (selectedCharacter) {
      socketService.useSkill(skillId, targetId, targetType);
    }
  };

  const startBattle = (dungeonId) => {
    if (selectedCharacter) {
      socketService.startBattle(dungeonId);
    }
  };

  const value = {
    selectedCharacter,
    characters,
    loading,
    error,
    onlinePlayers,
    chatMessages,
    battleState,
    fetchCharacters,
    createCharacter,
    selectCharacter,
    refreshCharacterData,
    sendChatMessage,
    attackTarget,
    useSkill,
    startBattle,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};