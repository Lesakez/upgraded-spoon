import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [characterName, setCharacterName] = useState('');
  const [characterClass, setCharacterClass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!characterName.trim()) {
      setError('Character name is required');
      return;
    }

    if (!characterClass) {
      setError('Please select a character class');
      return;
    }

    setLoading(true);
    const success = await register({ 
      username, 
      email, 
      password,
      characterName: characterName.trim(),
      characterClass 
    });
    
    if (success) {
      navigate('/game');
    } else {
      setError('Registration failed. Username/email/character name may already exist.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-game-gradient">
      <div className="game-panel p-8 max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-center mb-8 text-game-gold">
          Create Account
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Account Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-game-gold border-b border-gray-700 pb-2">
              Account Information
            </h2>
            
            <div>
              <label className="block text-sm font-medium mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="game-input w-full"
                placeholder="Choose a username"
                required
                minLength={3}
                maxLength={20}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="game-input w-full"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="game-input w-full"
                placeholder="Choose a password"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="game-input w-full"
                placeholder="Confirm your password"
                required
                minLength={6}
              />
            </div>
          </div>

          {/* Character Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-game-gold border-b border-gray-700 pb-2">
              Character Information
            </h2>
            
            <div>
              <label className="block text-sm font-medium mb-2">Character Name</label>
              <input
                type="text"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                className="game-input w-full"
                placeholder="Enter character name"
                minLength={3}
                maxLength={20}
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                3-20 characters, must be unique
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-4">Choose Your Class</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CLASSES.map((classOption) => (
                  <div
                    key={classOption.name}
                    className={`game-panel p-4 cursor-pointer transition-all ${
                      characterClass === classOption.name
                        ? 'border-game-accent border-2'
                        : 'hover:border-game-accent'
                    }`}
                    onClick={() => setCharacterClass(classOption.name)}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{classOption.icon}</span>
                      <h3 className="text-lg font-bold capitalize text-game-gold">
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
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="game-button w-full disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account & Character'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-game-accent hover:text-indigo-400">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;