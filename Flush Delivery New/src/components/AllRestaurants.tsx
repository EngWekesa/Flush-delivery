import React, { useState } from 'react';
import { restaurants, Restaurant } from '@/data/restaurants';
import RestaurantCard from './RestaurantCard';

interface AllRestaurantsProps {
  onRestaurantClick: (restaurant: Restaurant) => void;
  onBack: () => void;
}

const AllRestaurants: React.FC<AllRestaurantsProps> = ({ onRestaurantClick, onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [...new Set(restaurants.map(r => r.category))];

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || restaurant.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-4">
      {/* Header */}
      <div className="bg-green-600 text-white sticky top-0 z-10">
        <div className="px-3 py-3">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={onBack} className="p-1.5 hover:bg-green-700 rounded-full">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-lg font-bold">All Restaurants</h1>
          </div>
          
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search restaurants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg text-gray-800 text-sm focus:ring-2 focus:ring-green-300 focus:outline-none"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex overflow-x-auto scrollbar-hide px-3 pb-3 gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              !selectedCategory
                ? 'bg-white text-green-600'
                : 'bg-green-700 text-white hover:bg-green-800'
            }`}
          >
            All
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-white text-green-600'
                  : 'bg-green-700 text-white hover:bg-green-800'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="px-3 py-3">
        <p className="text-sm text-gray-600">
          {filteredRestaurants.length} restaurant{filteredRestaurants.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Restaurant Grid */}
      <div className="px-3">
        <div className="grid grid-cols-2 gap-3">
          {filteredRestaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              onClick={() => onRestaurantClick(restaurant)}
              compact
            />
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredRestaurants.length === 0 && (
        <div className="text-center py-12 px-4">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-gray-500 font-medium">No restaurants found</p>
          <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
        </div>
      )}

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

export default AllRestaurants;
