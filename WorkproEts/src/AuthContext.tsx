import React, { createContext, useState, useEffect } from "react";

interface AuthContextType {
  userId: string | null;
  role: string | null;
  userName: string | null;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  userId: null,
  role: null,
  userName: null,
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = sessionStorage.getItem("userId");
    const storedRole = JSON.parse(sessionStorage.getItem("role") || "null"); // Parse stored role
    const storedUserName = sessionStorage.getItem("userName");

    console.log("AuthProvider Session Storage:", {
      userId: storedUserId,
      role: storedRole,
      userName: storedUserName,
    });

    setUserId(storedUserId);
    setRole(storedRole);
    setUserName(storedUserName);
  }, []);

  const logout = () => {
    sessionStorage.clear();
    setUserId(null);
    setRole(null);
    setUserName(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ userId, role, userName, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
