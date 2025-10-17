import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    // Helper function to check role match (handles both numeric and string roles)
    const roleMatches = (userRole, requiredRole) => {
      // Map numeric roles to strings
      const roleMap = { 0: 'Buyer', 1: 'Seller', 2: 'Administrator' };
      const normalizedUserRole = typeof userRole === 'number' ? roleMap[userRole] : userRole;
      const normalizedRequiredRole = typeof requiredRole === 'number' ? roleMap[requiredRole] : requiredRole;
      return normalizedUserRole === normalizedRequiredRole;
    };

    if (Array.isArray(requiredRole)) {
      if (!requiredRole.some(role => roleMatches(user.role, role))) {
        return <Navigate to="/" replace />;
      }
    } else {
      if (!roleMatches(user.role, requiredRole)) {
        return <Navigate to="/" replace />;
      }
    }
  }

  return children;
};

export default PrivateRoute;

