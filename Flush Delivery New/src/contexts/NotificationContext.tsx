import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface NotificationPreferences {
  orderUpdates: boolean;
  newOrders: boolean;
  promotions: boolean;
  sound: boolean;
}

interface NotificationContextType {
  permission: NotificationPermission;
  preferences: NotificationPreferences;
  requestPermission: () => Promise<boolean>;
  sendNotification: (title: string, options?: NotificationOptions) => void;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => void;
  showInAppNotification: (message: string, type?: 'success' | 'info' | 'warning') => void;
  inAppNotification: { message: string; type: string; show: boolean } | null;
  clearInAppNotification: () => void;
}

const defaultPreferences: NotificationPreferences = {
  orderUpdates: true,
  newOrders: true,
  promotions: false,
  sound: true,
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [preferences, setPreferences] = useState<NotificationPreferences>(() => {
    const stored = localStorage.getItem('notification_preferences');
    return stored ? JSON.parse(stored) : defaultPreferences;
  });
  const [inAppNotification, setInAppNotification] = useState<{ message: string; type: string; show: boolean } | null>(null);

  useEffect(() => {
    // Check current permission status
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('notification_preferences', JSON.stringify(preferences));
  }, [preferences]);

  const requestPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const playNotificationSound = useCallback(() => {
    if (preferences.sound) {
      // Create a simple beep sound using Web Audio API
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.value = 0.3;
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
      } catch (e) {
        console.log('Could not play notification sound');
      }
    }
  }, [preferences.sound]);

  const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
    // Always show in-app notification
    showInAppNotification(options?.body || title, 'info');
    
    // Play sound
    playNotificationSound();

    // Send browser notification if permitted
    if (permission === 'granted' && 'Notification' in window) {
      try {
        const notification = new Notification(title, {
          icon: 'https://d64gsuwffb70l.cloudfront.net/696fd5f1fcde62ac509d3255_1768937404729_5b072970.png',
          badge: 'https://d64gsuwffb70l.cloudfront.net/696fd5f1fcde62ac509d3255_1768937404729_5b072970.png',
          vibrate: [200, 100, 200],
          ...options,
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        // Auto close after 5 seconds
        setTimeout(() => notification.close(), 5000);
      } catch (e) {
        console.log('Could not send notification:', e);
      }
    }
  }, [permission, playNotificationSound]);

  const showInAppNotification = useCallback((message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    setInAppNotification({ message, type, show: true });
    
    // Auto hide after 5 seconds
    setTimeout(() => {
      setInAppNotification(prev => prev ? { ...prev, show: false } : null);
    }, 5000);
  }, []);

  const clearInAppNotification = useCallback(() => {
    setInAppNotification(null);
  }, []);

  const updatePreferences = useCallback((prefs: Partial<NotificationPreferences>) => {
    setPreferences(prev => ({ ...prev, ...prefs }));
  }, []);

  return (
    <NotificationContext.Provider value={{
      permission,
      preferences,
      requestPermission,
      sendNotification,
      updatePreferences,
      showInAppNotification,
      inAppNotification,
      clearInAppNotification,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
