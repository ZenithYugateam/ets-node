import React, { useEffect, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';

interface TimesheetEntry {
  _id?: string;
  project: string;
  task: string;
  description: string;
  date: string;
}


const TimesheetEntry: React.FC = () => {
  const [timesheets, setTimesheets] = useState<TimesheetEntry[]>([]);
  const [newEntries, setNewEntries] = useState<TimesheetEntry[]>([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchTimesheets = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/timesheets');
      if (!response.ok) {
        throw new Error('Failed to fetch timesheets');
      }
      const data = await response.json();
      setTimesheets(data);
    } catch (error) {
      console.error('Error fetching timesheets:', error);
      setError('Failed to fetch timesheets. Please try again.');
    }
  };

  const addNewEntry = () => {
    setNewEntries([
      ...newEntries,
      { project: '', task: '', description: '', date: new Date().toISOString().split('T')[0] },
    ]);
  };

  const updateNewEntry = (index: number, field: string, value: string) => {
    setNewEntries(
      newEntries.map((entry, i) =>
        i === index ? { ...entry, [field]: value } : entry
      )
    );
  };

  const removeNewEntry = (index: number) => {
    setNewEntries(newEntries.filter((_, i) => i !== index));
  };

  const saveEntries = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/timesheets/save_entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: localStorage.getItem('userId'),
          entries: newEntries,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save timesheet entries');
      }

      setMessage('Timesheet entries saved successfully.');
      setNewEntries([]);
      fetchTimesheets();
    } catch (error) {
      console.error('Error saving timesheet entries:', error);
      setError('Failed to save timesheet entries.');
    }
  };

  useEffect(() => {
    fetchTimesheets();
  }, []);

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h2 className="text-lg font-medium mb-4">Timesheets</h2>

      {/* Error and Success Messages */}
      {error && <p className="text-red-500">{error}</p>}
      {message && <p className="text-green-500">{message}</p>}

      {/* Existing Timesheets */}
      {timesheets.length > 0 ? (
        timesheets.map((timesheet) => (
          <div
            key={timesheet._id} // Unique key
            className="p-4 border border-gray-200 rounded-lg mb-4"
          >
            <h3 className="font-semibold">
              Date: {new Date(timesheet.date).toLocaleDateString()}
            </h3>
            <ul className="mt-2 space-y-2">
              {timesheet.entries.map((entry, index) => (
                <li
                  key={`${timesheet._id}-${index}`} // Unique key for list item
                  className="text-sm"
                >
                  <strong>Project:</strong> {entry.project} <br />
                  <strong>Task:</strong> {entry.task} <br />
                  <strong>Description:</strong> {entry.description}
                </li>
              ))}
            </ul>
          </div>
        ))
      ) : (
        <p>No timesheets available.</p>
      )}

      {/* Add New Entries */}
      <h3 className="text-lg font-medium mt-6">Add New Timesheet Entries</h3>
      {newEntries.map((entry, index) => (
        <div
          key={index} // Use index for temporary key
          className="grid grid-cols-12 gap-4 p-4 border border-gray-200 rounded-lg mb-4"
        >
          <div className="col-span-3">
            <label className="block text-sm font-medium mb-1">Project</label>
            <input
              type="text"
              value={entry.project}
              onChange={(e) => updateNewEntry(index, 'project', e.target.value)}
              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="col-span-3">
            <label className="block text-sm font-medium mb-1">Task</label>
            <input
              type="text"
              value={entry.task}
              onChange={(e) => updateNewEntry(index, 'task', e.target.value)}
              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              value={entry.date}
              onChange={(e) => updateNewEntry(index, 'date', e.target.value)}
              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="col-span-3">
            <label className="block text-sm font-medium mb-1">Description</label>
            <input
              type="text"
              value={entry.description}
              onChange={(e) =>
                updateNewEntry(index, 'description', e.target.value)
              }
              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="col-span-1 flex items-end justify-end">
            <button
              onClick={() => removeNewEntry(index)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      ))}

      {/* Buttons */}
      <div className="mt-4 flex space-x-4">
        <button
          onClick={addNewEntry}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus className="h-5 w-5 m  r-2" />
          Add Entry
        </button>
        {newEntries.length > 0 && (
          <button
            onClick={saveEntries}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Save className="h-5 w-5 mr-2" />
            Save Entries
          </button>
        )}
      </div>
    </div>
  );
};

export default TimesheetEntry;
