import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  try {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return <>{children}</>;
  } catch (error) {
    console.error('ProtectedRoute:', error);
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
