import { useState, useEffect } from 'react';
import { useGame } from '../../contexts/GameContext';

const Tavern = () => {
  const { selectedCharacter, onlinePlayers } = useGame();
  const [rumors, setRumors] = useState([
    { text: "I heard there's a powerful artifact hidden in the Forest Dungeon...", time: '5 min ago' },
    { text: "The Goblin King has been spotted near the abandoned mines!", time: '15 min ago' },
    { text: "Looking for brave adventurers to clear the Dark Cave.", time: '30 min ago' },
  ]);

  return (
    <div className="space-y-4">
      {/* Tavern Header */}
      <div className="game-panel p-4">
        <h2 className="text-2xl font-bold text-game-gold mb-2">The Rusty Dragon Tavern</h2>
        <p className="text-gray-400">A place to rest, chat, and hear the latest rumors</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Rumors & News */}
        <div className="game-panel p-4">
          <h3 className="text-xl font-bold mb-4">Latest Rumors</h3>
          <div className="space-y-3">
            {rumors.map((rumor, index) => (
              <div key={index} className="bg-game-primary p-3 rounded">
                <p className="text-sm">{rumor.text}</p>
                <p className="text-xs text-gray-400 mt-1">{rumor.time}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Online Players */}
        <div className="game-panel p-4">
          <h3 className="text-xl font-bold mb-4">Adventurers in Tavern</h3>
          <div className="space-y-2">
            {onlinePlayers.slice(0, 5).map((playerId, index) => (
              <div key={index} className="flex items-center gap-3 bg-game-primary p-3 rounded">
                <div className="w-10 h-10 bg-game-secondary rounded-full flex items-center justify-center">
                  <span className="text-xl">👤</span>
                </div>
                <div>
                  <p className="font-bold">Adventurer #{index + 1}</p>
                  <p className="text-sm text-gray-400">Level ?</p>
                </div>
              </div>
            ))}
            {onlinePlayers.length === 0 && (
              <p className="text-gray-400 text-center py-4">No other adventurers present</p>
            )}
          </div>
        </div>
      </div>

      {/* Tavern Services */}
      <div className="game-panel p-6">
        <h3 className="text-xl font-bold mb-4">Tavern Services</h3>
        <div className="grid grid-cols-3 gap-4">
          <button className="bg-game-primary p-4 rounded text-center hover:bg-game-accent transition-colors">
            <span className="text-3xl mb-2 block">🍺</span>
            <p className="font-bold">Buy Drinks</p>
            <p className="text-sm text-gray-400">Restore Health</p>
            <p className="text-sm text-game-gold mt-2">10 Gold</p>
          </button>
          <button className="bg-game-primary p-4 rounded text-center hover:bg-game-accent transition-colors">
            <span className="text-3xl mb-2 block">🛏️</span>
            <p className="font-bold">Rest</p>
            <p className="text-sm text-gray-400">Restore HP & MP</p>
            <p className="text-sm text-game-gold mt-2">50 Gold</p>
          </button>
          <button className="bg-game-primary p-4 rounded text-center hover:bg-game-accent transition-colors">
            <span className="text-3xl mb-2 block">🎲</span>
            <p className="font-bold">Gamble</p>
            <p className="text-sm text-gray-400">Try your luck</p>
            <p className="text-sm text-game-gold mt-2">Varies</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Tavern;