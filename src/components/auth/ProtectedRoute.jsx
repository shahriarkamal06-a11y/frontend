import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store';
import { Loading } from '../ui';

const ProtectedRoute = ({ children, requiredRole = null, requiredRoles = null }) => {
  const { isAuthenticated, user, isLoading, isInitialized } = useAuthStore();
  const location = useLocation();

  // Show loading while auth is being initialized
  if (!isInitialized || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const resolvedRoles = requiredRoles || (requiredRole ? [requiredRole] : null);

  if (resolvedRoles && resolvedRoles.length > 0) {
    if (user?.role !== 'SUPER_ADMIN' && !resolvedRoles.includes(user?.role)) {
      return <Navigate to="/403" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
