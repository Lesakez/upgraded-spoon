import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';

const CLASSES = [
  { 
    name: 'warrior', 
    description: 'Masters of melee combat with high strength and defense.',
    icon: '⚔️'
  },
  { 
    name: 'mage', 
    description: 'Wielders of powerful magic with high intelligence.',
    icon: '🔮'
  },
  { 
    name: 'rogue', 
    description: 'Agile fighters specializing in stealth and critical hits.',
    icon: '🗡️'
  },
  { 
    name: 'healer', 
    description: 'Support class with healing abilities and buffs.',
    icon: '✨'
  },
];

const CharacterCreation = () => {
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { createCharacter } = useGame();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Character name is required');
      return;
    }

    if (!selectedClass) {
      setError('Please select a class');
      return;
    }

    setLoading(true);
    const success = await createCharacter({ name: name.trim(), class: selectedClass });
    
    if (success) {
      navigate('/characters');
    } else {
      setError('Failed to create character. Name might be taken.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-game-gradient p-8">
      <div className="max-w-4xl mx-auto">
        <div className="game-panel p-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-game-gold">
            Create Your Character
          </h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-lg font-medium mb-2">Character Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="game-input w-full text-lg"
                placeholder="Enter character name"
                minLength={3}
                maxLength={20}
                required
              />
              <p className="text-sm text-gray-400 mt-1">
                3-20 characters, must be unique
              </p>
            </div>

            <div>
              <label className="block text-lg font-medium mb-4">Choose Your Class</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CLASSES.map((classOption) => (
                  <div
                    key={classOption.name}
                    className={`game-panel p-4 cursor-pointer transition-all ${
                      selectedClass === classOption.name
                        ? 'border-game-accent border-2'
                        : 'hover:border-game-accent'
                    }`}
                    onClick={() => setSelectedClass(classOption.name)}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{classOption.icon}</span>
                      <h3 className="text-xl font-bold capitalize text-game-gold">
                        {classOption.name}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-300">
                      {classOption.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-600 text-white p-4 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => navigate('/characters')}
                className="game-button bg-gray-600 hover:bg-gray-700"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || !name || !selectedClass}
                className="game-button disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Character'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CharacterCreation;