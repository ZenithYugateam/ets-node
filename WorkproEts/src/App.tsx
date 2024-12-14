import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import LeaveRequests from "./components/LeaveRequests";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Timesheets from "./pages/Timesheets";
import LoginForm from "./pages/Login";
import ErrorBoundary from "./components/ErrorBoundary";
import Profile from "./pages/Profile"; // Import Profile component
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider } from "./AuthContext";
import LeaveApprovals from "./components/shared/LeaveApprovals";
import WorksheetManagement from "./components/employee/WorksheetManagement";
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
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">{children}</main>
      </div>
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
              <Route path="/" element={<LoginForm />} />
              <Route path="/profile" element={<Profile />} />{" "}
              <Route
                path="/admin"
                element={
                  <PrivateRoute requiredRoles={["Admin"]}>
                    <Layout>
                      <AdminDashboard />
                      {/* <div className="max-w-7xl mx-auto">
                        <h1 className="text-2xl font-bold text-gray-900 mb-6">
                          Leave Management Dashboard
                        </h1> */}
                        {/* <LeaveApprovals adminId={adminId} /> */}
                      {/* </div> */}
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
              <Route
                path="/manager"
                element={
                  <PrivateRoute requiredRoles={["Manager"]}>
                    <Layout>
                      <ManagerDashboard />
                      {/* <div className="max-w-7xl mx-auto">
                        <h1 className="text-2xl font-bold text-gray-900 mb-6">
                          Leave Management Dashboard
                        </h1>
                        <LeaveApprovals adminId={adminId} />
                      </div> */}
                    </Layout>
                  </PrivateRoute>
                }
              />
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
                  <PrivateRoute
                    requiredRoles={["Admin", "Manager", "Employee"]}
                  >
                    <Layout>
                      <WorksheetManagement />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/timesheets"
                element={
                  <PrivateRoute
                    requiredRoles={["Admin", "Manager", "Employee"]}
                  >
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
}

export default App;
