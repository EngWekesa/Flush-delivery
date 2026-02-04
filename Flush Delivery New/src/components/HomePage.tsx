import React, { useState, useEffect, useRef } from 'react';
import { restaurants, popularFoods, HERO_IMAGE, Restaurant } from '@/data/restaurants';
import { useAuth } from '@/contexts/AuthContext';
import RestaurantCard from './RestaurantCard';
interface HomePageProps {
  onRestaurantClick: (restaurant: Restaurant) => void;
  onViewAllClick: () => void;
}
const HomePage: React.FC<HomePageProps> = ({
  onRestaurantClick,
  onViewAllClick
}) => {
  const {
    user
  } = useAuth();
  const [marqueeOffset, setMarqueeOffset] = useState(0);
  const marqueeRef = useRef<HTMLDivElement>(null);

  // Marquee animation
  useEffect(() => {
    const interval = setInterval(() => {
      setMarqueeOffset(prev => {
        const newOffset = prev - 1;
        if (marqueeRef.current) {
          const width = marqueeRef.current.scrollWidth / 2;
          if (Math.abs(newOffset) >= width) {
            return 0;
          }
        }
        return newOffset;
      });
    }, 30);
    return () => clearInterval(interval);
  }, []);
  const featuredRestaurants = restaurants.slice(0, 4);
  return <div className="min-h-screen bg-gray-50 pb-4 bg-[url('https://d64gsuwffb70l.cloudfront.net/694eb13317bb9b81837d22b7_1769206516350_b8745fdd.jpeg')] bg-cover bg-center">
      {/* Hero Section - Mobile Optimized */}
      <section className="relative h-48 overflow-hidden">
        <img src={HERO_IMAGE} alt="Food Delivery" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
        <div className="absolute inset-0 flex items-center">
          <div className="px-4 w-full">
            <div className="max-w-xl">
              {user && <p className="text-green-400 font-semibold text-xs mb-1" data-mixed-content="true" data-mixed-content="true" data-mixed-content="true" data-mixed-content="true">
                  Welcome, {user.full_name}!
                </p>}
              <h1 className="font-bold mb-2 text-green-500 bg-gray-100 text-xs text-center p-1">SHOP NOW AT YOUR COMFORT LET US DELIVER!</h1>
              <p className="text-sm text-white/80 mb-3"></p>
              <button onClick={onViewAllClick} className="px-5 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors">
                Order Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee Section - Popular Foods */}
      <section className="py-4 bg-white overflow-hidden">
        <div className="px-4 mb-3">
          <h2 className="text-lg font-bold text-gray-800">Popular Foods</h2>
        </div>
        <div className="relative overflow-hidden">
          <div ref={marqueeRef} className="flex gap-3 whitespace-nowrap" style={{
          transform: `translateX(${marqueeOffset}px)`
        }}>
            {[...popularFoods, ...popularFoods].map((food, index) => <div key={index} className="inline-flex flex-col items-center min-w-[140px] bg-gray-50 rounded-xl p-3">
                <img src={food.image} alt={food.name} className="w-24 h-24 rounded-lg object-cover mb-2" />
                <p className="font-semibold text-gray-800 text-center whitespace-normal text-xs leading-tight">{food.name}</p>
                <p className="text-[10px] text-gray-500">{food.restaurant}</p>
                <p className="text-green-600 font-bold text-sm" data-mixed-content="true" data-mixed-content="true" data-mixed-content="true" data-mixed-content="true">KSH {food.price}</p>
              </div>)}
          </div>
        </div>
      </section>

      {/* Featured Restaurants */}
      <section className="py-4 bg-gray-50">
        <div className="px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Featured Restaurants</h2>
            <button onClick={onViewAllClick} className="text-green-600 font-semibold text-sm hover:underline flex items-center gap-1">
              View All
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {featuredRestaurants.map(restaurant => <RestaurantCard key={restaurant.id} restaurant={restaurant} onClick={() => onRestaurantClick(restaurant)} compact />)}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-4 bg-white">
        <div className="px-4">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Browse by Category</h2>
          <div className="grid grid-cols-3 gap-2">
            {[{
            name: 'Pork',
            icon: '🥓',
            count: 3
          }, {
            name: 'Chicken',
            icon: '🍗',
            count: 4
          }, {
            name: 'Fish',
            icon: '🐟',
            count: 2
          }, {
            name: 'Fast Food',
            icon: '🍟',
            count: 3
          }, {
            name: 'Traditional',
            icon: '🍲',
            count: 3
          }, {
            name: 'Groceries',
            icon: '🛒',
            count: 2
          }].map(category => <button key={category.name} onClick={onViewAllClick} className="bg-gray-50 rounded-xl p-3 text-center hover:bg-green-50 hover:border-green-200 border-2 border-transparent transition-all">
                <span className="text-2xl mb-1 block">{category.icon}</span>
                <p className="font-semibold text-gray-800 text-xs">{category.name}</p>
                <p className="text-[10px] text-gray-500" data-mixed-content="true" data-mixed-content="true" data-mixed-content="true" data-mixed-content="true">{category.count} places</p>
              </button>)}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-6 bg-green-600 text-white">
        <div className="px-4">
          <h2 className="text-lg font-bold text-center mb-6">How It Works</h2>
          <div className="space-y-4">
            {[{
            step: 1,
            title: 'Choose Restaurant',
            desc: 'Browse our selection of restaurants'
          }, {
            step: 2,
            title: 'Select Your Food',
            desc: 'Pick your favorite dishes'
          }, {
            step: 3,
            title: 'Fast Delivery',
            desc: 'Get food delivered to your door'
          }].map(item => <div key={item.step} className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white text-green-600 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-white/80 text-sm">{item.desc}</p>
                </div>
              </div>)}
          </div>
        </div>
      </section>

      {/* All Restaurants Preview */}
      <section className="py-4 bg-gray-50">
        <div className="px-4">
          <h2 className="text-lg font-bold text-gray-800 mb-4">All Restaurants</h2>
          <div className="grid grid-cols-2 gap-3">
            {restaurants.slice(0, 6).map(restaurant => <button key={restaurant.id} onClick={() => onRestaurantClick(restaurant)} className="bg-white rounded-lg p-3 text-left hover:shadow-md transition-shadow">
                <img src={restaurant.image} alt={restaurant.name} className="w-full h-20 object-cover rounded-lg mb-2" />
                <p className="font-semibold text-gray-800 text-xs truncate">{restaurant.name}</p>
                <div className="flex items-center gap-1 mt-1">
                  <svg className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-[10px] text-gray-600">{restaurant.rating}</span>
                </div>
              </button>)}
          </div>
          <div className="text-center mt-4">
            <button onClick={onViewAllClick} className="px-6 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors" data-mixed-content="true" data-mixed-content="true" data-mixed-content="true" data-mixed-content="true">
              View All {restaurants.length} Restaurants
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6">
        <div className="px-4">
          <div className="text-center mb-4">
            <h3 className="text-lg font-bold text-green-400 mb-2">Flush online shop</h3>
            <p className="text-gray-400 text-xs">
              Your favorite food from the best restaurants in Ruiru
            </p>
          </div>
          
          <div className="text-center mb-4">
            <p className="text-gray-400 text-xs mb-1">For queries call:</p>
            <a href="tel:0708770746" className="text-green-400 font-bold text-lg hover:underline">
              0708770746
            </a>
          </div>
          
          <div className="border-t border-gray-800 pt-4 text-center text-gray-500 text-xs">© 2026 Flush online shop. All rights reserved.</div>
        </div>
      </footer>
    </div>;
};
export default HomePage;