import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '../constants/api';

const AuthContext = createContext(null);
const STORAGE_KEY = 'growshop_admin_token';

export function AuthProvider({ children }) {
  const [adminToken, setAdminToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((token) => {
        if (token) setAdminToken(token);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const response = await axios.post(`${API_BASE_URL}/admin/login`, { email, password });
    const token = response.data.token;
    await AsyncStorage.setItem(STORAGE_KEY, token);
    setAdminToken(token);
    return response.data;
  };

  const logout = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setAdminToken(null);
  };

  return (
    <AuthContext.Provider value={{ adminToken, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
