import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./WorkproEts/src/components/Navbar";
import Sidebar from "./WorkproEts/src/components/Sidebar";
import LeaveRequests from "./WorkproEts/src/components/LeaveRequests";
import EmployeeDashboard from "./WorkproEts/src/pages/EmployeeDashboard";
import ManagerDashboard from "./WorkproEts/src/pages/ManagerDashboard";
import AdminDashboard from "./WorkproEts/src/pages/AdminDashboard";
import Timesheets from "./WorkproEts/src/pages/Timesheets";
import LoginForm from "./WorkproEts/src/pages/Login";
import ErrorBoundary from "./WorkproEts/src/components/ErrorBoundary";
import Profile from "./WorkproEts/src/pages/Profile"; // Import Profile component
import PrivateRoute from "./WorkproEts/src/components/PrivateRoute";
import { AuthProvider } from "./WorkproEts/src/AuthContext";
import LeaveApprovals from "./WorkproEts/src/components/shared/LeaveApprovals";
import WorksheetManagement from "./WorkproEts/src/components/employee/WorksheetManagement";
import { ToastContainer } from "react-toastify";

const adminId = "647f1f77bcf86cd799439011";

// Layout Component
/**
 * Layout Component
 * This reusable component ensures consistent layout structure across private routes.
 */
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <Navbar />
      <ToastContainer 
        position="top-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      {/* Sidebar is included here, only within the Layout for private routes */}
      <Sidebar />
      {/* Main content with left margin to accommodate the fixed sidebar */}
      <main className="ml-64 p-8">
        {children}
      </main>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Public Route: No Layout, hence no Navbar or Sidebar */}
              <Route path="/" element={<LoginForm />} />

              {/* Profile is assumed to be a private route */}
              <Route path="/profile" element={
                <PrivateRoute requiredRoles={["Admin", "Manager", "Employee"]}>
                  <Layout>
                    <Profile />
                  </Layout>
                </PrivateRoute>
              } />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <PrivateRoute requiredRoles={["Admin"]}>
                    <Layout>
                      <AdminDashboard />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/leave-approvals"
                element={
                  <PrivateRoute requiredRoles={["Admin"]}>
                    <Layout>
                      <div className="max-w-7xl mx-auto">
                        <h1 className="text-2xl font-bold text-gray-900 mb-6">
                          Leave Approvals Dashboard
                        </h1>
                        <LeaveApprovals adminId={adminId} />
                      </div>
                    </Layout>
                  </PrivateRoute>
                }
              />

              {/* Manager Routes */}
              <Route
                path="/manager"
                element={
                  <PrivateRoute requiredRoles={["Manager"]}>
                    <Layout>
                      <ManagerDashboard />
                    </Layout>
                  </PrivateRoute>
                }
              />

              {/* Employee Routes */}
              <Route
                path="/employee"
                element={
                  <PrivateRoute requiredRoles={["Employee"]}>
                    <Layout>
                      <EmployeeDashboard />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/leave-requests"
                element={
                  <PrivateRoute requiredRoles={["Manager", "Employee"]}>
                    <Layout>
                      <LeaveRequests />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/work-sheets"
                element={
                  <PrivateRoute requiredRoles={["Admin", "Manager", "Employee"]}>
                    <Layout>
                      <WorksheetManagement />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/timesheets"
                element={
                  <PrivateRoute requiredRoles={["Admin", "Manager", "Employee"]}>
                    <Layout>
                      <Timesheets />
                    </Layout>
                  </PrivateRoute>
                }
              />

              {/* You can add a 404 Not Found route here if desired */}
            </Routes>
          </div>
        </BrowserRouter>
      </ErrorBoundary>
    </AuthProvider>
  );
}

export default App;
