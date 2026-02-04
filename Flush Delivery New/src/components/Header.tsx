import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { LOGO_IMAGE, PHONE_NUMBER } from '@/data/restaurants';
interface HeaderProps {
  onCartClick: () => void;
  onLoginClick: () => void;
  onOrdersClick: () => void;
  onAdminClick?: () => void;
  currentView: string;
  onHomeClick: () => void;
}
const Header: React.FC<HeaderProps> = ({
  onCartClick,
  onLoginClick,
  onOrdersClick,
  onAdminClick,
  currentView,
  onHomeClick
}) => {
  const {
    user,
    logout
  } = useAuth();
  const {
    getItemCount
  } = useCart();
  const itemCount = getItemCount();
  return <header className="bg-white shadow-md sticky top-0 z-50">
      {/* Top Banner */}
      <div className="bg-green-600 text-white py-1.5 px-3">
        <div className="flex items-center justify-center gap-2">
          <img src={LOGO_IMAGE} alt="Ruiru Eats" className="h-6 w-6 rounded-full object-cover" />
          <span className="text-xs font-medium">
            Call: <a href={`tel:${PHONE_NUMBER}`} className="font-bold underline">{PHONE_NUMBER}</a>
          </span>
        </div>
      </div>

      {/* Main Header */}
      <div className="px-3 py-2">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button onClick={onHomeClick} className="flex items-center gap-2">
            <img src={LOGO_IMAGE} alt="Ruiru Eats" className="h-8 w-8 rounded-full object-cover" />
            <span className="text-lg font-bold text-green-600">Flush Online Shop.</span>
          </button>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Cart Button - show for customers or non-logged in users */}
            {(!user || user?.user_type === 'customer') && <button onClick={onCartClick} className="relative p-2 text-gray-600 hover:text-green-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {itemCount > 0 && <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {itemCount}
                  </span>}
              </button>}

            {/* User Menu */}
            {user ? <button onClick={logout} className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors">
                Logout
              </button> : <button onClick={onLoginClick} className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors">
                Sign In
              </button>}
          </div>
        </div>

        {/* User greeting */}
        {user && <div className="mt-1 text-xs text-gray-600" data-mixed-content="true" data-mixed-content="true">
            Hi, <span className="font-semibold text-green-600">{user.full_name.split(' ')[0]}</span>
            {user.user_type === 'rider' && <span className="ml-1 text-orange-500">(Rider)</span>}
            {user.is_admin && <span className="ml-1 text-purple-500">(Admin)</span>}
          </div>}
      </div>

      {/* Bottom Navigation - Always visible on mobile */}
      <div className="border-t bg-gray-50">
        <div className="flex">
          <button onClick={onHomeClick} className={`flex-1 py-2.5 text-center text-xs font-medium transition-colors ${currentView === 'home' || currentView === 'all-restaurants' ? 'text-green-600 bg-green-50 border-b-2 border-green-600' : 'text-gray-600 hover:text-green-600'}`}>
            <svg className="w-5 h-5 mx-auto mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </button>
          
          {user && <button onClick={onOrdersClick} className={`flex-1 py-2.5 text-center text-xs font-medium transition-colors ${currentView === 'orders' || currentView === 'rider-dashboard' ? 'text-green-600 bg-green-50 border-b-2 border-green-600' : 'text-gray-600 hover:text-green-600'}`}>
              <svg className="w-5 h-5 mx-auto mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              {user.user_type === 'rider' ? 'Orders' : 'My Orders'}
            </button>}

          {/* Admin Panel Button */}
          {user?.is_admin && onAdminClick && <button onClick={onAdminClick} className={`flex-1 py-2.5 text-center text-xs font-medium transition-colors ${currentView === 'admin' ? 'text-purple-600 bg-purple-50 border-b-2 border-purple-600' : 'text-gray-600 hover:text-purple-600'}`}>
              <svg className="w-5 h-5 mx-auto mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Admin
            </button>}

          {(!user || user?.user_type === 'customer') && <button onClick={onCartClick} className="flex-1 py-2.5 text-center text-xs font-medium text-gray-600 hover:text-green-600 transition-colors relative" data-mixed-content="true" data-mixed-content="true">
              <svg className="w-5 h-5 mx-auto mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Cart
              {itemCount > 0 && <span className="absolute top-1 right-1/4 bg-green-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {itemCount}
                </span>}
            </button>}

          {!user && <button onClick={onLoginClick} className="flex-1 py-2.5 text-center text-xs font-medium text-gray-600 hover:text-green-600 transition-colors">
              <svg className="w-5 h-5 mx-auto mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Account
            </button>}
        </div>
      </div>
    </header>;
};
export default Header;