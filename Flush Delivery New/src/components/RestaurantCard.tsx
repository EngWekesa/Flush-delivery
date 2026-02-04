import React from 'react';
import { Restaurant } from '@/data/restaurants';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick: () => void;
  compact?: boolean;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, onClick, compact = false }) => {
  if (compact) {
    return (
      <button
        onClick={onClick}
        className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all text-left w-full"
      >
        <div className="relative h-24">
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-full flex items-center gap-1">
            <svg className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-[10px] font-semibold text-gray-800">{restaurant.rating}</span>
          </div>
        </div>
        <div className="p-2">
          <h3 className="font-semibold text-gray-800 text-xs truncate">{restaurant.name}</h3>
          <p className="text-[10px] text-gray-500 truncate">{restaurant.category}</p>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all text-left w-full"
    >
      <div className="relative h-32">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
          <svg className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-xs font-semibold text-gray-800">{restaurant.rating}</span>
        </div>
        <div className="absolute bottom-2 left-2 right-2">
          <h3 className="font-bold text-white text-sm truncate">{restaurant.name}</h3>
        </div>
      </div>
      <div className="p-3">
        <p className="text-xs text-gray-500">{restaurant.category}</p>
        <p className="text-xs text-green-600 font-medium mt-1">
          {restaurant.menu.length} items available
        </p>
      </div>
    </button>
  );
};

export default RestaurantCard;
