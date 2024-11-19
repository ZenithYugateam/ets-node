import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Timesheets from './pages/Timesheets';
import LoginForm from './pages/Login';
import ErrorBoundary from './components/ErrorBoundary';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './AuthContext';

function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Login Route */}
              <Route path="/" element={<LoginForm />} />

              {/* Admin Route */}
              <Route
                path="/admin"
                element={
                  <PrivateRoute roles={['Admin']}>
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

              {/* Manager Route */}
              <Route
                path="/manager"
                element={
                  <PrivateRoute roles={['Manager']}>
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

              {/* Employee Route */}
              <Route
                path="/employee"
                element={
                  <PrivateRoute roles={['Employee']}>
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

              {/* Timesheets Route (Accessible to Admins, Managers, and Employees) */}
              <Route
                path="/timesheets"
                element={
                  <PrivateRoute roles={['Admin', 'Manager', 'Employee']}>
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
    </AuthProvider>
  );
}

export default App;
