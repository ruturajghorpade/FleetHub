// FleetHub – Auth Context with Real Backend JWT Authentication
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import authService from '@/services/authService';
import { showError, showSuccess } from '@/utils/toastUtils';

const AuthContext = createContext();

// Seeded account credentials mapped to each role for instant live switching
export const ROLE_ACCOUNTS = {
  super_admin: {
    email: 'admin@fastfleet.in',
    password: 'Password@123',
    roleTitle: 'Super Admin',
    organization: 'FastFleet Logistics HQ',
  },
  client_admin: {
    email: 'manager@dominos.in',
    password: 'Password@123',
    roleTitle: "Domino's Store Admin",
    organization: "Domino's Pizza (Indiranagar)",
  },
  dispatcher: {
    email: 'dispatch@fastfleet.in',
    password: 'Password@123',
    roleTitle: 'Chief Dispatcher',
    organization: 'FastFleet Central Dispatch',
  },
  driver: {
    email: 'rajesh.rider@fastfleet.in',
    password: 'Password@123',
    roleTitle: 'Delivery Partner',
    organization: 'FastFleet Logistics',
  },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('fleethub_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeRole, setActiveRole] = useState(() => {
    return localStorage.getItem('fleethub_active_role') || user?.role || 'super_admin';
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('token');
  });

  const [loading, setLoading] = useState(true);

  // Initialize: verify token with backend on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        // If no token exists initially, auto-login as default super_admin for smooth initial presentation
        try {
          const creds = ROLE_ACCOUNTS.super_admin;
          const data = await authService.login(creds);
          localStorage.setItem('token', data.accessToken);
          localStorage.setItem('fleethub_user', JSON.stringify(data.user));
          localStorage.setItem('fleethub_active_role', data.user.role);
          setUser(data.user);
          setActiveRole(data.user.role);
          setIsAuthenticated(true);
        } catch {
          setUser(null);
          setIsAuthenticated(false);
        } finally {
          setLoading(false);
        }
        return;
      }

      try {
        const res = await authService.getMe();
        if (res?.user) {
          setUser(res.user);
          setActiveRole(res.user.role);
          setIsAuthenticated(true);
          localStorage.setItem('fleethub_user', JSON.stringify(res.user));
          localStorage.setItem('fleethub_active_role', res.user.role);
        }
      } catch {
        // Token expired or invalid
        localStorage.removeItem('token');
        localStorage.removeItem('fleethub_user');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Log in user with email & password against Express backend
   */
  const login = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const data = await authService.login(credentials);
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('fleethub_user', JSON.stringify(data.user));
      localStorage.setItem('fleethub_active_role', data.user.role);
      setUser(data.user);
      setActiveRole(data.user.role);
      setIsAuthenticated(true);
      showSuccess(`Welcome back, ${data.user.name}!`);
      return { success: true, user: data.user };
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password';
      showError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Live role switcher: logs in to backend as that role's real account
   */
  const switchRole = useCallback(async (newRole) => {
    const account = ROLE_ACCOUNTS[newRole];
    if (!account) return;

    setLoading(true);
    try {
      const data = await authService.login({
        email: account.email,
        password: account.password,
      });
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('fleethub_user', JSON.stringify(data.user));
      localStorage.setItem('fleethub_active_role', data.user.role);
      setUser(data.user);
      setActiveRole(data.user.role);
      setIsAuthenticated(true);
      showSuccess(`Switched to ${account.roleTitle} (${data.user.name})`);
    } catch {
      showError(`Failed to switch to ${newRole}`);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Log out
   */
  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    showSuccess('Logged out successfully');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        activeRole,
        switchRole,
        isAuthenticated,
        loading,
        login,
        logout,
      }}
    >
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

export default AuthContext;
