import React, { useState } from 'react';
import { Plus, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { useStore } from './store';

export function FlowSelector() {
  const { flows, currentFlowId, addFlow, updateFlowName, deleteFlow, setCurrentFlowId } = useStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newFlowName, setNewFlowName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [showMenu, setShowMenu] = useState<string | null>(null);

  const handleCreateFlow = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFlowName.trim()) {
      addFlow(newFlowName.trim());
      setNewFlowName('');
      setIsCreating(false);
    }
  };

  const handleUpdateName = (id: string) => {
    if (editName.trim()) {
      updateFlowName(id, editName.trim());
      setEditingId(null);
      setEditName('');
    }
  };

  const handleDeleteFlow = (id: string) => {
    if (flows.length > 1) {
      deleteFlow(id);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-4 overflow-x-auto pb-2">
        {flows.map((flow) => (
          <div
            key={flow.id}
            className={`group relative flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all cursor-pointer min-w-[120px] ${
              flow.id === currentFlowId
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300 bg-white'
            }`}
          >
            {editingId === flow.id ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdateName(flow.id);
                }}
                className="flex-1"
              >
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                  onBlur={() => handleUpdateName(flow.id)}
                />
              </form>
            ) : (
              <>
                <div
                  className="flex-1 font-medium truncate"
                  onClick={() => setCurrentFlowId(flow.id)}
                >
                  {flow.name}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(showMenu === flow.id ? null : flow.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded-full transition-all"
                >
                  <MoreVertical size={16} className="text-gray-500" />
                </button>
                {showMenu === flow.id && (
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[120px] z-10">
                    <button
                      onClick={() => {
                        setEditingId(flow.id);
                        setEditName(flow.name);
                        setShowMenu(null);
                      }}
                      className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Edit2 size={14} />
                      Rename
                    </button>
                    {flows.length > 1 && (
                      <button
                        onClick={() => {
                          handleDeleteFlow(flow.id);
                          setShowMenu(null);
                        }}
                        className="w-full px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        ))}

        {isCreating ? (
          <form onSubmit={handleCreateFlow} className="min-w-[200px]">
            <input
              type="text"
              value={newFlowName}
              onChange={(e) => setNewFlowName(e.target.value)}
              placeholder="Enter flow name"
              className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              onBlur={() => {
                if (!newFlowName.trim()) {
                  setIsCreating(false);
                }
              }}
            />
          </form>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg border-2 border-dashed border-blue-300 transition-colors"
          >
            <Plus size={20} />
            New Flow
          </button>
        )}
      </div>
    </div>
  );
}