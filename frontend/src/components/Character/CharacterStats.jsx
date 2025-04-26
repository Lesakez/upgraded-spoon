const CharacterStats = ({ character }) => {
    const healthPercentage = (character.health.current / character.health.max) * 100;
    const manaPercentage = (character.mana.current / character.mana.max) * 100;
    const expPercentage = (character.experience / (100 * Math.pow(1.5, character.level - 1))) * 100;
  
    return (
      <div className="game-panel p-4">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-game-gold mb-2">{character.name}</h2>
          <p className="text-sm text-gray-400">
            Level {character.level} {character.class}
          </p>
        </div>
  
        {/* Health Bar */}
        <div className="mb-3">
          <div className="flex justify-between text-sm mb-1">
            <span>Health</span>
            <span>{character.health.current}/{character.health.max}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-4">
            <div
              className="bg-red-600 h-4 rounded-full transition-all duration-300"
              style={{ width: `${healthPercentage}%` }}
            />
          </div>
        </div>
  
        {/* Mana Bar */}
        <div className="mb-3">
          <div className="flex justify-between text-sm mb-1">
            <span>Mana</span>
            <span>{character.mana.current}/{character.mana.max}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-4">
            <div
              className="bg-blue-600 h-4 rounded-full transition-all duration-300"
              style={{ width: `${manaPercentage}%` }}
            />
          </div>
        </div>
  
        {/* Experience Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Experience</span>
            <span>{character.experience} XP</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${expPercentage}%` }}
            />
          </div>
        </div>
  
        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-400">STR:</span>
            <span className="ml-2">{character.stats.strength}</span>
          </div>
          <div>
            <span className="text-gray-400">INT:</span>
            <span className="ml-2">{character.stats.intelligence}</span>
          </div>
          <div>
            <span className="text-gray-400">DEX:</span>
            <span className="ml-2">{character.stats.dexterity}</span>
          </div>
          <div>
            <span className="text-gray-400">VIT:</span>
            <span className="ml-2">{character.stats.vitality}</span>
          </div>
        </div>
      </div>
    );
  };
  
  export default CharacterStats;