import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false, requireTutor = false }) => {
  const { isAuthenticated, isAdmin, isTutor, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    // Redirect to unauthorized page if user is not an admin
    return <Navigate to="/unauthorized" replace />;
  }

  if (requireTutor && !isTutor) {
    // Redirect to unauthorized page if user is not a tutor
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute; 