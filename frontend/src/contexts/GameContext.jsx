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

  useEffect(() => {
    // Socket event listeners
    socketService.on('CHARACTER_STATUS', handleCharacterStatus);
    socketService.on('CHAT_MESSAGE', handleChatMessage);
    socketService.on('CHARACTER_MOVEMENT', handleCharacterMovement);
    socketService.on('COMBAT_RESULT', handleCombatResult);

    return () => {
      socketService.off('CHARACTER_STATUS');
      socketService.off('CHAT_MESSAGE');
      socketService.off('CHARACTER_MOVEMENT');
      socketService.off('COMBAT_RESULT');
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

  const handleCharacterMovement = (data) => {
    // Update character position on the map
    // This would be implemented with your game map system
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

  const fetchCharacters = async () => {
    try {
      setLoading(true);
      const response = await characterAPI.getCharacters();
      setCharacters(response.data.data);
      setError(null);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to fetch characters');
    } finally {
      setLoading(false);
    }
  };

  const createCharacter = async (characterData) => {
    try {
      setLoading(true);
      const response = await characterAPI.createCharacter(characterData);
      setCharacters(prev => [...prev, response.data.data]);
      setError(null);
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
      const response = await characterAPI.getCharacter(characterId);
      setSelectedCharacter(response.data.data);
      socketService.selectCharacter(characterId);
      setError(null);
      return true;
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to select character');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const sendChatMessage = (message, channel = 'global') => {
    if (selectedCharacter) {
      socketService.sendChatMessage(message, channel);
    }
  };

  const moveCharacter = (x, y, direction) => {
    if (selectedCharacter) {
      socketService.moveCharacter(x, y, direction);
    }
  };

  const attackTarget = (targetId, targetType = 'monster') => {
    if (selectedCharacter) {
      socketService.attack(targetId, targetType);
    }
  };

  const value = {
    selectedCharacter,
    characters,
    loading,
    error,
    onlinePlayers,
    chatMessages,
    fetchCharacters,
    createCharacter,
    selectCharacter,
    sendChatMessage,
    moveCharacter,
    attackTarget,
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