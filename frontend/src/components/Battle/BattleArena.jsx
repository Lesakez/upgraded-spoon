import { useState, useEffect } from 'react';
import { useGame } from '../../contexts/GameContext';
import { dungeonAPI, pvpAPI } from '../../services/api';

const BattleArena = () => {
  const { selectedCharacter, attackTarget } = useGame();
  const [battleMode, setBattleMode] = useState('pve');
  const [battleState, setBattleState] = useState('idle');
  const [opponent, setOpponent] = useState(null);
  const [battleLog, setBattleLog] = useState([]);
  const [availableDungeons, setAvailableDungeons] = useState([]);
  const [selectedDungeon, setSelectedDungeon] = useState(null);
  const [currentInstance, setCurrentInstance] = useState(null);
  const [currentFloor, setCurrentFloor] = useState(1);
  const [floorData, setFloorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDungeons();
    const intervalId = setInterval(fetchDungeons, 60000);
    return () => clearInterval(intervalId);
  }, [selectedCharacter]);

  const fetchDungeons = async () => {
    try {
      setLoading(true);
      const response = await dungeonAPI.getDungeons();
      const dungeons = response.data.data;
      
      const processedDungeons = dungeons.map(dungeon => {
        const lastCompletion = selectedCharacter.completedDungeons?.find(
          completion => completion.dungeon === dungeon._id
        );
        
        let status = 'available';
        let remainingTime = 0;
        
        if (lastCompletion) {
          const timeSinceCompletion = Date.now() - new Date(lastCompletion.completedAt).getTime();
          remainingTime = Math.max(0, (dungeon.cooldown * 1000) - timeSinceCompletion);
          
          if (remainingTime > 0) {
            status = 'cooldown';
          } else {
            status = 'available';
          }
        } else if (selectedCharacter.level < dungeon.requirements.minLevel) {
          status = 'locked';
        }
        
        return {
          ...dungeon,
          status,
          remainingTime: Math.ceil(remainingTime / 1000),
          lastCompletion
        };
      });
      
      setAvailableDungeons(processedDungeons);
    } catch (error) {
      console.error('Error fetching dungeons:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeRemaining = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const getDungeonStatusBadge = (dungeon) => {
    if (dungeon.status === 'locked') {
      return (
        <span className="text-xs px-2 py-1 bg-red-900 text-red-300 rounded">
          Level {dungeon.requirements.minLevel} Required
        </span>
      );
    }
    if (dungeon.status === 'cooldown') {
      return (
        <span className="text-xs px-2 py-1 bg-yellow-900 text-yellow-300 rounded">
          Cooldown: {formatTimeRemaining(dungeon.remainingTime)}
        </span>
      );
    }
    if (dungeon.lastCompletion) {
      return (
        <span className="text-xs px-2 py-1 bg-green-900 text-green-300 rounded">
          Completed
        </span>
      );
    }
    return null;
  };

  const startPvEBattle = async (dungeon) => {
    try {
      setError('');
      setSelectedDungeon(dungeon);
      setBattleState('searching');
      
      const response = await dungeonAPI.enterDungeon(dungeon._id, selectedCharacter._id);
      
      if (response.data.success) {
        setCurrentInstance(response.data.data.instanceId);
        setCurrentFloor(response.data.data.currentFloor);
        setBattleState('battling');
        
        const dungeonDetails = await dungeonAPI.getDungeon(dungeon._id);
        const firstFloor = dungeonDetails.data.data.floors.find(f => f.number === 1);
        setFloorData(firstFloor);
        
        if (firstFloor.type === 'monster' || firstFloor.type === 'boss') {
          const monster = firstFloor.type === 'monster' ? firstFloor.monster : firstFloor.boss.monster;
          setOpponent({
            ...monster,
            health: { current: monster.health.max, max: monster.health.max },
            type: 'monster'
          });
        }
        
        setBattleLog(['Entering dungeon...', `Floor ${currentFloor}`]);
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to enter dungeon');
      setBattleState('idle');
    }
  };

  const moveToNextFloor = async () => {
    try {
      setError('');
      const response = await dungeonAPI.moveToNextFloor(selectedDungeon._id, {
        characterId: selectedCharacter._id,
        instanceId: currentInstance
      });
      
      if (response.data.success) {
        setCurrentFloor(response.data.data.currentFloor);
        setFloorData(response.data.data.floorData);
        
        if (response.data.data.floorData.type === 'monster' || response.data.data.floorData.type === 'boss') {
          const monster = response.data.data.floorData.type === 'monster' ? 
            response.data.data.floorData.monster : 
            response.data.data.floorData.boss.monster;
          
          setOpponent({
            ...monster,
            health: { current: monster.health.max, max: monster.health.max },
            type: 'monster'
          });
        } else {
          setOpponent(null);
        }
        
        setBattleLog(prev => [...prev, `Moving to Floor ${response.data.data.currentFloor}`]);
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to move to next floor');
    }
  };

  const handleFloorEvent = async () => {
    if (!floorData) return;
    
    switch (floorData.type) {
      case 'treasure':
        setBattleLog(prev => [...prev, 'You found treasure!']);
        await moveToNextFloor();
        break;
        
      case 'event':
        setBattleLog(prev => [...prev, `Event: ${floorData.events[0].description}`]);
        await moveToNextFloor();
        break;
        
      case 'rest':
        setBattleLog(prev => [...prev, 'You found a resting spot. Your health is restored.']);
        await moveToNextFloor();
        break;
    }
  };

  const performAttack = async () => {
    if (!opponent) return;
    
    const damage = Math.floor(Math.random() * 20) + 10;
    const newHealth = Math.max(0, opponent.health.current - damage);
    
    setOpponent(prev => ({
      ...prev,
      health: { ...prev.health, current: newHealth }
    }));
    
    setBattleLog(prev => [...prev, `You dealt ${damage} damage!`]);
    
    if (newHealth <= 0) {
      setBattleLog(prev => [...prev, 'Monster defeated!']);
      
      await dungeonAPI.updateProgress(selectedDungeon._id, {
        instanceId: currentInstance,
        monsterId: opponent._id,
        action: floorData.type === 'boss' ? 'boss_defeated' : 'monster_killed'
      });
      
      if (currentFloor === selectedDungeon.totalFloors && floorData.type === 'boss') {
        const completeResponse = await dungeonAPI.completeDungeon(selectedDungeon._id, {
          characterId: selectedCharacter._id,
          instanceId: currentInstance
        });
        
        setBattleLog(prev => [...prev, 'Dungeon completed! You received rewards.']);
        setBattleState('idle');
        setOpponent(null);
        setCurrentInstance(null);
        setSelectedDungeon(null);
        await fetchDungeons();
      } else {
        await moveToNextFloor();
      }
    } else {
      setTimeout(() => {
        const opponentDamage = Math.floor(Math.random() * 15) + 5;
        setBattleLog(prev => [...prev, `${opponent.name} dealt ${opponentDamage} damage!`]);
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
          instanceId: currentInstance
        });
      } catch (error) {
        console.error('Failed to leave dungeon:', error);
      }
    }
  };

  if (loading && availableDungeons.length === 0) {
    return <div className="game-panel p-4">Loading battle arena...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="game-panel p-4">
        <h2 className="text-2xl font-bold text-game-gold mb-2">Battle Arena</h2>
        <p className="text-gray-400">Test your strength against monsters and other players</p>
      </div>

      {error && (
        <div className="bg-red-600 text-white p-4 rounded-lg">
          {error}
        </div>
      )}

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

      {battleState === 'idle' && battleMode === 'pve' && (
        <div className="game-panel p-6">
          <h3 className="text-xl font-bold mb-4">Available Dungeons</h3>
          <div className="grid grid-cols-1 gap-4">
            {availableDungeons.map((dungeon) => (
              <div 
                key={dungeon._id}
                className={`bg-game-primary p-4 rounded-lg flex justify-between items-center ${
                  dungeon.status === 'cooldown' || dungeon.status === 'locked' ? 'opacity-75' : ''
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold">{dungeon.name}</h4>
                    {getDungeonStatusBadge(dungeon)}
                  </div>
                  <p className="text-sm text-gray-400">
                    Level {dungeon.requirements.minLevel}-{dungeon.requirements.maxLevel} • {dungeon.totalFloors} Floors
                  </p>
                  <p className="text-sm text-gray-300">{dungeon.description}</p>
                </div>
                <button
                  onClick={() => startPvEBattle(dungeon)}
                  className={`game-button ${
                    dungeon.status === 'cooldown' || dungeon.status === 'locked' ? 'bg-gray-600 cursor-not-allowed' : ''
                  }`}
                  disabled={dungeon.status === 'cooldown' || dungeon.status === 'locked'}
                >
                  {dungeon.status === 'cooldown' ? 'On Cooldown' : 
                   dungeon.status === 'locked' ? 'Level Required' : 
                   'Enter Dungeon'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {battleState === 'battling' && selectedDungeon && (
        <div className="game-panel p-6">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-game-gold">{selectedDungeon.name}</h3>
            <p className="text-sm text-gray-400">Floor {currentFloor} of {selectedDungeon.totalFloors}</p>
          </div>

          {floorData && (
            <div className="mb-6">
              {(floorData.type === 'monster' || floorData.type === 'boss') && opponent && (
                <div className="flex justify-between items-center">
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

                  <div className="text-2xl font-bold text-game-gold">VS</div>

                  <div className="text-center">
                    <div className="w-20 h-20 bg-game-primary rounded-full flex items-center justify-center mb-2">
                      <span className="text-3xl">
                        {floorData.type === 'boss' ? '👹' : '🐺'}
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
              )}

              {floorData.type === 'treasure' && (
                <div className="text-center py-8">
                  <span className="text-5xl mb-4">💰</span>
                  <h3 className="text-xl font-bold">Treasure Room!</h3>
                  <p className="text-gray-400">You found some valuable items</p>
                </div>
              )}

              {floorData.type === 'event' && (
                <div className="text-center py-8">
                  <span className="text-5xl mb-4">❗</span>
                  <h3 className="text-xl font-bold">Event!</h3>
                  <p className="text-gray-400">{floorData.events[0].description}</p>
                </div>
              )}

              {floorData.type === 'rest' && (
                <div className="text-center py-8">
                  <span className="text-5xl mb-4">🏕️</span>
                  <h3 className="text-xl font-bold">Resting Area</h3>
                  <p className="text-gray-400">You can rest and restore health here</p>
                </div>
              )}
            </div>
          )}

          <div className="bg-game-primary rounded p-4 mb-4 h-32 overflow-y-auto">
            {battleLog.map((log, index) => (
              <div key={index} className="text-sm mb-1">{log}</div>
            ))}
          </div>

          <div className="flex gap-4">
            {(floorData?.type === 'monster' || floorData?.type === 'boss') && opponent && (
              <>
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
              </>
            )}
            
            {floorData && ['treasure', 'event', 'rest'].includes(floorData.type) && (
              <button
                onClick={handleFloorEvent}
                className="game-button flex-1"
              >
                Continue
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BattleArena;