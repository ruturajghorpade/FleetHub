// FleetHub – Auth Context with Real Backend JWT Authentication & RBAC
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import authService from '@/services/authService';
import authStorage from '@/utils/auth';
import { canAccessRoute, hasAllowedRole } from '@/utils/permissions';
import { showError, showSuccess } from '@/utils/toastUtils';

const AuthContext = createContext();

// Seeded account credentials mapped to each role for rapid testing & switching
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
  const [user, setUser] = useState(() => authStorage.getUser());
  const [activeRole, setActiveRole] = useState(() => authStorage.getActiveRole());
  const [isAuthenticated, setIsAuthenticated] = useState(() => authStorage.hasToken());
  const [loading, setLoading] = useState(true);

  // Initialize: verify token with backend on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = authStorage.getToken();
      if (!token) {
        // No token present -> user is unauthenticated
        authStorage.clearAuth();
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      try {
        const res = await authService.getMe();
        if (res?.user) {
          authStorage.setUser(res.user);
          setUser(res.user);
          setActiveRole(res.user.role);
          setIsAuthenticated(true);
        } else {
          throw new Error('No user data returned');
        }
      } catch {
        // Token expired, revoked, or invalid
        authStorage.clearAuth();
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
      authStorage.setToken(data.accessToken);
      authStorage.setUser(data.user);
      setUser(data.user);
      setActiveRole(data.user.role);
      setIsAuthenticated(true);
      showSuccess(`Welcome back, ${data.user.name}!`);
      return { success: true, user: data.user };
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        (err.request && !err.response ? 'Unable to connect to server. Please try again.' : 'Invalid email or password');
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
      authStorage.setToken(data.accessToken);
      authStorage.setUser(data.user);
      setUser(data.user);
      setActiveRole(data.user.role);
      setIsAuthenticated(true);
      showSuccess(`Switched to ${account.roleTitle} (${data.user.name})`);
    } catch (err) {
      const msg = err.response?.data?.message || `Failed to switch to ${newRole}`;
      showError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Log out
   */
  const logout = useCallback(async () => {
    await authService.logout();
    authStorage.clearAuth();
    setUser(null);
    setIsAuthenticated(false);
    showSuccess('Logged out successfully');
  }, []);

  /**
   * Check if current user has a specific role or one of multiple roles
   */
  const hasRole = useCallback(
    (roleOrRoles) => {
      if (!user?.role) return false;
      const allowed = Array.isArray(roleOrRoles) ? roleOrRoles : [roleOrRoles];
      return hasAllowedRole(user.role, allowed);
    },
    [user]
  );

  /**
   * Check if current user has permission for a specific route or action
   */
  const hasPermission = useCallback(
    (routeOrAction) => {
      if (!user?.role) return false;
      return canAccessRoute(user.role, routeOrAction);
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        activeRole,
        switchRole,
        isAuthenticated,
        loading,
        isLoading: loading,
        login,
        logout,
        hasRole,
        hasPermission,
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
