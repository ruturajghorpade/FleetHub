// FleetHub – Auth Context (Food Delivery Logistics Multi-Role Simulation)
import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AuthContext = createContext();

export const DEMO_PROFILES = {
  super_admin: {
    _id: 'user-001',
    name: 'Vikram Malhotra',
    email: 'admin@fastfleet.in',
    role: 'super_admin',
    roleTitle: 'Super Admin',
    organization: 'FastFleet Logistics HQ',
    avatar: null,
  },
  client_admin: {
    _id: 'user-002',
    name: 'Sanjay Rawat',
    email: 'manager@dominos.in',
    role: 'client_admin',
    roleTitle: "Domino's Store Admin",
    organization: "Domino's Pizza (Indiranagar)",
    client: {
      _id: 'c001',
      name: "Domino's Pizza",
      companyName: "Domino's Pizza",
      businessType: 'RESTAURANT',
      address: '100ft Road, Indiranagar',
    },
    avatar: null,
  },
  dispatcher: {
    _id: 'user-003',
    name: 'Kavita Joshi',
    email: 'dispatch@fastfleet.in',
    role: 'dispatcher',
    roleTitle: 'Chief Dispatcher',
    organization: 'FastFleet Central Dispatch',
    hub: 'Bengaluru East Hub',
    avatar: null,
  },
  driver: {
    _id: 'user-004',
    driverId: 'd001',
    name: 'Rajesh Kumar',
    email: 'rajesh.rider@fastfleet.in',
    role: 'driver',
    roleTitle: 'Delivery Partner',
    organization: 'FastFleet Logistics',
    phone: '+91 98765 43210',
    vehicle: 'KA01EF1010',
    vehicleModel: 'Ather 450X (EV Bike)',
    avatar: null,
  },
};

const STORAGE_KEY = 'fleethub_active_role';

export const AuthProvider = ({ children }) => {
  const [activeRole, setActiveRole] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || 'super_admin';
  });

  const [user, setUser] = useState(DEMO_PROFILES[activeRole] || DEMO_PROFILES.super_admin);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const profile = DEMO_PROFILES[activeRole] || DEMO_PROFILES.super_admin;
    setUser(profile);
    localStorage.setItem(STORAGE_KEY, activeRole);
  }, [activeRole]);

  const switchRole = useCallback((newRole) => {
    if (DEMO_PROFILES[newRole]) {
      setActiveRole(newRole);
    }
  }, []);

  const login = useCallback((credentials) => {
    setLoading(true);
    setTimeout(() => {
      // If logging in as client, set client_admin
      if (credentials?.email?.includes('dominos') || credentials?.email?.includes('client')) {
        setActiveRole('client_admin');
      } else if (credentials?.email?.includes('dispatch')) {
        setActiveRole('dispatcher');
      } else if (credentials?.email?.includes('rider') || credentials?.email?.includes('driver')) {
        setActiveRole('driver');
      } else {
        setActiveRole('super_admin');
      }
      setIsAuthenticated(true);
      setLoading(false);
    }, 400);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
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
