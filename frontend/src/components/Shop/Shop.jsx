import { useState, useEffect } from 'react';
import { useGame } from '../../contexts/GameContext';

const Shop = () => {
  const { selectedCharacter } = useGame();
  const [activeTab, setActiveTab] = useState('weapons');
  const [items, setItems] = useState({
    weapons: [
      { id: 1, name: 'Iron Sword', type: 'weapon', price: 100, stats: { damage: 10 }, rarity: 'common' },
      { id: 2, name: 'Steel Battleaxe', type: 'weapon', price: 250, stats: { damage: 18 }, rarity: 'uncommon' },
      { id: 3, name: 'Magic Staff', type: 'weapon', price: 300, stats: { magicPower: 15 }, rarity: 'rare' },
    ],
    armor: [
      { id: 4, name: 'Leather Armor', type: 'armor', price: 80, stats: { defense: 5 }, rarity: 'common' },
      { id: 5, name: 'Chain Mail', type: 'armor', price: 200, stats: { defense: 12 }, rarity: 'uncommon' },
      { id: 6, name: 'Plate Armor', type: 'armor', price: 500, stats: { defense: 20 }, rarity: 'rare' },
    ],
    consumables: [
      { id: 7, name: 'Health Potion', type: 'consumable', price: 20, effect: 'Restore 50 HP', rarity: 'common' },
      { id: 8, name: 'Mana Potion', type: 'consumable', price: 25, effect: 'Restore 30 MP', rarity: 'common' },
      { id: 9, name: 'Elixir', type: 'consumable', price: 100, effect: 'Restore 100 HP & 50 MP', rarity: 'uncommon' },
    ],
  });

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return 'text-gray-400';
      case 'uncommon': return 'text-green-400';
      case 'rare': return 'text-blue-400';
      case 'epic': return 'text-purple-400';
      case 'legendary': return 'text-yellow-400';
      default: return 'text-white';
    }
  };

  const handleBuyItem = (item) => {
    if (selectedCharacter.gold < item.price) {
      alert('Not enough gold!');
      return;
    }
    // TODO: Implement actual purchase logic with backend
    console.log('Buying item:', item);
  };

  return (
    <div className="space-y-4">
      {/* Shop Header */}
      <div className="game-panel p-4">
        <h2 className="text-2xl font-bold text-game-gold mb-2">Merchant's Shop</h2>
        <p className="text-gray-400">Buy and sell equipment and items</p>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-yellow-400">🪙</span>
          <span>Your Gold: {selectedCharacter.gold}</span>
        </div>
      </div>

      {/* Shop Tabs */}
      <div className="game-panel p-4">
        <div className="flex gap-4 mb-6">
          {Object.keys(items).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded ${
                activeTab === tab ? 'bg-game-accent' : 'bg-game-primary'
              } capitalize`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items[activeTab].map((item) => (
            <div key={item.id} className="bg-game-primary p-4 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h3 className={`font-bold ${getRarityColor(item.rarity)}`}>
                  {item.name}
                </h3>
                <span className="text-game-gold font-bold">{item.price} 🪙</span>
              </div>
              
              <div className="text-sm text-gray-400 mb-3">
                {item.stats ? (
                  Object.entries(item.stats).map(([stat, value]) => (
                    <div key={stat} className="capitalize">
                      {stat}: +{value}
                    </div>
                  ))
                ) : (
                  <div>{item.effect}</div>
                )}
              </div>
              
              <button
                onClick={() => handleBuyItem(item)}
                className="game-button w-full text-sm"
                disabled={selectedCharacter.gold < item.price}
              >
                {selectedCharacter.gold < item.price ? 'Not enough gold' : 'Buy'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Sell Items Section */}
      <div className="game-panel p-4">
        <h3 className="text-xl font-bold mb-4">Sell Items</h3>
        <p className="text-gray-400 mb-4">Select items from your inventory to sell</p>
        <button className="game-button">Open Inventory</button>
      </div>
    </div>
  );
};

export default Shop;