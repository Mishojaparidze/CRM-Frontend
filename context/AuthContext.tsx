import React, { createContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { User, AuthResponseData, Permission } from '../types';
import * as api from '../services/mockApiService';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isAdmin: boolean;
  permissions: Permission[];
  hasPermission: (permission: Permission) => boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, fullName: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = sessionStorage.getItem('token');
    if (storedToken) {
      api.setAuthToken(storedToken);
      const storedUser = sessionStorage.getItem('user');
      const storedPerms = sessionStorage.getItem('permissions');
      if (storedUser && storedPerms) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          setPermissions(JSON.parse(storedPerms));
      }
    }
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setPermissions([]);
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('permissions');
    api.setAuthToken(null);
  }, []);

  const handleAuthSuccess = useCallback(async (data: AuthResponseData) => {
    setToken(data.token);
    api.setAuthToken(data.token);
    
    try {
        const userResponse = await api.getUserById(data.userId);
        const fullUser = userResponse.data;
        setUser(fullUser);
        sessionStorage.setItem('user', JSON.stringify(fullUser));

        if (fullUser.role === 'admin') {
            const permsResponse = await api.getUserPermissions(fullUser.id);
            setPermissions(permsResponse.data.permissions);
            sessionStorage.setItem('permissions', JSON.stringify(permsResponse.data.permissions));
        } else {
            setPermissions([]);
            sessionStorage.removeItem('permissions');
        }
        
    } catch (error) {
        console.error("Failed to fetch user details after login", error);
        logout(); // Log out if we can't fetch profile
    }

    sessionStorage.setItem('token', data.token);
  }, [logout]);
  
  const login = useCallback(async (email: string, password: string) => {
    const response = await api.login(email, password);
    await handleAuthSuccess(response.data);
  }, [handleAuthSuccess]);

  const register = useCallback(async (email: string, username: string, fullName: string, password: string) => {
    const response = await api.register(email, username, fullName, password);
    await handleAuthSuccess(response.data);
  }, [handleAuthSuccess]);
  
  const updateUser = useCallback((updatedUserData: Partial<User>) => {
    if (user) {
        const newUser = { ...user, ...updatedUserData };
        setUser(newUser);
        sessionStorage.setItem('user', JSON.stringify(newUser));
    }
  }, [user]);

  const hasPermission = useCallback((permission: Permission): boolean => {
      return permissions.includes(permission);
  }, [permissions]);


  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'admin';

  const value = useMemo(() => ({
    isAuthenticated,
    user,
    token,
    isAdmin,
    permissions,
    hasPermission,
    login,
    register,
    logout,
    updateUser
  }), [isAuthenticated, user, token, isAdmin, permissions, hasPermission, login, register, logout, updateUser]);

  if (isLoading) {
      return (
          <div className="flex items-center justify-center min-h-screen bg-dark-bg">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-brand-primary"></div>
          </div>
      );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};