import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

interface PrivateRouteProps {
  children: JSX.Element;
  requiredRole?: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requiredRole }) => {
  const [userName, setUserName] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const userId = sessionStorage.getItem('userId'); // Retrieve userId from sessionStorage

  // Log session details for debugging
  console.log('Session Start:', { userId, role });

  // Fetch user details on component mount
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (userId) {
        console.log('Fetching user details for userId:', userId); // Log API call start
        try {
          const response = await fetch(`http://localhost:5000/api/users/${userId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch user details');
          }

          const data = await response.json();
          console.log('User details fetched successfully:', data); // Log API call success
          setUserName(data.name);
          setRole(data.role);

          // Update sessionStorage in case it wasn't set
          sessionStorage.setItem('role', data.role);

          // Navigate to the specific dashboard based on the role
          switch (data.role) {
            case 'Admin':
              navigate('/admin');
              break;
            case 'Manager':
              navigate('/manager');
              break;
            case 'Employee':
              navigate('/employee');
              break;
            default:
              console.warn('Unknown role, redirecting to login.');
              navigate('/');
          }
        } catch (error) {
          console.error('Error fetching user details:', error); // Log API error
          navigate('/'); // Redirect to login on error
        }
      } else {
        console.warn('No userId found in sessionStorage'); // Log missing userId
        navigate('/'); // Redirect to login if no session exists
      }
    };

    fetchUserDetails();
  }, [userId, navigate]);

  // If a specific role is required, ensure the user's role matches
  if (requiredRole && role !== requiredRole) {
    console.warn(
      `Access denied: User role "${role}" does not match required role "${requiredRole}". Redirecting to login.`
    ); // Log access denial
    return <Navigate to="/" />;
  }

  // Render the children if access is granted
  return (
    <>
      {/* Display user name as a greeting */}
      {userName && (
        <div className="text-gray-500 text-sm">Welcome, {userName}</div>
      )}
      {children}
    </>
  );
};

export default PrivateRoute;
