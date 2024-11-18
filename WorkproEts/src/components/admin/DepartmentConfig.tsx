import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { fetchDepartments, createDepartment, updateDepartment, deleteDepartment } from '../../api/admin';

const DepartmentConfig = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const { data: departments, isLoading } = useQuery('departments', fetchDepartments);

  const createDepartmentMutation = useMutation(createDepartment, {
    onSuccess: () => {
      queryClient.invalidateQueries('departments');
      setShowModal(false);
    },
  });

  const updateDepartmentMutation = useMutation(updateDepartment, {
    onSuccess: () => {
      queryClient.invalidateQueries('departments');
      setShowModal(false);
    },
  });

  const deleteDepartmentMutation = useMutation(deleteDepartment, {
    onSuccess: () => {
      queryClient.invalidateQueries('departments');
    },
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-900">
            Department Configuration
          </h2>
          <button
            onClick={() => {
              setSelectedDepartment(null);
              setShowModal(true);
            }}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Department
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {departments?.map((dept) => (
            <div
              key={dept._id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
            >
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  {dept.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {dept.employeeCount} employees
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedDepartment(dept);
                    setShowModal(true);
                  }}
                  className="p-2 text-indigo-600 hover:text-indigo-900"
                >
                  <Edit2 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this department?')) {
                      deleteDepartmentMutation.mutate(dept._id);
                    }
                  }}
                  className="p-2 text-red-600 hover:text-red-900"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DepartmentConfig;