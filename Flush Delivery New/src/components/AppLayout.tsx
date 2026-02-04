import React, { useState } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { OrderProvider } from '@/contexts/OrderContext';
import { NotificationProvider, useNotifications } from '@/contexts/NotificationContext';
import { Restaurant } from '@/data/restaurants';
import Header from './Header';
import AuthModal from './AuthModal';
import HomePage from './HomePage';
import AllRestaurants from './AllRestaurants';
import RestaurantDetail from './RestaurantDetail';
import Cart from './Cart';
import OrderTracking from './OrderTracking';
import RiderDashboard from './RiderDashboard';
import NotificationPreferences from './NotificationPreferences';
import AdminPanel from './AdminPanel';

type View = 'home' | 'all-restaurants' | 'restaurant-detail' | 'orders' | 'rider-dashboard' | 'notifications' | 'admin';

// In-app notification toast component
const NotificationToast: React.FC = () => {
  const { inAppNotification, clearInAppNotification } = useNotifications();

  if (!inAppNotification?.show) return null;

  const bgColor = inAppNotification.type === 'success' 
    ? 'bg-green-600' 
    : inAppNotification.type === 'warning' 
    ? 'bg-yellow-500' 
    : 'bg-blue-600';

  return (
    <div className={`fixed top-2 right-2 left-2 ${bgColor} text-white px-3 py-2 rounded-lg shadow-lg z-50 flex items-center justify-between`}>
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <span className="text-xs font-medium">{inAppNotification.message}</span>
      </div>
      <button onClick={clearInAppNotification} className="p-1 hover:bg-white/20 rounded">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCart, setShowCart] = useState(false);

  const handleRestaurantClick = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setCurrentView('restaurant-detail');
  };

  const handleViewAllClick = () => {
    setCurrentView('all-restaurants');
  };

  const handleHomeClick = () => {
    setCurrentView('home');
    setSelectedRestaurant(null);
  };

  const handleOrdersClick = () => {
    if (user?.user_type === 'rider') {
      setCurrentView('rider-dashboard');
    } else {
      setCurrentView('orders');
    }
  };

  const handleAdminClick = () => {
    setCurrentView('admin');
  };

  const handleCartClick = () => {
    setShowCart(true);
  };

  const handleLoginClick = () => {
    setShowAuthModal(true);
  };

  const handleOrderSuccess = () => {
    setCurrentView('orders');
  };

  const handleBack = () => {
    if (currentView === 'restaurant-detail') {
      setCurrentView('all-restaurants');
    } else if (currentView === 'notifications') {
      setCurrentView('home');
    } else if (currentView === 'admin') {
      setCurrentView('home');
    } else {
      setCurrentView('home');
    }
    setSelectedRestaurant(null);
  };

  const handleNotificationsClick = () => {
    setCurrentView('notifications');
  };

  // Render based on current view
  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return (
          <HomePage
            onRestaurantClick={handleRestaurantClick}
            onViewAllClick={handleViewAllClick}
          />
        );
      case 'all-restaurants':
        return (
          <AllRestaurants
            onRestaurantClick={handleRestaurantClick}
            onBack={handleHomeClick}
          />
        );
      case 'restaurant-detail':
        return selectedRestaurant ? (
          <RestaurantDetail
            restaurant={selectedRestaurant}
            onBack={handleBack}
            onLoginRequired={() => setShowAuthModal(true)}
          />
        ) : null;
      case 'orders':
        return <OrderTracking onBack={handleHomeClick} />;
      case 'rider-dashboard':
        return <RiderDashboard onBack={handleHomeClick} />;
      case 'notifications':
        return <NotificationPreferences onBack={handleBack} />;
      case 'admin':
        return <AdminPanel onBack={handleHomeClick} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 max-w-lg mx-auto relative">
      {/* Notification Toast */}
      <NotificationToast />

      {/* Header - shown on home and all-restaurants pages */}
      {(currentView === 'home' || currentView === 'all-restaurants') && currentView !== 'all-restaurants' && (
        <Header
          onCartClick={handleCartClick}
          onLoginClick={handleLoginClick}
          onOrdersClick={handleOrdersClick}
          onAdminClick={handleAdminClick}
          currentView={currentView}
          onHomeClick={handleHomeClick}
        />
      )}

      {/* Main Content */}
      {renderContent()}

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* Cart Modal */}
      <Cart
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Floating Notification Button */}
      {user && currentView === 'home' && (
        <button
          onClick={handleNotificationsClick}
          className="fixed bottom-20 right-4 w-10 h-10 bg-gray-700 text-white rounded-full shadow-lg flex items-center justify-center z-40"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
      )}
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <OrderProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </OrderProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default AppLayout;
