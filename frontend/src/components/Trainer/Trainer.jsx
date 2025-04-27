import { useState, useEffect } from 'react';
import { useGame } from '../../contexts/GameContext';
import { trainingAPI } from '../../services/api';

const Trainer = () => {
  const { selectedCharacter } = useGame();
  const [trainers, setTrainers] = useState([]);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [learnableSkills, setLearnableSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTrainers();
    fetchLearnableSkills();
  }, []);

  useEffect(() => {
    if (selectedTrainer) {
      fetchTrainerSkills(selectedTrainer._id);
    }
  }, [selectedTrainer]);

  const fetchTrainers = async () => {
    try {
      setLoading(true);
      const response = await trainingAPI.getAllTrainers();
      setTrainers(response.data.data);
      if (response.data.data.length > 0) {
        setSelectedTrainer(response.data.data[0]);
      }
    } catch (error) {
      setError('Failed to fetch trainers');
      console.error('Error fetching trainers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrainerSkills = async (trainerId) => {
    try {
      const response = await trainingAPI.getAvailableSkills(trainerId);
      setAvailableSkills(response.data.data);
    } catch (error) {
      setError('Failed to fetch trainer skills');
      console.error('Error fetching trainer skills:', error);
    }
  };

  const fetchLearnableSkills = async () => {
    try {
      const response = await trainingAPI.getLearnableSkills(selectedCharacter._id);
      setLearnableSkills(response.data.data);
    } catch (error) {
      setError('Failed to fetch learnable skills');
      console.error('Error fetching learnable skills:', error);
    }
  };

  const handleLearnSkill = async (skillId) => {
    try {
      setError('');
      await trainingAPI.learnSkill(selectedTrainer._id, {
        characterId: selectedCharacter._id,
        skillId
      });
      
      // Refresh data
      window.location.reload();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to learn skill');
    }
  };

  const getSkillCategoryColor = (category) => {
    switch (category) {
      case 'combat': return 'text-red-400';
      case 'healing': return 'text-green-400';
      case 'buff': return 'text-blue-400';
      case 'debuff': return 'text-purple-400';
      case 'utility': return 'text-yellow-400';
      default: return 'text-white';
    }
  };

  if (loading) {
    return <div className="game-panel p-4">Loading trainers...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Trainer Header */}
      <div className="game-panel p-4">
        <h2 className="text-2xl font-bold text-game-gold mb-2">Skill Trainer</h2>
        <p className="text-gray-400">Learn new skills and abilities</p>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-yellow-400">🪙</span>
          <span>Your Gold: {selectedCharacter.gold}</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-600 text-white p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Trainer Selection */}
      <div className="game-panel p-4">
        <h3 className="text-lg font-bold mb-3">Select Trainer</h3>
        <div className="flex gap-2 overflow-x-auto">
          {trainers.map((trainer) => (
            <button
              key={trainer._id}
              onClick={() => setSelectedTrainer(trainer)}
              className={`px-4 py-2 rounded ${
                selectedTrainer?._id === trainer._id ? 'bg-game-accent' : 'bg-game-primary'
              }`}
            >
              {trainer.name}
            </button>
          ))}
        </div>
      </div>

      {/* Available Skills */}
      {selectedTrainer && availableSkills.length > 0 && (
        <div className="game-panel p-4">
          <h3 className="text-xl font-bold mb-4">Available Skills from {selectedTrainer.name}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableSkills.map((trainerSkill) => {
              const skill = trainerSkill.skill;
              const isLearnable = learnableSkills.some(s => s._id === skill._id);
              const isKnown = selectedCharacter.skills.some(s => s.skill._id === skill._id);
              const currentLevel = selectedCharacter.skills.find(s => s.skill._id === skill._id)?.level || 0;
              
              return (
                <div
                  key={skill._id}
                  className={`bg-game-primary p-4 rounded-lg ${
                    !isLearnable ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-game-gold">{skill.name}</h3>
                    <span className={`text-sm ${getSkillCategoryColor(skill.category)}`}>
                      {skill.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{skill.description}</p>
                  <div className="text-sm mb-3">
                    <p>Mana Cost: {skill.manaCost}</p>
                    <p>Cooldown: {skill.cooldown}s</p>
                    <p>Required Level: {skill.levelRequired}</p>
                    {isKnown && <p>Current Level: {currentLevel}/{trainerSkill.maxLevel}</p>}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-yellow-400">
                      {isKnown 
                        ? `${trainerSkill.price * (currentLevel + 1)} 🪙` 
                        : `${trainerSkill.price} 🪙`}
                    </span>
                    <button
                      onClick={() => handleLearnSkill(skill._id)}
                      className="game-button"
                      disabled={
                        !isLearnable || 
                        (selectedCharacter.gold < (isKnown ? trainerSkill.price * (currentLevel + 1) : trainerSkill.price)) ||
                        (isKnown && currentLevel >= trainerSkill.maxLevel)
                      }
                    >
                      {isKnown 
                        ? (currentLevel >= trainerSkill.maxLevel ? 'Max Level' : 'Level Up')
                        : 'Learn'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Known Skills */}
      <div className="game-panel p-4">
        <h3 className="text-xl font-bold mb-4">Your Skills</h3>
        {selectedCharacter.skills && selectedCharacter.skills.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedCharacter.skills.map((characterSkill) => {
              const skill = characterSkill.skill;
              
              return (
                <div key={skill._id} className="bg-game-primary p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-game-gold">{skill.name}</h3>
                    <span className={`text-sm ${getSkillCategoryColor(skill.category)}`}>
                      {skill.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{skill.description}</p>
                  <div className="text-sm">
                    <p>Level: {characterSkill.level}/{skill.maxLevel}</p>
                    <p>Mana Cost: {skill.manaCost}</p>
                    <p>Cooldown: {skill.cooldown}s</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-400">You haven't learned any skills yet.</p>
        )}
      </div>
    </div>
  );
};

export default Trainer;