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
import { NotificationProvider } from "././components/context/NotificationContext"; 
import Dashboard from "./components/IMS/Dashboard";
import DayDetails from "./components/shared/AttendenceView/pages/DayDetails";
import Calendar from "./components/shared/AttendenceView/pages/Calender/Calender";
import AccessList from "./components/shared/AccessComponents/AccessList";
import VisualAttendence from "./components/shared/Visualizations/Attendence/VisualAttendence";
import Stepper from "./components/DnamyicStepper/Stepper";

const adminId = "647f1f77bcf86cd799439011";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <Navbar />
      <Sidebar />
      <main className="p-4 lg:ml-64 lg:p-8">{children}</main>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        {" "}
        <ErrorBoundary>
          <BrowserRouter>
            <div className="min-h-screen bg-gray-50">
              <Routes>
                <Route path="/" element={<LoginForm />} />
                <Route path="/StepperDynamic" element={<Stepper />} />
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute
                      requiredRoles={["Admin", "Manager", "Employee"]}
                    >
                      <Layout>
                        <Profile />
                      </Layout>
                    </PrivateRoute>
                  }
                />

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
                  path="/attendance-view"
                  element={
                    <PrivateRoute
                    requiredRoles={["Admin", "Manager"]}
                    >
                      <Layout>
                      <Calendar />
                      </Layout>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/attendance-view/:date"
                  element={
                    <PrivateRoute
                    requiredRoles={["Admin", "Manager"]}
                    >
                      <Layout>
                      <DayDetails />
                      </Layout>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/inventory"
                  element={
                    <PrivateRoute requiredRoles={["Admin", "Manager"]}>
                      <Layout>
                        <Dashboard />
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

                <Route
                  path="/access-components"
                  element={
                    <PrivateRoute
                      requiredRoles={["Admin"]}
                    >
                      <Layout>
                        <AccessList />
                      </Layout>
                    </PrivateRoute>
                  }
                />
                 <Route
                  path="/visualization"
                  element={
                    <PrivateRoute
                      requiredRoles={["Admin" , "Manager"]}
                    >
                      <Layout>
                        <VisualAttendence />
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
