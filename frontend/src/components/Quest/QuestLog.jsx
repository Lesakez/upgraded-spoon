import { useState, useEffect } from 'react';
import { useGame } from '../../contexts/GameContext';
import { questAPI } from '../../services/api';

const QuestLog = () => {
  const { selectedCharacter } = useGame();
  const [quests, setQuests] = useState([]);
  const [availableQuests, setAvailableQuests] = useState([]);
  const [activeTab, setActiveTab] = useState('active');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedCharacter) {
      fetchQuests();
    }
  }, [selectedCharacter]);

  const fetchQuests = async () => {
    try {
      const [availableResponse] = await Promise.all([
        questAPI.getAvailableQuests(selectedCharacter._id)
      ]);
      setAvailableQuests(availableResponse.data.data);
      setQuests(selectedCharacter.activeQuests || []);
    } catch (error) {
      console.error('Failed to fetch quests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptQuest = async (questId) => {
    try {
      await questAPI.acceptQuest(questId, { characterId: selectedCharacter._id });
      fetchQuests(); // Refresh quests
    } catch (error) {
      console.error('Failed to accept quest:', error);
    }
  };

  const handleAbandonQuest = async (questId) => {
    try {
      await questAPI.abandonQuest(questId, selectedCharacter._id);
      fetchQuests(); // Refresh quests
    } catch (error) {
      console.error('Failed to abandon quest:', error);
    }
  };

  if (loading) {
    return <div className="game-panel p-4">Loading quests...</div>;
  }

  return (
    <div className="game-panel p-4">
      <h2 className="text-xl font-bold text-game-gold mb-4">Quest Log</h2>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-3 py-1 rounded ${
            activeTab === 'active' ? 'bg-game-accent' : 'bg-game-primary'
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setActiveTab('available')}
          className={`px-3 py-1 rounded ${
            activeTab === 'available' ? 'bg-game-accent' : 'bg-game-primary'
          }`}
        >
          Available
        </button>
      </div>

      {/* Quest List */}
      <div className="space-y-3">
        {activeTab === 'active' && quests.map((quest) => (
          <div key={quest._id} className="bg-game-primary p-3 rounded">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-game-gold">{quest.quest.name}</h3>
              <button
                onClick={() => handleAbandonQuest(quest.quest._id)}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Abandon
              </button>
            </div>
            <p className="text-sm text-gray-300 mb-2">{quest.quest.description}</p>
            <div className="text-sm">
              {quest.quest.objectives.map((objective, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className={`${
                    (quest.progress?.[objective.target] || 0) >= objective.quantity
                      ? 'text-green-400'
                      : 'text-gray-400'
                  }`}>
                    [{quest.progress?.[objective.target] || 0}/{objective.quantity}]
                  </span>
                  <span>{objective.description}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 text-xs text-gray-400">
              Rewards: {quest.quest.rewards.experience} XP, {quest.quest.rewards.gold} Gold
            </div>
          </div>
        ))}

        {activeTab === 'available' && availableQuests.map((quest) => (
          <div key={quest._id} className="bg-game-primary p-3 rounded">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-game-gold">{quest.name}</h3>
              <span className="text-xs text-gray-400">Lvl {quest.requirements.level}</span>
            </div>
            <p className="text-sm text-gray-300 mb-2">{quest.description}</p>
            <div className="text-sm mb-2">
              Rewards: {quest.rewards.experience} XP, {quest.rewards.gold} Gold
            </div>
            <button
              onClick={() => handleAcceptQuest(quest._id)}
              className="game-button text-sm w-full"
            >
              Accept Quest
            </button>
          </div>
        ))}

        {((activeTab === 'active' && quests.length === 0) ||
          (activeTab === 'available' && availableQuests.length === 0)) && (
          <div className="text-center text-gray-400 mt-4">
            No {activeTab} quests
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestLog;