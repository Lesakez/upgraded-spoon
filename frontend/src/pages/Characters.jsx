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

  // Auto-select character if there's only one
  useEffect(() => {
    if (!loading && characters.length === 1 && selectCharacter) {
      handleSelectCharacter(characters[0]._id);
    }
  }, [loading, characters, selectCharacter]);

  const handleSelectCharacter = async (characterId) => {
    if (selectCharacter) {
      const success = await selectCharacter(characterId);
      if (success) {
        navigate('/game');
      }
    }
  };

  if (loading && characters.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-game-gradient">
        <div className="text-2xl text-game-gold">Loading characters...</div>
      </div>
    );
  }

  // If user has no characters (edge case), redirect to character creation
  if (!loading && characters.length === 0) {
    return (
      <div className="min-h-screen bg-game-gradient p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mt-8">
            <p className="text-gray-400 mb-4">You don't have any characters yet.</p>
            <p className="text-red-500 mb-4">This shouldn't happen. Please contact support.</p>
            <button onClick={logout} className="game-button">
              Logout and Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If only one character, auto-selecting will handle it
  if (characters.length === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-game-gradient">
        <div className="text-2xl text-game-gold">Loading game...</div>
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
        </div>
      </div>
    </div>
  );
};

export default Characters;