import React from 'react';
import { useNotifications } from '@/contexts/NotificationContext';

interface NotificationPreferencesProps {
  onBack: () => void;
}

const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({ onBack }) => {
  const { 
    notificationsEnabled, 
    toggleNotifications, 
    requestPermission,
    permissionStatus 
  } = useNotifications();

  const handleEnableNotifications = async () => {
    if (permissionStatus === 'default') {
      await requestPermission();
    } else {
      toggleNotifications();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-green-600 text-white px-3 py-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1.5 hover:bg-green-700 rounded-full">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-bold">Notifications</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Main Toggle */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">Push Notifications</p>
                <p className="text-xs text-gray-500">Get order updates</p>
              </div>
            </div>
            <button
              onClick={handleEnableNotifications}
              className={`w-12 h-6 rounded-full transition-colors ${
                notificationsEnabled ? 'bg-green-600' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                notificationsEnabled ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        </div>

        {/* Permission Status */}
        {permissionStatus === 'denied' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-semibold text-red-800 text-sm">Notifications Blocked</p>
                <p className="text-xs text-red-600 mt-1">
                  Please enable notifications in your browser settings to receive order updates.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-semibold text-blue-800 text-sm">Stay Updated</p>
              <p className="text-xs text-blue-600 mt-1">
                Get notified when your order is confirmed, being prepared, and when your rider is on the way.
              </p>
            </div>
          </div>
        </div>

        {/* Notification Types */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-3 border-b">
            <h3 className="font-semibold text-gray-800 text-sm">Notification Types</h3>
          </div>
          <div className="divide-y">
            {[
              { title: 'Order Updates', desc: 'Status changes for your orders', enabled: true },
              { title: 'Promotions', desc: 'Deals and special offers', enabled: false },
              { title: 'New Restaurants', desc: 'When new places join', enabled: false },
            ].map((item, index) => (
              <div key={index} className="p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800 text-sm">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
                <div className={`w-10 h-5 rounded-full ${item.enabled ? 'bg-green-600' : 'bg-gray-300'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow mt-0.5 transition-transform ${
                    item.enabled ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPreferences;
