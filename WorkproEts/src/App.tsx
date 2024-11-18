import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import IndexPage from './pages/IndexPage';
import TaskManagement from './components/admin/TaskManagement';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Timesheets from './pages/Timesheets';
import ErrorBoundary from './components/ErrorBoundary';
import LoginForm from './pages/login';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Login route */}
            <Route path="/" element={<LoginForm />} />
            
            {/* Protected Routes */}
            <Route
              path="/admin"
              element={
                <PrivateRoute requiredRole="Admin">
                  <Navbar />
                  <div className="flex">
                    <Sidebar />
                    <main className="flex-1 p-8">
                      <AdminDashboard />
                    </main>
                  </div>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/manager"
              element={
                <PrivateRoute requiredRole="Manager">
                  <Navbar />
                  <div className="flex">
                    <Sidebar />
                    <main className="flex-1 p-8">
                      <ManagerDashboard />
                    </main>
                  </div>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/employee"
              element={
                <PrivateRoute requiredRole="Employee">
                  <Navbar />
                  <div className="flex">
                    <Sidebar />
                    <main className="flex-1 p-8">
                      <EmployeeDashboard />
                    </main>
                  </div>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/timesheets"
              element={
                <PrivateRoute requiredRole="Employee">
                  <Navbar />
                  <div className="flex">
                    <Sidebar />
                    <main className="flex-1 p-8">
                      <Timesheets />
                    </main>
                  </div>
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;