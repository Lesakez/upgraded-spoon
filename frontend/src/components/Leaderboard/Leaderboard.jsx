import { useState, useEffect } from 'react';
import { useGame } from '../../contexts/GameContext';
import { leaderboardAPI, pvpAPI } from '../../services/api';

const Leaderboard = () => {
  const { selectedCharacter } = useGame();
  const [activeTab, setActiveTab] = useState('level');
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [characterRank, setCharacterRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeaderboardData();
  }, [activeTab]);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      let response;
      
      if (activeTab === 'pvp') {
        response = await pvpAPI.getPvPLeaderboard();
      } else {
        response = await leaderboardAPI.getLeaderboard(activeTab);
      }
      
      setLeaderboardData(response.data.data);
      
      // Get character's rank
      const rankResponse = await leaderboardAPI.getCharacterRank(activeTab, selectedCharacter._id);
      setCharacterRank(rankResponse.data.data);
    } catch (error) {
      setError('Failed to fetch leaderboard data');
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getClassIcon = (className) => {
    switch (className) {
      case 'warrior': return '⚔️';
      case 'mage': return '🔮';
      case 'rogue': return '🗡️';
      case 'healer': return '✨';
      default: return '👤';
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return 'text-yellow-400'; // Gold
      case 2: return 'text-gray-400'; // Silver
      case 3: return 'text-orange-700'; // Bronze
      default: return 'text-white';
    }
  };

  if (loading) {
    return <div className="game-panel p-4">Loading leaderboard...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Leaderboard Header */}
      <div className="game-panel p-4">
        <h2 className="text-2xl font-bold text-game-gold mb-2">Leaderboard</h2>
        <p className="text-gray-400">See how you rank against other players</p>
      </div>

      {error && (
        <div className="bg-red-600 text-white p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="game-panel p-4">
        <div className="flex gap-4 mb-6 overflow-x-auto">
          {[
            { id: 'level', label: 'Level Rankings' },
            { id: 'gold', label: 'Wealth Rankings' },
            { id: 'pvp', label: 'PvP Rankings' },
            { id: 'dungeons', label: 'Dungeon Clears' },
            { id: 'quests', label: 'Quests Completed' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded whitespace-nowrap ${
                activeTab === tab.id ? 'bg-game-accent' : 'bg-game-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Rankings List */}
        {leaderboardData && (
          <div className="space-y-3">
            {(activeTab === 'pvp' ? leaderboardData : leaderboardData.entries).map((entry, index) => {
              const player = activeTab === 'pvp' ? entry : entry.character;
              const rank = activeTab === 'pvp' ? index + 1 : entry.rank;
              
              return (
                <div
                  key={player._id}
                  className={`bg-game-primary p-4 rounded-lg flex items-center justify-between ${
                    player._id === selectedCharacter._id ? 'ring-2 ring-game-accent' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`text-2xl font-bold ${getRankColor(rank)}`}>
                      #{rank}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getClassIcon(player.class)}</span>
                      <div>
                        <p className="font-bold">{player.name}</p>
                        <p className="text-sm text-gray-400 capitalize">{player.class}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {activeTab === 'level' && (
                      <p className="font-bold">Level {entry.value}</p>
                    )}
                    {activeTab === 'gold' && (
                      <p className="font-bold text-yellow-400">{entry.value.toLocaleString()} 🪙</p>
                    )}
                    {activeTab === 'pvp' && (
                      <div>
                        <p className="font-bold text-game-gold">Rating: {player.pvpStats.rating}</p>
                        <p className="text-sm text-green-400">{player.pvpStats.wins} Wins</p>
                        <p className="text-sm text-red-400">{player.pvpStats.losses} Losses</p>
                      </div>
                    )}
                    {activeTab === 'dungeons' && (
                      <p className="font-bold">{entry.value} Cleared</p>
                    )}
                    {activeTab === 'quests' && (
                      <p className="font-bold">{entry.value} Completed</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Your Rank */}
        {characterRank && !characterRank.inTopList && (
          <div className="mt-6 bg-game-secondary p-4 rounded-lg">
            <h3 className="font-bold mb-2">Your Ranking</h3>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold">{selectedCharacter.name}</p>
                <p className="text-sm text-gray-400 capitalize">{selectedCharacter.class}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">Rank #{characterRank.rank}</p>
                {activeTab === 'level' && (
                  <p>Level {characterRank.value}</p>
                )}
                {activeTab === 'gold' && (
                  <p className="text-yellow-400">{characterRank.value.toLocaleString()} 🪙</p>
                )}
                {activeTab === 'pvp' && (
                  <p>Rating: {characterRank.value}</p>
                )}
                {activeTab === 'dungeons' && (
                  <p>{characterRank.value} Cleared</p>
                )}
                {activeTab === 'quests' && (
                  <p>{characterRank.value} Completed</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;