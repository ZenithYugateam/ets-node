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
import Profile from "./pages/Profile";
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider } from "./AuthContext";
import LeaveApprovals from "./components/shared/LeaveApprovals";
import WorksheetManagement from "./components/employee/WorksheetManagement";
import { NotificationProvider } from "./components/context/NotificationContext";
import Hrdashboard from "./components/Hr/Hrdasboard";
import UsersView from "./components/Hr/Pages/UsersView";
import Side from "./components/Hr/Side";
import ClientsPage from "./components/Hr/Pages/ClientsPage";
import StudentsPage from "./components/Hr/Pages/StudentsPage";

const adminId = "647f1f77bcf86cd799439011";

// Layout Component with improved responsiveness
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow">
        <Navbar onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      </div>

      <div className="flex pt-16">
        {/* Sidebar */}
        <div
          className={`fixed top-16 bottom-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />
        </div>

        {/* Overlay for Mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0 lg:ml-64">
          <main className="relative h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="p-6 max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
};




function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ErrorBoundary>
          <BrowserRouter>
            <div className="min-h-screen bg-gray-50">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<LoginForm />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/HRDashboard" element={<Hrdashboard />} />
                <Route path="/Userview" element={<UsersView />} />
                <Route path="/Side" element={<Side />} />
                <Route path="/clients" element={<ClientsPage />} />
                <Route path="/students" element={<StudentsPage />} />

                {/* Protected routes with Layout */}
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
                        <LeaveApprovals adminId={adminId} />
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
              </Routes>
            </div>
          </BrowserRouter>
        </ErrorBoundary>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;