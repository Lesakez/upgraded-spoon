import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import CharacterInfo from '../components/Character/CharacterInfo';
import BattleArena from '../components/Battle/BattleArena';
import Tavern from '../components/Tavern/Tavern';
import Shop from '../components/Shop/Shop';
import Inventory from '../components/Inventory/Inventory';
import QuestLog from '../components/Quest/QuestLog';
import Chat from '../components/Chat/Chat';

const Game = () => {
  const { selectedCharacter, loading } = useGame();
  const [activeTab, setActiveTab] = useState('arena');
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

  const renderContent = () => {
    switch (activeTab) {
      case 'arena':
        return <BattleArena />;
      case 'tavern':
        return <Tavern />;
      case 'shop':
        return <Shop />;
      case 'inventory':
        return <Inventory />;
      case 'quests':
        return <QuestLog />;
      default:
        return <BattleArena />;
    }
  };

  return (
    <div className="min-h-screen bg-game-gradient">
      {/* Header */}
      <div className="bg-game-secondary border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-game-gold">Fantasy MMO</h1>
            <button
              onClick={() => navigate('/characters')}
              className="text-sm text-gray-400 hover:text-white"
            >
              Change Character
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Left Column */}
          <div className="w-64 space-y-4">
            <CharacterInfo character={selectedCharacter} />
            
            {/* Navigation Menu */}
            <div className="game-panel p-4">
              <nav className="space-y-2">
                {[
                  { id: 'arena', label: 'Battle Arena', icon: '⚔️' },
                  { id: 'tavern', label: 'Tavern', icon: '🍺' },
                  { id: 'shop', label: 'Shop', icon: '🏪' },
                  { id: 'inventory', label: 'Inventory', icon: '🎒' },
                  { id: 'quests', label: 'Quests', icon: '📜' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded text-left ${
                      activeTab === item.id
                        ? 'bg-game-accent text-white'
                        : 'hover:bg-game-primary'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {renderContent()}
          </div>

          {/* Right Column */}
          <div className="w-80">
            <Chat />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;