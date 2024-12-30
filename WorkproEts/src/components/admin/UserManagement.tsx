import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import {
  Box,
  Button,
  Modal,
  TextField,
  MenuItem,
  Typography,
  Chip,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import DepartmentModel from "./DepartmentModel";
import { Autocomplete } from "@mui/material";

// Interfaces
interface DepartmentFormData {
  name: string;
  description: string;
  subDepartments: {
    name: string;
    description: string;
  }[];
}
interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: "active" | "inactive";
}

interface FormData {
  adminId: string;
  name: string;
  email: string;
  password: string;
  role: string;
  departments: string[]; // Updated to support multiple departments
  subDepartments?: string[]; // Updated to support multiple sub-departments
  managers?: { name: string; id: string }[]; // Updated to support multiple managers
  status: "active" | "inactive";
}

interface Department {
  _id: string;
  name: string;
  description: string;
  subDepartments: {
    _id: string;
    name: string;
    description: string;
    employees: any[];
  }[];
  createdAt: string;
}

const UserManagement = () => {
  const [showManagerField, setShowManagerField] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<{
    [key: string]: string[];
  }>({});
  const [subDomains, setSubDomains] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    adminId: "USER_ID",
    name: "",
    email: "",
    password: "",
    role: "",
    departments: [],
    subDepartments: [],
    managers: [],
    status: "active",
  });
  const [selectedMainDepartment, setSelectedMainDepartment] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const USER_ID = localStorage.getItem("userId") ?? "";
if (!USER_ID) {
  console.error("Error: USER_ID is missing. Ensure it is set in localStorage.");
}

  const [isLoading, setIsLoading] = useState(false);

  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [departmentFormData, setDepartmentFormData] =
    useState<DepartmentFormData>({
      name: "",
      description: "",
      subDepartments: [{ name: "", description: "" }],
    });

  const [managers, setManagers] = useState<
    Array<{ _id: string; name: string }>
  >([]);

  // Handle department modal open
  const handleOpenDepartmentModal = () => {
    setShowDepartmentModal(true);
  };

  // Handle department modal close
  const handleCloseDepartmentModal = () => {
    setShowDepartmentModal(false);
    // Reset form data
    setDepartmentFormData({
      name: "",
      description: "",
      subDepartments: [{ name: "", description: "" }],
    });
  };

  

  // Add sub-department input field
  const addSubDepartment = () => {
    setDepartmentFormData((prev) => ({
      ...prev,
      subDepartments: [...prev.subDepartments, { name: "", description: "" }],
    }));
  };

  // Remove sub-department input field
  const removeSubDepartment = (index: number) => {
    setDepartmentFormData((prev) => ({
      ...prev,
      subDepartments: prev.subDepartments.filter((_, i) => i !== index),
    }));
  };

  // Handle sub-department input change
  const handleDepartmentModalSubDepartmentChange = (
    index: number,
    field: "name" | "description",
    value: string
  ) => {
    const newSubDepartments = [...departmentFormData.subDepartments];
    newSubDepartments[index][field] = value;
    setDepartmentFormData((prev) => ({
      ...prev,
      subDepartments: newSubDepartments,
    }));
  };

  // Save department
  const handleSaveDepartment = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5001/api/departments/add",
        departmentFormData
      );

      // Update departments state
      setDepartments((prev) => [...prev, response.data]);

      // Show success toast
      toast.success("Department created successfully");

      // Close modal
      handleCloseDepartmentModal();
    } catch (error: any) {
      // Show error toast
      toast.error(
        `Error creating department: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };
  // Fetch users
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/usersData", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ adminId: USER_ID }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const data = await response.json();
        setUsers(data);
      } catch (error: any) {
        toast.error(`Error fetching users: ${error.message}`);
      }
    };

    fetchAllUsers();
  }, []);

  // Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          "http://localhost:5001/api/departments"
        );
        const departmentsData = response.data;

        // Store full department data
        setDepartments(departmentsData);

        // Create department options structure
        const options: { [key: string]: string[] } = {};
        departmentsData.forEach((dept: Department) => {
          options[dept.name] = dept.subDepartments.map((sub) => sub.name);
        });

        setDepartmentOptions(options);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const message = error.response?.data?.message || error.message;
          toast.error(`Error fetching departments: ${message}`);
        } else {
          toast.error("An unexpected error occurred");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDepartments();
  }, []);
  //added by nithin
  const fetchManagersByDepartments = async (departments: string[]) => {
    try {
      if (!departments || departments.length === 0) {
        console.warn("No departments provided to fetch managers.");
        setManagers([]); // Clear managers if no departments are selected
        return;
      }
  
      // Join the departments as a comma-separated string
      const departmentsQuery = departments.join(",");
      console.log("Departments query for API:", departmentsQuery); // Debug
  
      const response = await axios.get(
        `http://localhost:5001/users/managers?departments=${departmentsQuery}`
      );
  
      const managersData = response.data;
      console.log("Fetched managers data:", managersData); // Debug
  
      // Remove duplicate managers by `_id`
      const uniqueManagers = managersData.filter(
        (manager, index, self) =>
          index === self.findIndex((m) => m._id === manager._id)
      );
  
      setManagers(uniqueManagers);
    } catch (error) {
      console.error("Error fetching managers:", error);
      toast.error("Failed to fetch managers");
    }
  };
  
  
  
// added by nithin
const handleDepartmentsChange = async (selectedDepartments: string[]) => {
  console.log("Selected Departments:", selectedDepartments); // Debug
  setFormData({ ...formData, departments: selectedDepartments });

  // Check if role is Employee before fetching managers
  if (formData.role === "Employee") {
    await fetchManagersByDepartments(selectedDepartments);
  }

  let allSubDomains: string[] = [];
  selectedDepartments.forEach((department) => {
    if (departmentOptions[department]) {
      allSubDomains = [...allSubDomains, ...departmentOptions[department]];
    }
  });

  setSubDomains([...new Set(allSubDomains)]);
};

//adedd by nithin


const handleSave = async () => {
  try {
    // Validate required fields
    if (
      !formData.name ||
      !formData.email ||
      !formData.role ||
      formData.departments.length === 0
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    // Prepare data to send to the API
    const dataToSend = {
      ...formData,
      adminId: USER_ID, // Ensure adminId is included
      departments: formData.departments,
      subDepartments: formData.subDepartments || [],
      managers:
        formData.managers?.map((manager) => ({
          name: manager.name,
          id: manager.id,
        })) || [],
    };

    // Determine if it's an add or edit operation
    const url = selectedUser?._id
      ? `http://localhost:5001/api/users/edit/${selectedUser._id}`
      : "http://localhost:5001/api/users/add";
    const method = selectedUser?._id ? "PUT" : "POST";

    // API call
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataToSend),
    });

    // Check response status
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to save user");
    }

    // Update state with the new or updated user data
    const data = await response.json();
    if (selectedUser) {
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user._id === data._id ? data : user))
      );
    } else {
      setUsers((prevUsers) => [data, ...prevUsers]);
    }

    toast.success(`User ${selectedUser ? "updated" : "added"} successfully`);
    handleCloseModal();
  } catch (error: any) {
    console.error("Save error:", error);
    toast.error(`Error saving user: ${error.message}`);
  } finally {
    setShowModal(false);
  }
};




  // Delete user
  const handleDelete = async (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await fetch(
          `http://localhost:5001/api/users/${userId}`,
          {
            method: "DELETE",
          }
        );
        if (!response.ok) {
          throw new Error("Failed to delete user");
        }

        setUsers((prevUsers) =>
          prevUsers.filter((user) => user._id !== userId)
        );
        toast.success("User deleted successfully");
      } catch (error: any) {
        toast.error(`Error deleting user: ${error.message}`);
      }
    }
  };

  // Open modal for editing or adding user
  const handleOpenModal = (user: User | null = null) => {
    setSelectedUser(user);
    setFormData(
      user
        ? {
            adminId: USER_ID,
            name: user.name,
            email: user.email,
            password: "",
            role: user.role,
            department: user.department,
            subDepartment: "",
            status: user.status,
          }
        : {
            adminId: USER_ID,
            name: "",
            email: "",
            password: "",
            role: "",
            department: "",
            subDepartment: "",
            status: "active",
          }
    );
    setShowModal(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setSelectedMainDepartment("");
    setSubDomains([]);
  };

  // Handle main department change
  // const handleMainDepartmentChange = (departmentName: string) => {
  //   setSelectedMainDepartment(departmentName);
  //   setFormData((prev) => ({
  //     ...prev,
  //     department: departmentName,
  //     subDepartment: "", // Reset sub-department on department change
  //   }));

  //   // Update sub-domains for the selected department
  //   setSubDomains(departmentOptions[departmentName] || []);
  // };
 {/* const handleMainDepartmentChange = (mainDepartment: string) => {
    setSelectedMainDepartment(mainDepartment);
    setFormData({ ...formData, department: mainDepartment });
    setSubDomains(departmentOptions[mainDepartment] || []);

    // If role is Employee, fetch managers for the selected department
    if (formData.role === "Employee") {
      fetchManagersByDepartment(mainDepartment);
    }
  };*/}

  const handleRoleChange = (role: string) => {
    // Update role in the formData state
    setFormData((prevFormData) => ({
      ...prevFormData,
      role,
    }));
  
    // Show or hide the manager field based on the role
    setShowManagerField(role === "Employee");
  
    // Handle fetching managers or resetting managers
    if (role === "Employee") {
      if (formData.departments?.length > 0) {
        // Fetch managers for the selected departments
        fetchManagersByDepartments(formData.departments);
      } else {
        // Clear managers if no departments are selected
        setManagers([]);
      }
    } else {
      // Clear managers if the role is not Employee
      setManagers([]);
    }
  };
  
  

  // Handle sub-department change
  const handleSubDepartmentChange = (subDepartment: string) => {
    setFormData((prev) => ({
      ...prev,
      subDepartment,
    }));
  };

  // Filter users based on search term
  const filteredUsers = users.filter((user) =>
    Object.values(user)
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      renderCell: (params: any) => (
        <Typography
          sx={{
            fontWeight: 500,
            color: "primary.main",
            "&:hover": { cursor: "pointer" },
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      renderCell: (params: any) => (
        <Typography
          sx={{
            color: "text.secondary",
            fontSize: 14,
            wordBreak: "break-word",
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: "role",
      headerName: "Role",
      flex: 1,
      renderCell: (params: any) => (
        <Chip
          label={params.value}
          sx={{
            bgcolor:
              params.value === "Manager"
                ? "#D0E9FF" // Light Blue
                : params.value === "Employee"
                ? "#DFF2D8" // Light Green
                : "#E0E0E0", // Light Grey for others
            color:
              params.value === "Manager"
                ? "#0A74DA" // Dark Blue
                : params.value === "Employee"
                ? "#388E3C" // Dark Green
                : "#616161", // Dark Grey for others
            textTransform: "capitalize",
            fontSize: 12,
            fontWeight: "bold",
          }}
        />
      ),
    },
    {
      field: "department",
      headerName: "Department",
      flex: 1,
      renderCell: (params: any) => (
        <Typography
          sx={{
            fontWeight: 400,
            fontSize: 14,
            color: "text.primary",
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params: any) => (
        <Typography
          sx={{
            bgcolor: params.value === "active" ? "green.100" : "red.100",
            color: params.value === "active" ? "green.800" : "red.800",
            px: 1.5,
            py: 0.5,
            borderRadius: 1,
            fontWeight: 500,
            textAlign: "center",
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params: any) => (
        <Box
          sx={{
            display: "flex",
            gap: 1,
          }}
        >
          <Button
            size="small"
            variant="contained"
            color="primary"
            sx={{
              textTransform: "none",
              fontSize: 12,
            }}
            onClick={() => handleOpenModal(params.row)}
          >
            Edit
          </Button>
          <Button
            size="small"
            variant="contained"
            color="error"
            sx={{
              textTransform: "none",
              fontSize: 12,
            }}
            onClick={() => handleDelete(params.row._id)}
          >
            Delete
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <ToastContainer />

      {/* Search and Add Buttons */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          mb: 3,
          p: 2,
          borderRadius: 2,
          boxShadow: 3,
          bgcolor: "background.paper",
        }}
      >
        <Typography variant="h6" gutterBottom>
          User Management Filters
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "2fr 1fr 1fr" },
            gap: 2,
            alignItems: "center",
          }}
        >
          {/* Search Field */}
          <TextField
            placeholder="Search by Name, Email, or Role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <Box sx={{ display: "flex", alignItems: "center", pr: 1 }}>
                  <Typography sx={{ color: "text.secondary" }}>🔍</Typography>
                </Box>
              ),
            }}
          />

          {/* Add User Button */}
          <Button
            startIcon={<Plus />}
            variant="contained"
            color="primary"
            size="medium"
            sx={{
              bgcolor: "primary.main",
              color: "white",
              "&:hover": { bgcolor: "primary.dark" },
            }}
            onClick={handleOpenModal}
          >
            Add User
          </Button>

          {/* Add Departments Button */}
          <Button
            startIcon={<Plus />}
            variant="outlined"
            color="secondary"
            size="medium"
            sx={{
              borderColor: "secondary.main",
              color: "secondary.main",
              "&:hover": {
                borderColor: "secondary.dark",
                color: "secondary.dark",
              },
            }}
            onClick={handleOpenDepartmentModal}
          >
            Add Departments
          </Button>
        </Box>
      </Box>

      {/* User DataGrid */}
      <div style={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={filteredUsers}
          columns={columns}
          getRowId={(row) => row._id}
          sx={{
            "& .MuiDataGrid-cell": {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "8px",
            },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#f5f5f5",
              textAlign: "center",
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: "bold",
            },
          }}
        />
      </div>

      <Modal open={showModal} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            bgcolor: "background.paper",
            p: 3,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" mb={2}>
            {selectedUser ? "Edit User" : "Add User"}
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Name Field */}
            <TextField
              label="Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              fullWidth
            />

            {/* Email Field */}
            <TextField
              label="Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              fullWidth
            />

            {/* Password Field */}
            <TextField
              label="Password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              type="password"
              fullWidth
            />

            {/* Role Field */}
            <TextField
              select
              label="Role"
              value={formData.role}
              onChange={(e) => handleRoleChange(e.target.value)}
              fullWidth
            >
              <MenuItem value="Manager">Manager</MenuItem>
              <MenuItem value="Employee">Employee</MenuItem>
            </TextField>

            {/* Multi-Select for Departments */}
            <Autocomplete
              multiple
              options={Object.keys(departmentOptions)}
              value={formData.departments || []}
              onChange={(e, value) => handleDepartmentsChange(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Departments"
                  placeholder="Select Departments"
                />
              )}
              fullWidth
            />

            {/* Multi-Select for Sub-Departments */}
            {(formData.departments?.length || 0) > 0 && (
              <Autocomplete
                multiple
                options={subDomains || []}
                value={formData.subDepartments || []}
                onChange={(e, value) =>
                  setFormData({ ...formData, subDepartments: value })
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Sub-Departments"
                    placeholder="Select Sub-Departments"
                  />
                )}
                fullWidth
              />
            )}

            {/* Multi-Select for Managers */}
            {formData.role === "Employee" && (
              <Autocomplete
                multiple
                options={managers?.map((manager) => manager.name) || []}
                value={formData.managers?.map((manager) => manager.name) || []}
                onChange={(e, value) =>
                  setFormData({
                    ...formData,
                    managers: value.map((name) => {
                      const manager = managers.find((m) => m.name === name);
                      return { name, id: manager?._id || "" };
                    }),
                  })
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Managers"
                    placeholder="Select Managers"
                  />
                )}
                fullWidth
              />
            )}

            {/* Status Field */}
            <TextField
              select
              label="Status"
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as "active" | "inactive",
                })
              }
              fullWidth
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>

            {/* Action Buttons */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <Button variant="outlined" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button variant="contained" color="primary" onClick={handleSave}>
                Save
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* Department Modal */}
      <DepartmentModel
        open={showDepartmentModal}
        onClose={handleCloseDepartmentModal}
        departmentFormData={departmentFormData}
        onFormDataChange={setDepartmentFormData}
        onAddSubDepartment={addSubDepartment}
        onRemoveSubDepartment={removeSubDepartment}
        onSubDepartmentChange={handleSubDepartmentChange}
        onSave={handleSaveDepartment}
      />
    </Box>
  );
};

export default UserManagement;
