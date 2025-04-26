import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import CharacterStats from '../components/Character/CharacterStats';
import Inventory from '../components/Inventory/Inventory';
import QuestLog from '../components/Quest/QuestLog';
import Chat from '../components/Chat/Chat';
import GameMap from '../components/Map/GameMap';

const Game = () => {
  const { selectedCharacter, loading } = useGame();
  const navigate = useNavigate();

  useEffect(() => {
    if (!selectedCharacter && !loading) {
      navigate('/characters');
    }
  }, [selectedCharacter, loading, navigate]);

  if (loading || !selectedCharacter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-game-gradient">
        <div className="text-2xl text-game-gold">Loading game...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-game-gradient">
      <div className="flex h-screen">
        {/* Left Sidebar */}
        <div className="w-64 bg-game-secondary p-4 flex flex-col gap-4">
          <CharacterStats character={selectedCharacter} />
          <QuestLog />
        </div>

        {/* Main Game Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 relative">
            <GameMap />
          </div>
          
          {/* Bottom UI */}
          <div className="h-64 bg-game-secondary p-4">
            <Chat />
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 bg-game-secondary p-4">
          <Inventory />
        </div>
      </div>
    </div>
  );
};

export default Game;