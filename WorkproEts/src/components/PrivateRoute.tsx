import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  children: JSX.Element;
  requiredRoles: string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requiredRoles }) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const userId = sessionStorage.getItem('userId');
    const role = JSON.parse(sessionStorage.getItem('role') || 'null'); // Parse stored role

    console.log('Session Storage in PrivateRoute:', { userId, role });

    if (userId && role && requiredRoles.includes(role)) {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
    }
  }, [requiredRoles]);

  if (isAuthorized === null) {
    return <div>Loading...</div>; // Display loading spinner or placeholder
  }

  if (!isAuthorized) {
    return <Navigate to="/" />;
  }

  return children;
};

export default PrivateRoute;
