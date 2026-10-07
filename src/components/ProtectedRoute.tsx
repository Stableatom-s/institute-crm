import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-xs font-semibold text-[#050720]/60">Verifying session...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect user to their own valid dashboard if they attempt to view another role's route
    const roleFallbackRoute =
      user.role === 'admin'
        ? '/admin/dashboard'
        : user.role === 'faculty'
        ? '/faculty/dashboard'
        : '/sales/dashboard';

    return <Navigate to={roleFallbackRoute} replace />;
  }

  return <>{children}</>;
};