import { useState, useEffect } from 'react';
import { useGame } from '../../contexts/GameContext';
import { dungeonAPI, pvpAPI } from '../../services/api';

const BattleArena = () => {
  const { selectedCharacter, attackTarget } = useGame();
  const [battleMode, setBattleMode] = useState('pve'); // pve or pvp
  const [battleState, setBattleState] = useState('idle'); // idle, searching, battling
  const [opponent, setOpponent] = useState(null);
  const [battleLog, setBattleLog] = useState([]);
  const [availableDungeons, setAvailableDungeons] = useState([]);
  const [selectedDungeon, setSelectedDungeon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDungeons();
  }, []);

  const fetchDungeons = async () => {
    try {
      setLoading(true);
      const response = await dungeonAPI.getDungeons();
      setAvailableDungeons(response.data.data);
    } catch (error) {
      setError('Failed to fetch dungeons');
      console.error('Error fetching dungeons:', error);
    } finally {
      setLoading(false);
    }
  };

  const startPvEBattle = async (dungeon) => {
    try {
      setError('');
      setSelectedDungeon(dungeon);
      setBattleState('searching');
      
      const response = await dungeonAPI.enterDungeon(dungeon._id, selectedCharacter._id);
      
      // Simulate finding a monster in the dungeon
      setTimeout(() => {
        setOpponent({
          name: 'Dungeon Monster',
          level: dungeon.requirements.minLevel,
          health: { current: 100, max: 100 },
          type: 'monster'
        });
        setBattleState('battling');
        setBattleLog(['Battle started!']);
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to enter dungeon');
      setBattleState('idle');
    }
  };

  const startPvPBattle = async () => {
    try {
      setError('');
      setBattleState('searching');
      
      const response = await pvpAPI.joinQueue({
        characterId: selectedCharacter._id,
        matchType: 'ranked'
      });
      
      if (response.data.data.status === 'matched') {
        setBattleState('battling');
        setBattleLog(response.data.data.battle.logs || ['Battle started!']);
        // Handle PvP battle result
      } else {
        setBattleLog(['Searching for opponent...']);
        // In a real implementation, you'd need WebSocket to get match updates
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to join PvP queue');
      setBattleState('idle');
    }
  };

  const performAttack = () => {
    if (!opponent) return;
    
    // Simulate attack
    const damage = Math.floor(Math.random() * 20) + 10;
    const newHealth = Math.max(0, opponent.health.current - damage);
    
    setOpponent(prev => ({
      ...prev,
      health: { ...prev.health, current: newHealth }
    }));
    
    setBattleLog(prev => [...prev, `You dealt ${damage} damage!`]);
    
    // Check if opponent defeated
    if (newHealth <= 0) {
      setBattleLog(prev => [...prev, 'Victory! You gained experience and loot.']);
      setBattleState('idle');
      setOpponent(null);
      
      // In a real implementation, you'd call completeDungeon API
    } else {
      // Opponent counter-attack
      setTimeout(() => {
        const opponentDamage = Math.floor(Math.random() * 15) + 5;
        setBattleLog(prev => [...prev, `${opponent.name} dealt ${opponentDamage} damage!`]);
        
        // In a real implementation, you'd update character health
      }, 1000);
    }
  };

  const fleeBattle = async () => {
    setBattleState('idle');
    setOpponent(null);
    setBattleLog([]);
    
    if (battleMode === 'pve' && selectedDungeon) {
      try {
        await dungeonAPI.leaveDungeon(selectedDungeon._id, {
          characterId: selectedCharacter._id,
          instanceId: 'current' // You'd need to track instance ID
        });
      } catch (error) {
        console.error('Failed to leave dungeon:', error);
      }
    } else if (battleMode === 'pvp') {
      try {
        await pvpAPI.leaveQueue({ characterId: selectedCharacter._id });
      } catch (error) {
        console.error('Failed to leave PvP queue:', error);
      }
    }
  };

  if (loading) {
    return <div className="game-panel p-4">Loading battle arena...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Battle Arena Header */}
      <div className="game-panel p-4">
        <h2 className="text-2xl font-bold text-game-gold mb-2">Battle Arena</h2>
        <p className="text-gray-400">Test your strength against monsters and other players</p>
      </div>

      {error && (
        <div className="bg-red-600 text-white p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Battle Mode Selection */}
      {battleState === 'idle' && (
        <div className="game-panel p-4">
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setBattleMode('pve')}
              className={`px-4 py-2 rounded ${
                battleMode === 'pve' ? 'bg-game-accent' : 'bg-game-primary'
              }`}
            >
              PvE (Dungeons)
            </button>
            <button
              onClick={() => setBattleMode('pvp')}
              className={`px-4 py-2 rounded ${
                battleMode === 'pvp' ? 'bg-game-accent' : 'bg-game-primary'
              }`}
            >
              PvP (Arena)
            </button>
          </div>
        </div>
      )}

      {/* PvE Dungeon Selection */}
      {battleState === 'idle' && battleMode === 'pve' && (
        <div className="game-panel p-6">
          <h3 className="text-xl font-bold mb-4">Available Dungeons</h3>
          <div className="grid grid-cols-1 gap-4">
            {availableDungeons.map((dungeon) => (
              <div 
                key={dungeon._id}
                className="bg-game-primary p-4 rounded-lg flex justify-between items-center"
              >
                <div>
                  <h4 className="font-bold">{dungeon.name}</h4>
                  <p className="text-sm text-gray-400">
                    Level {dungeon.requirements.minLevel}-{dungeon.requirements.maxLevel}
                  </p>
                  <p className="text-sm text-gray-300">{dungeon.description}</p>
                </div>
                <button
                  onClick={() => startPvEBattle(dungeon)}
                  className="game-button"
                  disabled={selectedCharacter.level < dungeon.requirements.minLevel}
                >
                  Enter Dungeon
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PvP Queue */}
      {battleState === 'idle' && battleMode === 'pvp' && (
        <div className="game-panel p-6">
          <h3 className="text-xl font-bold mb-4">PvP Arena</h3>
          <p className="text-gray-400 mb-4">
            Join the arena to battle against other players and earn ranking points.
          </p>
          <button
            onClick={startPvPBattle}
            className="game-button"
          >
            Join PvP Queue
          </button>
        </div>
      )}

      {/* Searching State */}
      {battleState === 'searching' && (
        <div className="game-panel p-6 text-center">
          <div className="animate-spin text-4xl mb-4">⚔️</div>
          <p className="text-lg">
            {battleMode === 'pve' ? 'Entering dungeon...' : 'Searching for opponent...'}
          </p>
          <button
            onClick={fleeBattle}
            className="game-button bg-red-600 hover:bg-red-700 mt-4"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Battle Interface */}
      {battleState === 'battling' && opponent && (
        <div className="game-panel p-6">
          <div className="flex justify-between items-center mb-6">
            {/* Player */}
            <div className="text-center">
              <div className="w-20 h-20 bg-game-primary rounded-full flex items-center justify-center mb-2">
                <span className="text-3xl">
                  {selectedCharacter.class === 'warrior' ? '⚔️' :
                   selectedCharacter.class === 'mage' ? '🔮' :
                   selectedCharacter.class === 'rogue' ? '🗡️' :
                   selectedCharacter.class === 'healer' ? '✨' : '👤'}
                </span>
              </div>
              <h3 className="font-bold">{selectedCharacter.name}</h3>
              <div className="w-32 bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className="bg-red-600 h-2 rounded-full"
                  style={{ width: `${(selectedCharacter.health.current / selectedCharacter.health.max) * 100}%` }}
                />
              </div>
            </div>

            {/* VS */}
            <div className="text-2xl font-bold text-game-gold">VS</div>

            {/* Opponent */}
            <div className="text-center">
              <div className="w-20 h-20 bg-game-primary rounded-full flex items-center justify-center mb-2">
                <span className="text-3xl">
                  {opponent.type === 'monster' ? '🐺' : '👤'}
                </span>
              </div>
              <h3 className="font-bold">{opponent.name}</h3>
              <div className="w-32 bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className="bg-red-600 h-2 rounded-full"
                  style={{ width: `${(opponent.health.current / opponent.health.max) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Battle Log */}
          <div className="bg-game-primary rounded p-4 mb-4 h-32 overflow-y-auto">
            {battleLog.map((log, index) => (
              <div key={index} className="text-sm mb-1">{log}</div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={performAttack}
              className="game-button flex-1"
            >
              Attack
            </button>
            <button
              onClick={fleeBattle}
              className="game-button bg-red-600 hover:bg-red-700"
            >
              Flee
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BattleArena;