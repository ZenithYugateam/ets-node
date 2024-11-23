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

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Public Route: Login */}
              <Route path="/" element={<LoginForm />} />

              {/* Private Route: Admin */}
              <Route
                path="/admin"
                element={
                  <PrivateRoute requiredRoles={['Admin']}>
                    <Layout>
                      <AdminDashboard />
                    </Layout>
                  </PrivateRoute>
                }
              />

              {/* Private Route: Manager */}
              <Route
                path="/manager"
                element={
                  <PrivateRoute requiredRoles={['Manager']}>
                    <Layout>
                      <ManagerDashboard />
                    </Layout>
                  </PrivateRoute>
                }
              />

              {/* Private Route: Employee */}
              <Route
                path="/employee"
                element={
                  <PrivateRoute requiredRoles={['Employee']}>
                    <Layout>
                      <EmployeeDashboard />
                    </Layout>
                  </PrivateRoute>
                }
              />

              {/* Shared Route: Timesheets */}
              <Route
                path="/timesheets"
                element={
                  <PrivateRoute requiredRoles={['Admin', 'Manager', 'Employee']}>
                    <Layout>
                      <Timesheets />
                    </Layout>
                  </PrivateRoute>
                }
              />
            </Routes>
          </div>
        </BrowserRouter>
      </ErrorBoundary>
    </AuthProvider>
  );
};

export default App;

/**
 * Layout Component
 * This reusable component ensures consistent layout structure across private routes.
 */
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </>
  );
};
