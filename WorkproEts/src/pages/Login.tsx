import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import dynamic from "next/dynamic";

const Spline = dynamic(() => import("@splinetool/react-spline"), {
  ssr: false,
});

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); 
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); 

    try {
      const response = await fetch("https://ets-node-1.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        sessionStorage.setItem("userId", data.user.id);
        sessionStorage.setItem("role", JSON.stringify(data.user.role));
        sessionStorage.setItem("userName", data.user.name);
        sessionStorage.setItem("department", JSON.stringify(data.user.departments));

        navigate(`/${data.user.role.toLowerCase()}`);
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("An error occurred during login. Please try again.");
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="relative w-full h-screen">
      <div className="absolute bottom-0 right-0 w-[150px] h-[50px] backdrop-blur-lg bg-transparent z-10 opacity-0" />
      <div className="absolute inset-0 flex justify-center items-center">
        <form
          onSubmit={handleLogin}
          className="bg-white shadow-md rounded px-8 pt-6 pb-8 w-full max-w-md z-10"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            disabled={loading} 
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>

      {loading && (
        <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex justify-center items-center z-20">
          <img
          src="/gifs/LoginAnimation.gif"
            alt="Loading..."
            className="w-40 h-40"
          />
        </div>
      )}

    </div>
  );
};

export default LoginForm;
