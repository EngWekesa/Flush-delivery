import React, { useState } from 'react';
import { Restaurant, MenuItem } from '@/data/restaurants';
import { useCart } from '@/contexts/CartContext';

interface RestaurantDetailProps {
  restaurant: Restaurant;
  onBack: () => void;
  onLoginRequired: () => void;
}

const RestaurantDetail: React.FC<RestaurantDetailProps> = ({ restaurant, onBack }) => {
  const { addToCart } = useCart();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = [...new Set(restaurant.menu.map(item => item.category || 'Other'))];

  // Set first category as active by default
  React.useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0]);
    }
  }, [categories]);

  const handleQuantityChange = (itemId: string, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(1, (prev[itemId] || 1) + delta),
    }));
  };

  const handleAddToCart = (item: MenuItem) => {
    const quantity = quantities[item.id] || 1;
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      category: item.category || 'Other',
    }, quantity);

    setAddedItems(prev => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedItems(prev => ({ ...prev, [item.id]: false }));
    }, 2000);
  };

  const filteredMenu = activeCategory 
    ? restaurant.menu.filter(item => (item.category || 'Other') === activeCategory)
    : restaurant.menu;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="relative h-48">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <button
          onClick={onBack}
          className="absolute top-3 left-3 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="absolute bottom-3 left-3 right-3">
          <h1 className="text-xl font-bold text-white mb-1">{restaurant.name}</h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
              <svg className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-white text-xs font-semibold">{restaurant.rating}</span>
            </div>
            <span className="text-white/80 text-xs">{restaurant.category}</span>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="flex overflow-x-auto scrollbar-hide">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === category
                  ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                  : 'text-gray-600 hover:text-green-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-3 py-3">
        <h2 className="text-sm font-bold text-gray-800 mb-3">
          {activeCategory} ({filteredMenu.length} items)
        </h2>
        <div className="space-y-2">
          {filteredMenu.map(item => (
            <div
              key={item.id}
              className="bg-white rounded-xl p-3 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-800 text-sm leading-tight">{item.name}</h3>
                  <p className="text-green-600 font-bold text-base mt-1">KSH {item.price}</p>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1 bg-gray-100 rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(item.id, -1)}
                      className="p-1.5 hover:bg-gray-200 rounded-l-lg transition-colors"
                    >
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="w-6 text-center font-semibold text-gray-800 text-sm">
                      {quantities[item.id] || 1}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(item.id, 1)}
                      className="p-1.5 hover:bg-gray-200 rounded-r-lg transition-colors"
                    >
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Add to Cart Button */}
                  <button
                    onClick={() => handleAddToCart(item)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                      addedItems[item.id]
                        ? 'bg-green-100 text-green-600'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {addedItems[item.id] ? 'Added!' : 'Add'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Categories View */}
      {!activeCategory && categories.map(category => (
        <div key={category} className="px-3 py-3">
          <h2 className="text-sm font-bold text-gray-800 mb-3 pb-2 border-b border-gray-200">
            {category}
          </h2>
          <div className="space-y-2">
            {restaurant.menu
              .filter(item => (item.category || 'Other') === category)
              .map(item => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl p-3 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-800 text-sm leading-tight">{item.name}</h3>
                      <p className="text-green-600 font-bold text-base mt-1">KSH {item.price}</p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-1 bg-gray-100 rounded-lg">
                        <button
                          onClick={() => handleQuantityChange(item.id, -1)}
                          className="p-1.5 hover:bg-gray-200 rounded-l-lg transition-colors"
                        >
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="w-6 text-center font-semibold text-gray-800 text-sm">
                          {quantities[item.id] || 1}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id, 1)}
                          className="p-1.5 hover:bg-gray-200 rounded-r-lg transition-colors"
                        >
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                      
                      <button
                        onClick={() => handleAddToCart(item)}
                        className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                          addedItems[item.id]
                            ? 'bg-green-100 text-green-600'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {addedItems[item.id] ? 'Added!' : 'Add'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default RestaurantDetail;
