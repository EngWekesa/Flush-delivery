import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  email: string;
  phone: string;
  full_name: string;
  location: string;
  latitude?: number;
  longitude?: number;
  user_type: 'customer' | 'rider' | 'admin';
  is_approved: boolean;
  is_admin: boolean;
  approval_status: 'pending' | 'approved' | 'rejected';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; pendingApproval?: boolean }>;
  signup: (data: SignupData) => Promise<{ success: boolean; error?: string; pendingApproval?: boolean }>;
  register: (email: string, password: string, fullName: string, phone: string, userType: 'customer' | 'rider') => Promise<{ success: boolean; error?: string; pendingApproval?: boolean }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

interface SignupData {
  email: string;
  phone: string;
  password: string;
  full_name: string;
  location: string;
  latitude?: number;
  longitude?: number;
  user_type?: 'customer' | 'rider';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const storedUser = localStorage.getItem('ruiru_eats_user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      // Fetch latest user data from database
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', parsedUser.id)
        .single();
      
      if (data) {
        const userData: User = {
          id: data.id,
          email: data.email,
          phone: data.phone,
          full_name: data.full_name,
          location: data.location || '',
          latitude: data.latitude,
          longitude: data.longitude,
          user_type: data.user_type,
          is_approved: data.is_approved ?? true,
          is_admin: data.is_admin ?? false,
          approval_status: data.approval_status || 'approved',
        };
        setUser(userData);
        localStorage.setItem('ruiru_eats_user', JSON.stringify(userData));
      }
    }
  };

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('ruiru_eats_user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      // Refresh user data in background
      refreshUser();
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; pendingApproval?: boolean }> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !data) {
        return { success: false, error: 'Invalid email or password' };
      }

      // Simple password check (in production, use proper hashing)
      if (data.password_hash !== password) {
        return { success: false, error: 'Invalid email or password' };
      }

      // Check if rider is approved
      if (data.user_type === 'rider' && !data.is_approved) {
        return { 
          success: false, 
          error: 'Your rider account is pending approval. Please wait for admin approval.',
          pendingApproval: true 
        };
      }

      // Check if rider was rejected
      if (data.user_type === 'rider' && data.approval_status === 'rejected') {
        return { 
          success: false, 
          error: 'Your rider application was rejected. Please contact support.',
          pendingApproval: false 
        };
      }

      const userData: User = {
        id: data.id,
        email: data.email,
        phone: data.phone,
        full_name: data.full_name,
        location: data.location || '',
        latitude: data.latitude,
        longitude: data.longitude,
        user_type: data.is_admin ? 'admin' : data.user_type,
        is_approved: data.is_approved ?? true,
        is_admin: data.is_admin ?? false,
        approval_status: data.approval_status || 'approved',
      };

      setUser(userData);
      localStorage.setItem('ruiru_eats_user', JSON.stringify(userData));
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const signup = async (data: SignupData): Promise<{ success: boolean; error?: string; pendingApproval?: boolean }> => {
    try {
      // Check if email already exists
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('email', data.email)
        .single();

      if (existing) {
        return { success: false, error: 'Email already registered' };
      }

      const isRider = data.user_type === 'rider';
      
      const { data: newUser, error } = await supabase
        .from('users')
        .insert([{
          email: data.email,
          phone: data.phone,
          password_hash: data.password, // In production, hash this
          full_name: data.full_name,
          location: data.location,
          latitude: data.latitude,
          longitude: data.longitude,
          user_type: data.user_type || 'customer',
          is_verified: true,
          is_approved: !isRider, // Customers are auto-approved, riders need approval
          is_admin: false,
          approval_status: isRider ? 'pending' : 'approved',
          created_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // If rider, don't log them in - show pending message
      if (isRider) {
        return { 
          success: true, 
          pendingApproval: true 
        };
      }

      const userData: User = {
        id: newUser.id,
        email: newUser.email,
        phone: newUser.phone,
        full_name: newUser.full_name,
        location: newUser.location || '',
        latitude: newUser.latitude,
        longitude: newUser.longitude,
        user_type: newUser.user_type,
        is_approved: newUser.is_approved ?? true,
        is_admin: newUser.is_admin ?? false,
        approval_status: newUser.approval_status || 'approved',
      };

      setUser(userData);
      localStorage.setItem('ruiru_eats_user', JSON.stringify(userData));
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Signup failed. Please try again.' };
    }
  };

  // Alias for register (used by AuthModal)
  const register = async (
    email: string, 
    password: string, 
    fullName: string, 
    phone: string, 
    userType: 'customer' | 'rider'
  ): Promise<{ success: boolean; error?: string; pendingApproval?: boolean }> => {
    return signup({
      email,
      password,
      full_name: fullName,
      phone,
      location: '',
      user_type: userType,
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ruiru_eats_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
