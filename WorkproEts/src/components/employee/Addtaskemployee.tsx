import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddTaskEmployee: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [formData, setFormData] = useState({
    projectName: "",
    projectId: "",
    taskName: "",
    priority: "",
    deadline: "",
    description: "",
    status: "Pending",
    estimatedHours: 0,
  });

  const fetchProjectsAndDepartments = async () => {
    try {
      // Fetch departments for the employee
      const departmentsResponse = await axios.post(
        "https://ets-node-1.onrender.com/api/get-departments-for-employee",
        { userId: sessionStorage.getItem("userId") }
      );
      setDepartments(departmentsResponse.data);

      // Fetch projects for the employee
      const projectsResponse = await axios.post(
        "https://ets-node-1.onrender.com/api/getAllProjectNamesForEmployee",
        { userId: sessionStorage.getItem("userId") }
      );
      setProjects(
        projectsResponse.data.map((project: any) => ({
          id: project._id,
          name: project.title,
        }))
      );
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch projects or departments.");
    }
  };

  useEffect(() => {
    fetchProjectsAndDepartments();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleProjectChange = (e: any) => {
    const selectedProject = projects.find(
      (project) => project.id === e.target.value
    );
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

    try {
      const response = await axios.post(
        "https://ets-node-1.onrender.com/api/store-form-data",
        {
          ...formData,
          employeeName: sessionStorage.getItem("userName"),
          employeeDepartment: selectedDepartment,
        }
      );
      if (response.status === 201) {
        toast.success("Task successfully added!");
        setIsModalOpen(false);
        setFormData({
          projectName: "",
          projectId: "",
          taskName: "",
          priority: "",
          deadline: "",
          description: "",
          status: "Pending",
          estimatedHours: 0,
        });
        setSelectedDepartment("");
      } else {
        toast.error("Failed to add task.");
      }
    } catch (error) {
      console.error("Error adding task:", error);
      toast.error("Failed to add task.");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <ToastContainer />
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900">Task Management</h2>
        <Button
          variant="contained"
          onClick={() => setIsModalOpen(true)}
        >
          Add Task
        </Button>
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
            <FormControl fullWidth sx={{ mb: 2 }}>
              <Typography>Department</Typography>
              <Select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                displayEmpty
                required
              >
                <MenuItem value="" disabled>
                  Select a department
                </MenuItem>
                {departments.map((department) => (
                  <MenuItem key={department} value={department}>
                    {department}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography>Project Name</Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
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
            <Typography>Priority</Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
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
            <TextField
              fullWidth
              label="Estimated Hours"
              name="estimatedHours"
              type="number"
              value={formData.estimatedHours}
              onChange={handleInputChange}
              margin="normal"
              required
            />
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
    </div>
  );
};

export default AddTaskEmployee;
