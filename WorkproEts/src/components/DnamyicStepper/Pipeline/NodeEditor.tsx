import React from 'react';
import { X } from 'lucide-react';
import { useStore } from './store';
import { FormBuilder } from './FormBuilder/FormBuilder';
import { FormData } from './types';

export function NodeEditor() {
  const { selectedNode, setSelectedNode, updateNode } = useStore();

  if (!selectedNode) return null;

  const handleFormChange = (formData: FormData) => {
    updateNode(selectedNode.id, {
      ...selectedNode.data,
      form: formData,
    });
  };

  return (
    <>
      {/* Mobile overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
        onClick={() => setSelectedNode(null)}
      />
      
      <div className="fixed right-0 top-0 h-full w-full md:w-[600px] bg-white shadow-2xl flex flex-col z-20 transition-all duration-300 overflow-hidden">
        <div className="sticky top-0 p-4 md:p-6 border-b border-gray-200 flex justify-between items-center bg-white z-30">
          <h3 className="text-lg md:text-xl font-bold text-gray-800">Edit Node</h3>
          <button
            onClick={() => setSelectedNode(null)}
            className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 md:space-y-8">
          <div className="space-y-4 md:space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Label
              </label>
              <input
                type="text"
                value={selectedNode.data.label}
                onChange={(e) =>
                  updateNode(selectedNode.id, {
                    ...selectedNode.data,
                    label: e.target.value,
                  })
                }
                className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={selectedNode.data.description}
                onChange={(e) =>
                  updateNode(selectedNode.id, {
                    ...selectedNode.data,
                    description: e.target.value,
                  })
                }
                rows={3}
                className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 md:pt-8">
            <h4 className="text-base md:text-lg font-medium text-gray-800 mb-4 md:mb-6">Form Builder</h4>
            <FormBuilder
              formData={selectedNode.data.form || { questions: [] }}
              onChange={handleFormChange}
            />
          </div>
        </div>
      </div>
    </>
  );
}