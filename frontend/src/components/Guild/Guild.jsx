import { useState, useEffect } from 'react';
import { useGame } from '../../contexts/GameContext';
import { guildAPI } from '../../services/api';

const Guild = () => {
  const { selectedCharacter } = useGame();
  const [guild, setGuild] = useState(null);
  const [availableGuilds, setAvailableGuilds] = useState([]);
  const [createGuildModal, setCreateGuildModal] = useState(false);
  const [newGuildName, setNewGuildName] = useState('');
  const [newGuildDescription, setNewGuildDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedCharacter) {
      fetchGuildData();
    }
  }, [selectedCharacter]);

  const fetchGuildData = async () => {
    try {
      setLoading(true);
      const guildsResponse = await guildAPI.getGuilds();
      setAvailableGuilds(guildsResponse.data.data);
      
      if (selectedCharacter.guildId) {
        const guildResponse = await guildAPI.getGuild(selectedCharacter.guildId);
        setGuild(guildResponse.data.data);
      }
    } catch (error) {
      setError('Failed to fetch guild data');
      console.error('Error fetching guild data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGuild = async () => {
    try {
      setError('');
      const response = await guildAPI.createGuild({
        name: newGuildName,
        description: newGuildDescription,
        characterId: selectedCharacter._id
      });
      
      setGuild(response.data.data);
      setCreateGuildModal(false);
      setNewGuildName('');
      setNewGuildDescription('');
      fetchGuildData();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create guild');
    }
  };

  const handleJoinGuild = async (guildId) => {
    try {
      setError('');
      await guildAPI.applyToGuild(guildId, {
        characterId: selectedCharacter._id,
        message: 'I would like to join your guild!'
      });
      
      fetchGuildData();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to apply to guild');
    }
  };

  const handleLeaveGuild = async () => {
    try {
      setError('');
      await guildAPI.leaveGuild(guild._id, {
        characterId: selectedCharacter._id
      });
      
      setGuild(null);
      fetchGuildData();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to leave guild');
    }
  };

  if (loading) {
    return <div className="game-panel p-4">Loading guild data...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Guild Header */}
      <div className="game-panel p-4">
        <h2 className="text-2xl font-bold text-game-gold mb-2">Guild Hall</h2>
        <p className="text-gray-400">Join forces with other players</p>
      </div>

      {error && (
        <div className="bg-red-600 text-white p-4 rounded-lg">
          {error}
        </div>
      )}

      {!guild ? (
        <>
          {/* Create Guild */}
          <div className="game-panel p-4">
            <h3 className="text-xl font-bold mb-4">Create a Guild</h3>
            <p className="text-gray-400 mb-4">
              Found your own guild and recruit members. Costs 1000 gold.
            </p>
            <button
              onClick={() => setCreateGuildModal(true)}
              className="game-button"
              disabled={selectedCharacter.gold < 1000}
            >
              {selectedCharacter.gold < 1000 ? 'Not enough gold' : 'Create Guild'}
            </button>
          </div>

          {/* Available Guilds */}
          <div className="game-panel p-4">
            <h3 className="text-xl font-bold mb-4">Available Guilds</h3>
            <div className="grid grid-cols-1 gap-4">
              {availableGuilds.map((g) => (
                <div key={g._id} className="bg-game-primary p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-game-gold">{g.name}</h4>
                      <p className="text-sm text-gray-400">Leader: {g.leader.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">Level {g.level}</p>
                      <p className="text-sm text-gray-400">{g.members.length}/50 members</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 mb-3">{g.description}</p>
                  <button
                    onClick={() => handleJoinGuild(g._id)}
                    className="game-button text-sm w-full"
                    disabled={g.members.length >= 50}
                  >
                    {g.members.length >= 50 ? 'Guild Full' : 'Apply to Join'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Guild Info */}
          <div className="game-panel p-4">
            <h3 className="text-xl font-bold mb-4">{guild.name}</h3>
            <p className="text-gray-300 mb-4">{guild.description}</p>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-400">Leader</p>
                <p className="font-bold">{guild.leader.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Members</p>
                <p className="font-bold">{guild.members.length}/50</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Level</p>
                <p className="font-bold">{guild.level}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Gold</p>
                <p className="font-bold text-yellow-400">{guild.gold || 0} 🪙</p>
              </div>
            </div>
            {guild.leader._id !== selectedCharacter._id && (
              <button 
                onClick={handleLeaveGuild}
                className="game-button bg-red-600 hover:bg-red-700"
              >
                Leave Guild
              </button>
            )}
          </div>

          {/* Guild Members */}
          <div className="game-panel p-4">
            <h3 className="text-xl font-bold mb-4">Members</h3>
            <div className="space-y-2">
              {guild.members.map((member) => (
                <div 
                  key={member.character._id} 
                  className="flex items-center justify-between bg-game-primary p-3 rounded"
                >
                  <div>
                    <p className="font-bold">{member.character.name}</p>
                    <p className="text-sm text-gray-400">
                      Level {member.character.level} {member.character.class}
                    </p>
                  </div>
                  <div className="text-sm text-game-gold capitalize">
                    {member.role}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Create Guild Modal */}
      {createGuildModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="game-panel p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-game-gold mb-4">Create Guild</h3>
            <input
              type="text"
              value={newGuildName}
              onChange={(e) => setNewGuildName(e.target.value)}
              placeholder="Enter guild name"
              className="game-input w-full mb-4"
              maxLength={30}
            />
            <textarea
              value={newGuildDescription}
              onChange={(e) => setNewGuildDescription(e.target.value)}
              placeholder="Enter guild description"
              className="game-input w-full mb-4 h-24"
              maxLength={200}
            />
            <p className="text-sm text-gray-400 mb-4">
              Cost: 1000 gold
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleCreateGuild}
                className="game-button flex-1"
              >
                Create
              </button>
              <button
                onClick={() => setCreateGuildModal(false)}
                className="game-button bg-gray-600 hover:bg-gray-700 flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Guild;