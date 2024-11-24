import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import {
  Box,
  Button,
  Modal,
  TextField,
  MenuItem,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import DepartmentModel from "./DepartmentModel";

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

// interface FormData {
//   adminId: string;
//   name: string;
//   email: string;
//   password: string;
//   role: string;
//   department: string;
//   subDepartment: string; // Add this field
//   status: "active" | "inactive";
// }

interface FormData {
  adminId: string;
  name: string;
  email: string;
  password: string;
  role: string;
  department: string;
  subDepartment?: string;
  manager?: string;
  managerId?: string; // Add this field
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
    adminId: "",
    name: "",
    email: "",
    password: "",
    role: "",
    department: "",
    subDepartment: "",
    status: "active",
  });
  const [selectedMainDepartment, setSelectedMainDepartment] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const USER_ID = localStorage.getItem("userId") ?? "";

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

  const fetchManagersByDepartment = async (departmentName: string) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/users/managers/${departmentName}`
      );
      setManagers(response.data);
    } catch (error) {
      console.error("Error fetching managers:", error);
      toast.error("Failed to fetch managers");
    }
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
        "http://localhost:5000/api/departments/add",
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
        const response = await fetch("http://localhost:5000/api/usersData", {
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
          "http://localhost:5000/api/departments"
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

  // Save user
  // const handleSave = async () => {
  //   try {
  //     // First, validate if all required fields are filled
  //     if (
  //       !formData.name ||
  //       !formData.email ||
  //       !formData.password ||
  //       !formData.role ||
  //       !formData.department
  //     ) {
  //       toast.error("Please fill all required fields");
  //       return;
  //     }

  //     let url = "http://localhost:5000/api/users/add"; // Default URL for POST
  //     let method = "POST"; // Default method

  //     // Only change URL and method if we're updating an existing user
  //     if (selectedUser && selectedUser._id) {
  //       url = `http://localhost:5000/api/users/${selectedUser._id}`;
  //       method = "PUT";
  //     }

  //     const response = await fetch(url, {
  //       method,
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         ...formData,
  //         adminId: USER_ID, // Make sure adminId is included
  //       }),
  //     });

  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       throw new Error(errorData.message || "Failed to save user");
  //     }

  //     const data = await response.json();

  //     // Update the users state based on whether we're editing or adding
  //     if (selectedUser && selectedUser._id) {
  //       setUsers((prevUsers) =>
  //         prevUsers.map((user) => (user._id === data._id ? data : user))
  //       );
  //     } else {
  //       setUsers((prevUsers) => [...prevUsers, data]);
  //     }

  //     toast.success(`User ${selectedUser ? "updated" : "added"} successfully`);
  //     handleCloseModal();
  //   } catch (error: any) {
  //     console.error("Save error:", error);
  //     toast.error(`Error saving user: ${error.message}`);
  //   }
  // };

  const handleSave = async () => {
    try {
      // Validate required fields
      if (
        !formData.name ||
        !formData.email ||
        !formData.role ||
        !formData.department
      ) {
        toast.error("Please fill all required fields");
        return;
      }

      const dataToSend = {
        ...formData,
        adminId: USER_ID,
        ...(formData.role === "Employee" && {
          manager: formData.manager,
          managerId: formData.managerId,
        }),
      };

      // Check if selectedUser exists and has a valid _id
      const url = selectedUser?._id
        ? `http://localhost:5000/api/users/${selectedUser._id}`
        : "http://localhost:5000/api/users/add";

      const method = selectedUser?._id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save user");
      }

      const data = await response.json();

      // Update users state
      if (selectedUser?._id) {
        setUsers((prevUsers) =>
          prevUsers.map((user) => (user._id === data._id ? data : user))
        );
      } else {
        setUsers((prevUsers) => [...prevUsers, data]);
      }

      toast.success(
        `User ${selectedUser?._id ? "updated" : "added"} successfully`
      );
      handleCloseModal();
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(`Error saving user: ${error.message}`);
    }
  };
  // Delete user
  const handleDelete = async (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await fetch(
          `http://localhost:5000/api/users/${userId}`,
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
  const handleMainDepartmentChange = (mainDepartment: string) => {
    setSelectedMainDepartment(mainDepartment);
    setFormData({ ...formData, department: mainDepartment });
    setSubDomains(departmentOptions[mainDepartment] || []);

    // If role is Employee, fetch managers for the selected department
    if (formData.role === "Employee") {
      fetchManagersByDepartment(mainDepartment);
    }
  };

  const handleRoleChange = (role: string) => {
    setFormData({ ...formData, role });
    setShowManagerField(role === "Employee");

    // Only fetch managers if it's an Employee and department is selected
    if (role === "Employee" && formData.department) {
      fetchManagersByDepartment(formData.department);
    } else {
      // Reset managers if role is not Employee
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
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "role", headerName: "Role", flex: 1 },
    { field: "department", headerName: "Department", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params: any) => (
        <Typography
          sx={{
            bgcolor: params.value === "active" ? "green.100" : "red.100",
            color: params.value === "active" ? "green.800" : "red.800",
            px: 1,
            py: 0.5,
            borderRadius: 1,
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
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            size="small"
            variant="outlined"
            color="primary"
            onClick={() => handleOpenModal(params.row)}
          >
            Edit
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            onClick={() => handleDelete(params.row._id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <ToastContainer />

      {/* Search and Add Buttons */}
      <Box
        sx={{ display: "flex", justifyContent: "space-between", mb: 2, gap: 2 }}
      >
        <TextField
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          variant="outlined"
          size="small"
        />
        <Button
          startIcon={<Plus />}
          variant="contained"
          color="primary"
          onClick={handleOpenModal}
        >
          Add User
        </Button>
        <Button
          startIcon={<Plus />}
          variant="contained"
          color="primary"
          onClick={handleOpenDepartmentModal}
        >
          Add Departments
        </Button>
      </Box>

      {/* User DataGrid */}
      <div style={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={filteredUsers}
          columns={columns}
          getRowId={(row) => row._id}
        />
      </div>

      {/* User Modal */}
      {/* User Modal */}
      <Modal open={showModal} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            p: 3,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" mb={2}>
            {selectedUser ? "Edit User" : "Add User"}
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              type="password"
              fullWidth
            />

            <TextField
              select
              label="Role"
              value={formData.role}
              onChange={(e) => handleRoleChange(e.target.value)} // Changed this line
              fullWidth
            >
              <MenuItem value="Manager">Manager</MenuItem>
              <MenuItem value="Employee">Employee</MenuItem>
            </TextField>

            {/* Department Selection */}
            <TextField
              select
              label="Main Department"
              value={selectedMainDepartment}
              onChange={(e) => handleMainDepartmentChange(e.target.value)}
              fullWidth
            >
              <MenuItem value="">Select Department</MenuItem>
              {Object.keys(departmentOptions).map((key) => (
                <MenuItem key={key} value={key}>
                  {key}
                </MenuItem>
              ))}
            </TextField>
            {showManagerField && (
              <TextField
                select
                label="Select Manager"
                value={formData.manager || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    manager: e.target.value,
                    managerId:
                      managers.find((m) => m.name === e.target.value)?._id ||
                      "",
                  })
                }
                fullWidth
              >
                {managers.map((manager) => (
                  <MenuItem key={manager._id} value={manager.name}>
                    {manager.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
            {/* Sub-Department Selection - Shows only when main department is selected */}
            {selectedMainDepartment && (
              <TextField
                select
                label="Sub-Department"
                value={formData.subDepartment}
                onChange={(e) => handleSubDepartmentChange(e.target.value)}
                fullWidth
              >
                <MenuItem value="">Select Sub-Department</MenuItem>
                {subDomains.map((subDomain) => (
                  <MenuItem key={subDomain} value={subDomain}>
                    {subDomain}
                  </MenuItem>
                ))}
              </TextField>
            )}
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
