import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  setRole: (role: UserRole) => void;
  logout: () => void;
}

const defaultUsers: Record<UserRole, User> = {
  SALES: {
    id: 'u-sales-1',
    name: 'Shantanu (Sales)',
    email: 'sales@radiquolab.com',
    role: 'SALES',
    inTime: '09:30 AM',
  },
  FACULTY: {
    id: 'u-fac-1',
    name: 'Ajinkya Veer (Faculty)',
    email: 'faculty@radiquolab.com',
    role: 'FACULTY',
    inTime: '09:30 AM',
  },
  ADMIN: {
    id: 'u-admin-1',
    name: 'Tanmay Kalbhor (Admin)',
    email: 'admin@radiquolab.com',
    role: 'ADMIN',
    inTime: '09:15 AM',
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('crm_active_role') as UserRole;
    return saved && defaultUsers[saved] ? saved : 'ADMIN';
  });

  const [user, setUser] = useState<User>(() => defaultUsers[currentRole]);

  useEffect(() => {
    setUser(defaultUsers[currentRole]);
    localStorage.setItem('crm_active_role', currentRole);
  }, [currentRole]);

  const setRole = (role: UserRole) => {
    setCurrentRole(role);
  };

  const logout = () => {
    console.log('Logged out');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: currentRole,
        isAuthenticated: !!user,
        setRole,
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