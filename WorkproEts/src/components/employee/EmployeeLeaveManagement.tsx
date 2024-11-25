import React, { useState } from 'react';
import { PlusCircle, Calendar, Clock } from 'lucide-react';
import LeaveRequestForm, { LeaveFormData } from '../shared/LeaveRequestForm';
import LeaveStatusBadge from '../shared/LeaveStatusBadge';
import { useLeave } from '../context/LeaveContext';

const CURRENT_USER = {
  name: 'John Doe',
  department: 'Engineering',
  role: 'employee'
};

const EmployeeLeaveManagement: React.FC = () => {
  // const { addLeave, getLeavesByEmployee } = useLeave();
  const [showForm, setShowForm] = useState(false);
  const [editingLeave, setEditingLeave] = useState<any>(null);

  // const leaves = getLeavesByEmployee(CURRENT_USER.name);

  const handleSubmit = (data: LeaveFormData) => {
    addLeave({
      ...data,
      employeeName: CURRENT_USER.name,
      department: CURRENT_USER.department,
      employeeRole: CURRENT_USER.role
    });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">My Leave Requests</h2>
          <p className="mt-1 text-sm text-gray-500">
            View and manage your leave requests
          </p>
        </div>
        <button
          onClick={() => {
            setEditingLeave(null);
            setShowForm(!showForm);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          New Leave Request
        </button>
      </div>

      {showForm && (
        <LeaveRequestForm
          onSubmit={handleSubmit}
          initialData={editingLeave}
          isEditing={!!editingLeave}
        />
      )}

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="divide-y divide-gray-200">
          {leaves.map((leave) => (
            <div key={leave.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <LeaveStatusBadge status={leave.status} />
                  <span className="text-sm font-medium text-gray-900">
                    {leave.type.charAt(0).toUpperCase() + leave.type.slice(1)} Leave
                  </span>
                </div>
              </div>
              <div className="mt-2 sm:flex sm:justify-between">
                <div className="sm:flex">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                    <p>
                      {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {leave.statusUpdatedAt && (
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                    <p>
                      {leave.status !== 'pending' ? `${leave.status.charAt(0).toUpperCase() + leave.status.slice(1)} by ${leave.statusUpdatedBy}` : 'Pending approval'}
                      {' on '}
                      {new Date(leave.statusUpdatedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-2">
                <p className="text-sm text-gray-600">{leave.reason}</p>
              </div>
            </div>
          ))}
        </div>

        {leaves.length === 0 && (
          <div className="text-center py-12">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No leave requests</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new leave request.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeLeaveManagement;