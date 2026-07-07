import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const MOCK_USER_KEY = 'expense_app_mock_user';
const TOKEN_KEY = 'expense_app_jwt_token';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load credentials if stored in localStorage (Remember Me check)
    const storedUser = localStorage.getItem(MOCK_USER_KEY);
    const storedToken = localStorage.getItem(TOKEN_KEY);
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  // Handle register
  const registerUser = async (name, email, password) => {
    setLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Store custom credentials as the register profile
    const registeredUser = {
      name,
      email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      memberSince: new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
      totalTransactions: 0,
      achievements: ['Financial Beginner']
    };
    
    // Save to simulated database in localStorage
    localStorage.setItem(`db_user_${email}`, JSON.stringify({ ...registeredUser, password }));
    setLoading(false);
    return { success: true };
  };

  // Handle login
  const loginUser = async (email, password, rememberMe) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    // Retrieve from database
    const savedUserString = localStorage.getItem(`db_user_${email}`);
    let targetUser = null;

    if (savedUserString) {
      const dbUser = JSON.parse(savedUserString);
      if (dbUser.password === password) {
        targetUser = {
          name: dbUser.name,
          email: dbUser.email,
          avatar: dbUser.avatar,
          memberSince: dbUser.memberSince,
          totalTransactions: dbUser.totalTransactions || 0,
          achievements: dbUser.achievements || ['Financial Beginner']
        };
      }
    } else {
      // Fallback dummy user for development convenience if login credentials aren't created
      if (email === 'demo@example.com' && password === 'password123') {
        targetUser = {
          name: 'Demo Admin',
          email: 'demo@example.com',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DemoAdmin',
          memberSince: 'January 2026',
          totalTransactions: 150,
          achievements: ['Smart Saver', 'Budget Guru', 'Crypto Explorer']
        };
      }
    }

    if (targetUser) {
      const simulatedToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify(targetUser))}.mock_signature`;
      
      setUser(targetUser);
      setToken(simulatedToken);

      if (rememberMe) {
        localStorage.setItem(MOCK_USER_KEY, JSON.stringify(targetUser));
        localStorage.setItem(TOKEN_KEY, simulatedToken);
      }
      setLoading(false);
      return { success: true };
    } else {
      setLoading(false);
      throw new Error('Invalid email or password. Use demo@example.com / password123, or register a new account.');
    }
  };

  // Update profile details
  const updateProfile = (updatedFields) => {
    const updated = { ...user, ...updatedFields };
    setUser(updated);
    
    // Sync if stored in localStorage
    if (localStorage.getItem(MOCK_USER_KEY)) {
      localStorage.setItem(MOCK_USER_KEY, JSON.stringify(updated));
    }
    
    // Sync in DB
    const savedUserString = localStorage.getItem(`db_user_${user.email}`);
    if (savedUserString) {
      const dbUser = JSON.parse(savedUserString);
      localStorage.setItem(`db_user_${user.email}`, JSON.stringify({ ...dbUser, ...updatedFields }));
    }
  };

  // Handle logout
  const logoutUser = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(MOCK_USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated: !!token,
      registerUser,
      loginUser,
      logoutUser,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
