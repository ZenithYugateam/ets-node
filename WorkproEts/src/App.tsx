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

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="flex">
            <Sidebar />
            <main className="flex-1 p-8">
              <Routes>
                <Route path="/" element={<IndexPage />} />
                <Route path="/employee" element={<EmployeeDashboard />} />
                <Route path="/manager" element={<ManagerDashboard />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/timesheets" element={<Timesheets />} />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;