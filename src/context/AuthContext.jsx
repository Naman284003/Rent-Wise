import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api.js';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await api.get('/auth/me');
        if (data.success && data.user) {
          setUser(data.user);
        }
      } catch (err) {
        localStorage.removeItem('rentwise_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.success) {
        localStorage.setItem('rentwise_token', data.token);
        setUser(data.user);
        toast.success(`Signed in as ${data.user.name}`);
        return { success: true, user: data.user };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed. Please check your email and password.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const register = async (formData) => {
    try {
      const { data } = await api.post('/auth/register', formData);
      if (data.success) {
        localStorage.setItem('rentwise_token', data.token);
        setUser(data.user);
        toast.success(`Account created for ${data.user.name}`);
        return { success: true, user: data.user };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('rentwise_token');
      setUser(null);
      toast.success('Signed out');
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const { data } = await api.put('/auth/profile', profileData);
      if (data.success) {
        setUser(data.user);
        toast.success('Profile updated');
        return { success: true, user: data.user };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Profile update failed.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const { data } = await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      if (data.success) {
        toast.success('Password updated');
        return { success: true };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Password change failed.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const quickDemoLogin = async (role) => {
    const creds = {
      admin: { email: 'admin@rentwise.in', password: 'Admin@123' },
      landlord: { email: 'landlord@rentwise.in', password: 'Landlord@123' },
      tenant: { email: 'tenant@rentwise.in', password: 'Tenant@123' },
    };

    const target = creds[role];
    if (target) {
      return await login(target.email, target.password);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        quickDemoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
