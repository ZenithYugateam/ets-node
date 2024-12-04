import {
  Box,
  Button,
  FormControl,
  MenuItem,
  Modal,
  Select,
  SelectChangeEvent,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import axios from "axios";
import { Clock, Eye, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { TaskViewModal } from "./Dialog_ui/TaskViewModal";
  const AddTaskManagements: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [projects, setProjects] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [taskManagerData, setManagerTaskData] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedTask, setSelectedTask] = useState<any | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
    const [taskId , setTaskId] = useState<string>("");

    const handleViewTask = (task: any) => {
      setSelectedTask(task);
      setIsViewModalOpen(true);  
    };
  
    const initialFormData = {
      projectName: "",
      projectId: "",
      taskName: "",
      employeeName: "",
      priority: "",
      deadline: "",
      description: "",
      managerName: sessionStorage.getItem("userName") || "",
      status: "Pending",
    };
  
    const [formData, setFormData] = useState(initialFormData);
  
    const columns: GridColDef[] = [
      { field: "projectName", headerName: "Project Name", flex: 1 },
      { field: "taskName", headerName: "Task Name", flex: 1 },
      { field: "employeeName", headerName: "Employee Name", flex: 1 },
      {
        field: "priority",
        headerName: "Priority",
        flex: 1,
        renderCell: (params) => (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              params.value === "High"
                ? "bg-red-100 text-red-800"
                : params.value === "Medium"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {params.value}
          </span>
        ),
      },
      {
        field: "deadline",
        headerName: "Deadline",
        flex: 1,
        renderCell: (params) => (
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            {new Date(params.value).toLocaleDateString()}
          </div>
        ),
      },
      { field: "description", headerName: "Description", flex: 2 },
      {
        field: "status",
        headerName: "Status",
        flex: 1,
        renderCell: (params) => (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              params.value === "Completed"
                ? "bg-green-100 text-green-800"
                : params.value === "In Progress"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-blue-100 text-violet-800"
            }`}
          >
            {params.value}
          </span>
        ),
      },
      {
        field: "action",
        headerName: "Action",
        width: 120,
        renderCell: (params) => ( 
          <Button
            variant="contained"
            startIcon={<Eye />}
            onClick={() => {
              handleViewTask(params.row)
              setIsViewModalOpen(true)
              setTaskId(params.row.id)
            }
            }
          >
            View
          </Button>
        ),
      },
    ];
  
    const fetchManagerTasks = async () => {
      setLoading(true);
      try {
        const response = await axios.post(
          "http://localhost:5000/api/get-task-by-manager-name",
          {
            managerName: sessionStorage.getItem("userName"),
          }
        );
        setManagerTaskData(response.data);
      } catch (error) {
        console.error("Error fetching manager tasks:", error);
        toast.error("Failed to fetch tasks");
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      const fetchProjects = async () => {
        try {
          const response = await axios.post(
            "http://localhost:5000/api/getAllProjectNamesForEmployee",
            {
              userId: sessionStorage.getItem("userId"),
            }
          );
  
          const projectData = response.data.map((project: any) => ({
            id: project._id,
            name: project.title,
          }));
  
          setProjects(projectData);
        } catch (error) {
          console.error("Error fetching projects:", error);
          toast.error("Failed to fetch projects");
        }
      };
  
      const fetchEmployees = async () => {
        try {
          const response = await axios.post(
            "http://localhost:5000/api/employees-by-manager",
            {
              managerName: sessionStorage.getItem("userName"),
            }
          );
  
          const employeeData = response.data.map((employee: any) => ({
            id: employee._id,
            name: employee.name,
          }));
  
          setEmployees(employeeData);
        } catch (error) {
          console.error("Error fetching employees:", error);
          toast.error("Failed to fetch employees");
        }
      };
  
      fetchManagerTasks();
      fetchProjects();
      fetchEmployees();
    }, []);
  
    const resetForm = () => {
      setFormData(initialFormData);
    };
  
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    };
  
    const handleProjectChange = (e: SelectChangeEvent<string>) => {
      const selectedProject = projects.find((project) => project.id === e.target.value);
      if (selectedProject) {
        setFormData((prevData) => ({
          ...prevData,
          projectName: selectedProject.name,
          projectId: selectedProject.id,
        }));
      }
    };
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
  
      const updatedFormData = { ...formData, managerName: sessionStorage.getItem("userName") };
  
      try {
        const response = await axios.post(
          "http://localhost:5000/api/store-form-data",
          updatedFormData
        );
        if (response.status === 201) {
          toast.success("Task successfully added!");
          resetForm();
          setIsModalOpen(false);
  
          fetchManagerTasks();
        }
      } catch (error) {
        console.error("Error submitting form data:", error);
        toast.error("Failed to add task");
      }
    };

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <ToastContainer />
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900">Task Management</h2>
          <Button
            variant="contained"
            startIcon={<Plus />}
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
          >
            Add Task
          </Button>
        </div>
  
        <div style={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={taskManagerData.map((task) => ({
              id: task._id,
              ...task,
            }))}
            columns={columns}
            loading={loading}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 5, page: 0 },
              },
            }}
            pageSizeOptions={[5, 10, 20]}
            disableRowSelectionOnClick
          />
        </div>
  
        <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "background.paper",
              borderRadius: 2,
              boxShadow: 24,
              p: 4,
            }}
          >
            <h3 className="text-lg font-medium mb-4">Add Task</h3>
            <form onSubmit={handleSubmit}>
            <Typography> Project Name</Typography>
              <FormControl fullWidth sx={{ mb: 1 }}>
                <Select
                  value={formData.projectId}
                  onChange={handleProjectChange}
                  required
                >
                  {projects.map((project) => (
                    <MenuItem key={project.id} value={project.id}>
                      {project.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Task Name"
                name="taskName"
                value={formData.taskName}
                onChange={handleInputChange}
                margin="normal"
                required
              />
              <Typography> Employee Name</Typography>
              <FormControl fullWidth sx={{ mb: 1 }}>
                <Select
                  name="employeeName"
                  value={formData.employeeName}
                  onChange={(e) =>
                    setFormData((prevData) => ({
                      ...prevData,
                      employeeName: e.target.value,
                    }))
                  }
                  required
                >
                  {employees.map((employee) => (
                    <MenuItem key={employee.id} value={employee.name}>
                      {employee.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography> Priority </Typography>
              <FormControl fullWidth sx={{ mb: 1 }}>
                <Select
                  name="priority"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData((prevData) => ({
                      ...prevData,
                      priority: e.target.value,
                    }))
                  }
                  required
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Deadline"
                name="deadline"
                type="date"
                value={formData.deadline}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                margin="normal"
                required
              />
             <Typography> status</Typography>
              <FormControl fullWidth sx={{ mb: 1 }}>
                
                <Select
                  name="status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prevData) => ({
                      ...prevData,
                      status: e.target.value,
                    }))
                  }
                  required
                >
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                margin="normal"
                multiline
                rows={3}
              />
              <Box mt={2} display="flex" justifyContent="flex-end">
                <Button variant="contained" type="submit" color="primary">
                  Add Task
                </Button>
              </Box>
            </form>
          </Box>
        </Modal>

      <TaskViewModal
          task={selectedTask}
          open={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          taskId = {taskId}
        />
      </div>
    );
  };
  
  export default AddTaskManagements;
  