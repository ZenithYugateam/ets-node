import React from 'react';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  children: JSX.Element;
  requiredRole?: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requiredRole }) => {
  const userId = localStorage.getItem('userId');
  const role = localStorage.getItem('role');

  // Redirect to login if no session exists
  if (!userId || !role) {
    return <Navigate to="/" />;
  }

  // If a specific role is required, ensure the user's role matches
  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" />;
  }

  return children;
};

export default PrivateRoute;
