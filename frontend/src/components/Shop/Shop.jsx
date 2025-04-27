import { useState, useEffect } from 'react';
import { useGame } from '../../contexts/GameContext';
import { shopAPI } from '../../services/api';

const Shop = () => {
  const { selectedCharacter } = useGame();
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [shopItems, setShopItems] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchShops();
  }, []);

  useEffect(() => {
    if (selectedShop) {
      fetchShopItems(selectedShop._id);
    }
  }, [selectedShop]);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const response = await shopAPI.getAllShops();
      setShops(response.data.data);
      if (response.data.data.length > 0) {
        setSelectedShop(response.data.data[0]);
      }
    } catch (error) {
      setError('Failed to fetch shops');
      console.error('Error fetching shops:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchShopItems = async (shopId) => {
    try {
      const response = await shopAPI.getShopItems(shopId);
      setShopItems(response.data.data);
    } catch (error) {
      setError('Failed to fetch shop items');
      console.error('Error fetching shop items:', error);
    }
  };

  const handleBuyItem = async (itemId, item) => {
    try {
      setError('');
      await shopAPI.buyItem(selectedShop._id, {
        characterId: selectedCharacter._id,
        itemId,
        quantity: 1
      });
      
      // Refresh character data to update gold
      // You might want to implement a better state management solution
      window.location.reload();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to buy item');
    }
  };

  const handleSellItem = async (itemId) => {
    try {
      setError('');
      await shopAPI.sellItem(selectedShop._id, {
        characterId: selectedCharacter._id,
        itemId,
        quantity: 1
      });
      
      // Refresh character data
      window.location.reload();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to sell item');
    }
  };

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

  const filterItems = (items) => {
    if (activeTab === 'all') return items;
    return items.filter(shopItem => shopItem.item.type === activeTab);
  };

  if (loading) {
    return <div className="game-panel p-4">Loading shops...</div>;
  }

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

      {error && (
        <div className="bg-red-600 text-white p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Shop Selection */}
      <div className="game-panel p-4">
        <h3 className="text-lg font-bold mb-3">Select Shop</h3>
        <div className="flex gap-2 overflow-x-auto">
          {shops.map((shop) => (
            <button
              key={shop._id}
              onClick={() => setSelectedShop(shop)}
              className={`px-4 py-2 rounded ${
                selectedShop?._id === shop._id ? 'bg-game-accent' : 'bg-game-primary'
              }`}
            >
              {shop.name}
            </button>
          ))}
        </div>
      </div>

      {/* Shop Items */}
      {selectedShop && shopItems && (
        <div className="game-panel p-4">
          <h3 className="text-lg font-bold mb-3">{selectedShop.name}'s Inventory</h3>
          
          {/* Item Type Tabs */}
          <div className="flex gap-2 mb-4 overflow-x-auto">
            {['all', 'weapon', 'armor', 'consumable'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded ${
                  activeTab === tab ? 'bg-game-accent' : 'bg-game-primary'
                } capitalize`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filterItems(shopItems.items).map((shopItem) => (
              <div key={shopItem.item._id} className="bg-game-primary p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`font-bold ${getRarityColor(shopItem.item.rarity)}`}>
                    {shopItem.item.name}
                  </h3>
                  <span className="text-game-gold font-bold">{shopItem.price} 🪙</span>
                </div>
                
                <p className="text-sm text-gray-300 mb-2">{shopItem.item.description}</p>
                
                <div className="text-sm text-gray-400 mb-3">
                  {shopItem.item.stats && Object.entries(shopItem.item.stats).map(([stat, value]) => (
                    <div key={stat} className="capitalize">
                      {stat}: +{value}
                    </div>
                  ))}
                  {shopItem.item.effects && shopItem.item.effects.map((effect, index) => (
                    <div key={index}>
                      {effect.type}: +{effect.value}
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={() => handleBuyItem(shopItem.item._id, shopItem.item)}
                  className="game-button w-full text-sm"
                  disabled={selectedCharacter.gold < shopItem.price}
                >
                  {selectedCharacter.gold < shopItem.price ? 'Not enough gold' : 'Buy'}
                </button>
              </div>
            ))}
          </div>

          {filterItems(shopItems.items).length === 0 && (
            <div className="text-center text-gray-400 py-4">
              No items available in this category
            </div>
          )}
        </div>
      )}

      {/* Sell Items Section */}
      <div className="game-panel p-4">
        <h3 className="text-xl font-bold mb-4">Sell Items</h3>
        <p className="text-gray-400 mb-4">Select items from your inventory to sell</p>
        
        {selectedCharacter.inventory && selectedCharacter.inventory.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedCharacter.inventory.filter(invItem => invItem.item.isSellable).map((invItem) => (
              <div key={invItem._id} className="bg-game-primary p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`font-bold ${getRarityColor(invItem.item.rarity)}`}>
                    {invItem.item.name}
                  </h3>
                  <span className="text-game-gold font-bold">
                    {Math.floor(invItem.item.value * (selectedShop?.shop.buyMultiplier || 0.5))} 🪙
                  </span>
                </div>
                
                <p className="text-sm text-gray-300 mb-2">{invItem.item.description}</p>
                <p className="text-sm text-gray-400 mb-2">Quantity: {invItem.quantity}</p>
                
                <button
                  onClick={() => handleSellItem(invItem.item._id)}
                  className="game-button w-full text-sm"
                >
                  Sell
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">You have no items to sell</p>
        )}
      </div>
    </div>
  );
};

export default Shop;