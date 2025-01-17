import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

interface PrivateRouteProps {
  children: JSX.Element;
  requiredRoles: string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requiredRoles }) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const userId = sessionStorage.getItem("userId");
    const role = JSON.parse(sessionStorage.getItem("role") || "null");
    const userName = sessionStorage.getItem("userName");

    console.log("Session Storage in PrivateRoute:", { userId, role, userName });

    if (userId && role && requiredRoles.includes(role)) {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
    }
  }, [requiredRoles]);

  if (isAuthorized === null) {
    return (
      <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex justify-center items-center z-20">
        <img
          src="/gifs/DashBoardAnimation.gif" 
          alt="Loading..."
          className="w-60 h-600"
        />
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to="/" />;
  }

  return children;
};

export default PrivateRoute;
