import { useState, useEffect } from 'react';
import { useGame } from '../../contexts/GameContext';
import { inventoryAPI } from '../../services/api';

const Inventory = () => {
  const { selectedCharacter } = useGame();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (selectedCharacter) {
      fetchInventory();
    }
  }, [selectedCharacter]);

  const fetchInventory = async () => {
    try {
      const response = await inventoryAPI.getInventory(selectedCharacter._id);
      setInventory(response.data.data);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUseItem = async (itemId) => {
    try {
      await inventoryAPI.useItem(selectedCharacter._id, itemId);
      fetchInventory(); // Refresh inventory
    } catch (error) {
      console.error('Failed to use item:', error);
    }
  };

  const handleEquipItem = async (itemId, slot) => {
    try {
      await inventoryAPI.equipItem(selectedCharacter._id, { itemId, slot });
      fetchInventory(); // Refresh inventory
    } catch (error) {
      console.error('Failed to equip item:', error);
    }
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common':
        return 'text-gray-400';
      case 'uncommon':
        return 'text-green-400';
      case 'rare':
        return 'text-blue-400';
      case 'epic':
        return 'text-purple-400';
      case 'legendary':
        return 'text-yellow-400';
      default:
        return 'text-white';
    }
  };

  const filterItems = (items) => {
    if (activeTab === 'all') return items;
    return items.filter(item => item.item.type === activeTab);
  };

  if (loading) {
    return <div className="game-panel p-4">Loading inventory...</div>;
  }

  return (
    <div className="game-panel p-4">
      <h2 className="text-xl font-bold text-game-gold mb-4">Inventory</h2>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {['all', 'weapon', 'armor', 'consumable', 'material'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 rounded capitalize ${
              activeTab === tab ? 'bg-game-accent' : 'bg-game-primary'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Gold */}
      <div className="mb-4 flex items-center">
        <span className="text-yellow-400 mr-2">🪙</span>
        <span>{selectedCharacter.gold} Gold</span>
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-4 gap-2">
        {filterItems(inventory).map((inventoryItem) => (
          <div
            key={inventoryItem._id}
            className="bg-game-primary rounded p-2 relative group cursor-pointer"
          >
            <div className="aspect-square bg-game-secondary rounded flex items-center justify-center">
              <span className="text-2xl">
                {inventoryItem.item.type === 'weapon' ? '⚔️' :
                 inventoryItem.item.type === 'armor' ? '🛡️' :
                 inventoryItem.item.type === 'consumable' ? '🧪' :
                 inventoryItem.item.type === 'material' ? '📦' : '❓'}
              </span>
            </div>
            <div className="mt-1 text-xs text-center">
              <div className={getRarityColor(inventoryItem.item.rarity)}>
                {inventoryItem.item.name}
              </div>
              {inventoryItem.quantity > 1 && (
                <div className="text-gray-400">x{inventoryItem.quantity}</div>
              )}
            </div>

            {/* Tooltip */}
            <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10">
              <div className="bg-game-secondary p-3 rounded shadow-lg min-w-[200px]">
                <h3 className={`font-bold ${getRarityColor(inventoryItem.item.rarity)}`}>
                  {inventoryItem.item.name}
                </h3>
                <p className="text-sm text-gray-300 mt-1">
                  {inventoryItem.item.description}
                </p>
                <div className="text-sm mt-2">
                  <p>Type: {inventoryItem.item.type}</p>
                  <p>Value: {inventoryItem.item.value} gold</p>
                </div>
                {inventoryItem.item.type === 'consumable' && (
                  <button
                    onClick={() => handleUseItem(inventoryItem.item._id)}
                    className="mt-2 game-button text-xs w-full"
                  >
                    Use
                  </button>
                )}
                {(inventoryItem.item.type === 'weapon' || inventoryItem.item.type === 'armor') && (
                  <button
                    onClick={() => handleEquipItem(inventoryItem.item._id, inventoryItem.item.type)}
                    className="mt-2 game-button text-xs w-full"
                  >
                    Equip
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filterItems(inventory).length === 0 && (
        <div className="text-center text-gray-400 mt-4">
          No items in this category
        </div>
      )}
    </div>
  );
};

export default Inventory;