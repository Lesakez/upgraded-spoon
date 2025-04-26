const CharacterInfo = ({ character }) => {
    const healthPercentage = (character.health.current / character.health.max) * 100;
    const manaPercentage = (character.mana.current / character.mana.max) * 100;
    const expPercentage = (character.experience / (100 * Math.pow(1.5, character.level - 1))) * 100;
  
    return (
      <div className="game-panel p-4">
        {/* Character Avatar */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-game-primary rounded-full flex items-center justify-center">
            <span className="text-3xl">
              {character.class === 'warrior' ? '⚔️' :
               character.class === 'mage' ? '🔮' :
               character.class === 'rogue' ? '🗡️' :
               character.class === 'healer' ? '✨' : '👤'}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-game-gold">{character.name}</h2>
            <p className="text-sm text-gray-400">
              Level {character.level} {character.class}
            </p>
          </div>
        </div>
  
        {/* Health Bar */}
        <div className="mb-3">
          <div className="flex justify-between text-sm mb-1">
            <span>Health</span>
            <span>{character.health.current}/{character.health.max}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div
              className="bg-red-600 h-3 rounded-full transition-all duration-300"
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
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${manaPercentage}%` }}
            />
          </div>
        </div>
  
        {/* Experience Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Experience</span>
            <span>{expPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${expPercentage}%` }}
            />
          </div>
        </div>
  
        {/* Gold */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-yellow-400">🪙</span>
          <span>{character.gold} Gold</span>
        </div>
  
        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-game-primary p-2 rounded">
            <span className="text-gray-400">STR</span>
            <span className="float-right text-game-gold">{character.stats.strength}</span>
          </div>
          <div className="bg-game-primary p-2 rounded">
            <span className="text-gray-400">INT</span>
            <span className="float-right text-game-gold">{character.stats.intelligence}</span>
          </div>
          <div className="bg-game-primary p-2 rounded">
            <span className="text-gray-400">DEX</span>
            <span className="float-right text-game-gold">{character.stats.dexterity}</span>
          </div>
          <div className="bg-game-primary p-2 rounded">
            <span className="text-gray-400">VIT</span>
            <span className="float-right text-game-gold">{character.stats.vitality}</span>
          </div>
        </div>
      </div>
    );
  };
  
  export default CharacterInfo;