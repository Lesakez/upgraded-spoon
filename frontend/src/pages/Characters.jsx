import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import { useAuth } from '../contexts/AuthContext';

const Characters = () => {
  const { characters, loading, error, fetchCharacters, selectCharacter } = useGame();
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCharacters();
  }, []);

  const handleSelectCharacter = async (characterId) => {
    const success = await selectCharacter(characterId);
    if (success) {
      navigate('/game');
    }
  };

  const handleCreateCharacter = () => {
    navigate('/character-creation');
  };

  if (loading && characters.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-game-gradient">
        <div className="text-2xl text-game-gold">Loading characters...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-game-gradient p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-game-gold">Your Characters</h1>
          <button
            onClick={logout}
            className="game-button bg-red-600 hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        {error && (
          <div className="bg-red-600 text-white p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map((character) => (
            <div
              key={character._id}
              className="game-panel p-6 cursor-pointer hover:border-game-accent transition-colors"
              onClick={() => handleSelectCharacter(character._id)}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-game-gold">
                  {character.name}
                </h2>
                <span className="text-sm text-gray-400">
                  Level {character.level}
                </span>
              </div>
              
              <div className="mb-4">
                <span className="text-sm text-gray-400">Class:</span>
                <span className="ml-2 capitalize">{character.class}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-400">Health:</span>
                  <span className="ml-2">
                    {character.health.current}/{character.health.max}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Mana:</span>
                  <span className="ml-2">
                    {character.mana.current}/{character.mana.max}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <button
                  className="game-button text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectCharacter(character._id);
                  }}
                >
                  Play
                </button>
              </div>
            </div>
          ))}
          
          {/* Create New Character Card */}
          <div
            className="game-panel p-6 cursor-pointer hover:border-game-accent transition-colors flex flex-col items-center justify-center min-h-[200px]"
            onClick={handleCreateCharacter}
          >
            <div className="text-4xl mb-4">+</div>
            <div className="text-xl font-bold text-game-gold">
              Create New Character
            </div>
          </div>
        </div>

        {characters.length === 0 && !loading && (
          <div className="text-center mt-8">
            <p className="text-gray-400 mb-4">You don't have any characters yet.</p>
            <button onClick={handleCreateCharacter} className="game-button">
              Create Your First Character
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Characters;