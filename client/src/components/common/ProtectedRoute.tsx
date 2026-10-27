import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { LoadingSpinner } from './LoadingSpinner.js';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Checking authorization..." />;
  }

  if (!isAuthenticated) {
    // Redirect to login page and remember where user intended to go
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
