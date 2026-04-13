import { createContext, useContext, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // --- User Session ---
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });

  // --- Admin Session ---
  const [admin, setAdmin] = useState(() => {
    try { return JSON.parse(localStorage.getItem('admin_user')); } catch { return null; }
  });

  const [loading, setLoading] = useState(false);

  // Normal User Signin
  const signin = async (email, password) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/signin', { email, password }, { withCredentials: true });
      const userData = res.data;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Sign in failed' };
    } finally {
      setLoading(false);
    }
  };

  // Normal User Signout
  const signout = async () => {
    try { await axios.post('/api/auth/signout', {}, { withCredentials: true }); } catch (e) {}
    setUser(null);
    localStorage.removeItem('user');
  };

  // Dedicated Admin Signin (to separate logic and storage)
  const adminSignin = async (email, password) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/signin', { email, password }, { withCredentials: true });
      const userData = res.data;
      
      if (userData.role !== 'admin') {
        return { success: false, message: 'Unauthorized: Not an administrator.' };
      }

      setAdmin(userData);
      localStorage.setItem('admin_user', JSON.stringify(userData));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Admin Auth failed' };
    } finally {
      setLoading(false);
    }
  };

  // Dedicated Admin Signout
  const adminSignout = async () => {
    setAdmin(null);
    localStorage.removeItem('admin_user');
  };

  const signup = async (username, email, password) => {
    setLoading(true);
    try {
      await axios.post('/api/auth/signup', { username, email, password });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Sign up failed' };
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (data) => {
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ 
      user, admin, loading, 
      signin, signout, 
      adminSignin, adminSignout,
      signup, updateUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);