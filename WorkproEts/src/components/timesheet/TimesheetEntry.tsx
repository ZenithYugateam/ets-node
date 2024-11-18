import React, { useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Snackbar, IconButton } from '@mui/material';
import { CheckCircle, Error } from '@mui/icons-material';

interface TimesheetEntryProps {
  selectedDate: Date;
}

const TimesheetEntry: React.FC<TimesheetEntryProps> = ({ selectedDate }) => {
  const [entries, setEntries] = useState([
    { id: 1, project: '', task: '', Date: '', description: '' },
  ]);

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<'success' | 'error'>('success');

  const addEntry = () => {
    setEntries([
      ...entries,
      {
        id: entries.length + 1,
        project: '',
        task: '',
        Date: '',
        description: '',
      },
    ]);
  };

  const removeEntry = (id: number) => {
    setEntries(entries.filter((entry) => entry.id !== id));
  };

  const updateEntry = (id: number, field: string, value: string) => {
    setEntries(
      entries.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  const handleButton = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/save_entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: selectedDate,
          entries: entries.map(({ project, task, Date, description }) => ({
            project,
            task,
            Date: Number(Date),
            description,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save entries');
      }

      const result = await response.json();
      console.log('Entries saved:...............', result);
      setMessage('Entries saved successfully!');
      setSeverity('success');
    } catch (error) {
      console.error('Error saving entries:', error);
      setMessage('Error saving entries!');
      setSeverity('error');
    } finally {
      setOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setOpen(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-900">
            Time Entry for {format(selectedDate, 'MMMM d, yyyy')}
          </h2>
          <button
            onClick={addEntry}
            className="flex items-center px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Entry
          </button>
        </div>

        <div className="space-y-4">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="grid grid-cols-12 gap-4 p-4 border border-gray-100 rounded-lg"
            >
              <div className="col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project
                </label>
                <select
                  value={entry.project}
                  onChange={(e) =>
                    updateEntry(entry.id, 'project', e.target.value)
                  }
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select Project</option>
                  <option value="project1">Project Alpha</option>
                  <option value="project2">Project Beta</option>
                </select>
              </div>

              <div className="col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task
                </label>
                <select
                  value={entry.task}
                  onChange={(e) =>
                    updateEntry(entry.id, 'task', e.target.value)
                  }
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select Task</option>
                  <option value="task1">Development</option>
                  <option value="task2">Design</option>
                  <option value="task3">Testing</option>
                </select>
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="Date"
                  // min="0"
                  // max="24"
                  value={entry.Date}
                  onChange={(e) =>
                    updateEntry(entry.id, 'Date', e.target.value)
                  }
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="col-span-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={entry.description}
                  onChange={(e) =>
                    updateEntry(entry.id, 'description', e.target.value)
                  }
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="col-span-1 flex items-end justify-end">
                <button
                  onClick={() => removeEntry(entry.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleButton}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Save className="h-5 w-5 mr-2" />
            Save Entries
          </button>
        </div>
      </div>

      {/* Snackbar for notifications */}
      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={message}
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleCloseSnackbar}
          >
            {severity === 'success' ? (
              <CheckCircle className="text-green-500" />
            ) : (
              <Error className="text-red-500" />
            )}
          </IconButton>
        }
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        ContentProps={{
          style: {
            backgroundColor: severity === 'success' ? '#4caf50' : '#f44336',
          },
        }}
      />
    </div>
  );
};

export default TimesheetEntry;
