// src/App.tsx

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
import { NotificationProvider } from "././components/context/NotificationContext"; // Import NotificationProvider
import Hrdashboard from "./components/Hr/Hrdasboard";
import UsersView from "./components/Hr/Pages/UsersView";
import Side from "./components/Hr/Side";
import ClientsPage from './components/Hr/Pages/ClientsPage';
import StudentsPage from './components/Hr/Pages/StudentsPage';


const CURRENT_USER_ROLE = "employee";
const adminId = "647f1f77bcf86cd799439011";

// Layout Component
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <Navbar />
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
              <Route path="/HRDashboard" element={<Hrdashboard />}></Route>
              <Route path="/Userview" element={<UsersView />}></Route>
              <Route path="/Side" element={<Side />}></Route>
              <Route path="/clients" element={<ClientsPage />} />
              <Route path="/students" element={<StudentsPage />} />
              
            </Routes>
          </div>
        </BrowserRouter>
      </ErrorBoundary>
    </AuthProvider>
  );
}

export default App;