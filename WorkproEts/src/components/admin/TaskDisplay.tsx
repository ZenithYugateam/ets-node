import { useEffect, useState } from "react";
import axios from "axios";
import { TaskStepperDisplay } from "./TaskStepperDisplay";

const ManagerTasksDisplay = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get("http://localhost:5001/api/manager-tasks");
        setTasks(response.data.tasks || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch tasks");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16 mb-4"></div>
          <p className="text-lg font-semibold text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-lg font-bold text-red-500">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <h1 className="text-3xl font-extrabold text-center text-gray-700 mb-8">All Tasks</h1>
      {Array.isArray(tasks) && tasks.length > 0 ? (
        <div className="overflow-x-auto shadow-md rounded-lg bg-white">
          <table className="table-auto w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
              <tr>
                <th className="px-4 py-2" style={{ width: "150px" }}>Task Name</th>
                <th className="px-4 py-2" style={{ width: "150px" }}>Project Name</th>
                <th className="px-4 py-2" style={{ width: "150px" }}>Employee Name</th>
                <th className="px-4 py-2" style={{ width: "100px" }}>Priority</th>
                <th className="px-4 py-2" style={{ width: "130px" }}>Deadline</th>
                <th className="px-4 py-2" style={{ width: "200px" }}>Description</th>
                <th className="px-4 py-2" style={{ width: "150px" }}>Manager Name</th>
                <th className="px-4 py-2" style={{ width: "100px" }}>Status</th>
                <th className="px-4 py-2" style={{ width: "150px" }}>Remarks</th>
                <th className="px-4 py-2" style={{ width: "150px" }}>Notes</th>
                <th className="px-4 py-2" style={{ width: "200px" }}>Selected Employees</th>
                <th className="px-4 py-2" style={{ width: "130px" }}>Drone Required</th>
                <th className="px-4 py-2" style={{ width: "130px" }}>DGPS Required</th>
                <th className="px-4 py-2" style={{ width: "150px" }}>Estimated Hours</th>
                <th className="px-4 py-2" style={{ width: "100px" }}>Accepted</th>
                <th className="px-4 py-2" style={{ width: "150px" }}>Accepted At</th>
                <th className="px-4 py-2" style={{ width: "150px" }}>Completed At</th>
                <th className="px-4 py-2" style={{ width: "150px" }}>Completed Time (Hours)</th>
                <th className="px-4 py-2 text-center" style={{ width: "100px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr
                  key={task._id}
                  className="border-b hover:bg-gray-50 transition duration-200 ease-in-out"
                >
                  <td className="px-4 py-2 font-medium text-gray-900">{task.taskName}</td>
                  <td className="px-4 py-2">{task.projectName}</td>
                  <td className="px-4 py-2">{task.employeeName}</td>
                  <td className="px-4 py-2">{task.priority}</td>
                  <td className="px-4 py-2">{new Date(task.deadline).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{task.description}</td>
                  <td className="px-4 py-2">{task.managerName}</td>
                  <td className="px-4 py-2">{task.status}</td>
                  <td className="px-4 py-2">{task.remarks.join(", ") || "None"}</td>
                  <td className="px-4 py-2">{task.notes.join(", ") || "None"}</td>
                  <td className="px-4 py-2">{task.selectedEmployees.join(", ") || "None"}</td>
                  <td className="px-4 py-2">{task.droneRequired ? "Yes" : "No"}</td>
                  <td className="px-4 py-2">{task.dgpsRequired ? "Yes" : "No"}</td>
                  <td className="px-4 py-2">{task.estimatedHours || "Not Specified"}</td>
                  <td className="px-4 py-2">{task.accepted ? "Yes" : "No"}</td>
                  <td className="px-4 py-2">{task.acceptedAt ? new Date(task.acceptedAt).toLocaleDateString() : "N/A"}</td>
                  <td className="px-4 py-2">{task.completedAt ? new Date(task.completedAt).toLocaleDateString() : "N/A"}</td>
                  <td className="px-4 py-2">{task.completedTime || "Not Specified"}</td>
                  <td className="px-4 py-2 text-center">
                    <button
                      className="px-4 py-2 text-white bg-blue-500 rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-150"
                      onClick={() => setSelectedTaskId(task._id)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-lg text-gray-600">No tasks found.</p>
      )}
      {selectedTaskId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className="relative bg-white w-full max-w-5xl max-h-[90%] p-6 rounded-lg shadow-lg overflow-y-auto"
            style={{ minHeight: "400px", minWidth: "600px" }}
          >
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Task Details</h2>
            <TaskStepperDisplay managerTaskId={selectedTaskId} />
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              onClick={() => setSelectedTaskId(null)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerTasksDisplay;
