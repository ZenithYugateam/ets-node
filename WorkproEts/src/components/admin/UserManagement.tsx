// import React, { useState, useEffect } from "react";
// import { Plus } from "lucide-react";
// import {
//   Box,
//   Button,
//   Modal,
//   TextField,
//   MenuItem,
//   Typography,
// } from "@mui/material";
// import { DataGrid } from "@mui/x-data-grid";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import axios from "axios";

// // User interface
// interface User {
//   _id: string;
//   name: string;
//   email: string;
//   role: string;
//   department: string;
//   status: "active" | "inactive";
// }

// // FormData interface
// interface FormData {
//   adminId: string;
//   name: string;
//   email: string;
//   password: string;
//   role: string;
//   department: string;
//   subDomain?: string;
//   manager?: string; // Already present
//   subDepartment?: string; // Add this field
//   status: "active" | "inactive";
// }

// interface Employee {
//   _id: string;
//   name: string;
//   email: string;
//   department: string;
//   role: string;
// }
// const UserManagement = () => {
//   const [users, setUsers] = useState<User[]>([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [showModal, setShowModal] = useState(false);
//   const [selectedUser, setSelectedUser] = useState<User | null>(null);
//   const [formData, setFormData] = useState<FormData>({
//     adminId: "",
//     name: "",
//     email: "",
//     password: "",
//     role: "",
//     department: "",
//     subDomain: "",
//     manager: "",
//     subDepartment: "", // Initialize here
//     status: "active",
//   });
//   const [showManagerField, setShowManagerField] = useState(false);
//   const [selectedMainDepartment, setSelectedMainDepartment] = useState("");
//   const [subDomains, setSubDomains] = useState<string[]>([]);
//   const [departments, setDepartments] = useState<string[]>([]);
//   const [employees, setEmployees] = useState<Employee[]>([]);
//   const USER_ID = localStorage.getItem("userId") ?? "";
//   // Fetch users
//   useEffect(() => {
//     const fetchAllUsers = async () => {
//       try {
//         const response = await fetch("http://localhost:5000/api/usersData", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ adminId: USER_ID }),
//         });

//         if (!response.ok) {
//           throw new Error("Failed to fetch users");
//         }

//         const data = await response.json();
//         setUsers(data);
//       } catch (error: any) {
//         toast.error(`Error fetching users: ${error.message}`);
//       }
//     };

//     fetchAllUsers();
//   }, []);
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     const fetchDepartments = async () => {
//       setIsLoading(true);
//       try {
//         const response = await axios.get(
//           "http://localhost:5000/api/departments"
//         );
//         const data = response.data;

//         const deptOptions: { [key: string]: string[] } = {};
//         data.forEach((dept: any) => {
//           deptOptions[dept.name] = dept.subDepartments.map(
//             (sub: any) => sub.name
//           );
//         });

//         setDepartments(deptOptions);
//       } catch (error) {
//         if (axios.isAxiosError(error)) {
//           // Handle Axios specific errors
//           const message = error.response?.data?.message || error.message;
//           toast.error(`Error fetching departments: ${message}`);
//         } else {
//           // Handle other errors
//           toast.error("An unexpected error occurred");
//         }
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchDepartments();
//   }, []);

//   // Save user
//   //   const handleSave = async () => {
//   //     try {
//   //       const url = selectedUser
//   //         ? `http://localhost:5000/api/users/${selectedUser._id}`
//   //         : "http://localhost:5000/api/users/add";

//   //       console.log("url : " + url);
//   //       const method = selectedUser ? "PUT" : "POST";

//   //       const response = await fetch(url, {
//   //         method,
//   //         headers: { "Content-Type": "application/json" },
//   //         body: JSON.stringify(formData),
//   //       });

//   //       console.log("send data  : " + JSON.stringify(formData));

//   //       if (!response.ok) {
//   //         const errorData = await response.json();
//   //         throw new Error(errorData.message || "Failed to save user");
//   //       }

//   //       const data = await response.json();

//   //       console.log("Data" + data);
//   //       console.log("selected user : " + selectedUser);

//   //       if (selectedUser) {
//   //         setUsers((prevUsers) =>
//   //           prevUsers.map((user) => (user._id === data._id ? data : user))
//   //         );
//   //       } else {
//   //         setUsers((prevUsers) => [...prevUsers, data]);
//   //       }

//   //       toast.success(`User ${selectedUser ? "updated" : "added"} successfully`);
//   //       handleCloseModal();
//   //     } catch (error: any) {
//   //       toast.error(`Error saving user: ${error.message}`);
//   //     }
//   //   };

//   const handleSave = async () => {
//     try {
//       // Find the department ID based on the department name
//       const deptResponse = await fetch(
//         `http://localhost:5000/api/departments/byName/${formData.department}`
//       );
//       const deptData = await deptResponse.json();

//       // Prepare data to send
//       const dataToSend = {
//         ...formData,
//         department: formData.department, // Keep department name
//         subDepartment: formData.subDepartment, // Keep sub-department name
//       };

//       const url = selectedUser
//         ? `http://localhost:5000/api/users/${selectedUser._id}`
//         : "http://localhost:5000/api/users/add";

//       const method = selectedUser ? "PUT" : "POST";

//       const response = await fetch(url, {
//         method,
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(dataToSend),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || "Failed to save user");
//       }

//       const data = await response.json();

//       if (selectedUser) {
//         setUsers((prevUsers) =>
//           prevUsers.map((user) => (user._id === data._id ? data : user))
//         );
//       } else {
//         setUsers((prevUsers) => [...prevUsers, data]);
//       }

//       toast.success(`User ${selectedUser ? "updated" : "added"} successfully`);
//       handleCloseModal();
//     } catch (error: any) {
//       toast.error(`Error saving user: ${error.message}`);
//     }
//   };

//   // Delete user
//   const handleDelete = async (userId: string) => {
//     if (window.confirm("Are you sure you want to delete this user?")) {
//       try {
//         const response = await fetch(
//           `http://localhost:5000/api/users/${userId}`,
//           {
//             method: "DELETE",
//           }
//         );
//         if (!response.ok) {
//           throw new Error("Failed to delete user");
//         }

//         setUsers((prevUsers) =>
//           prevUsers.filter((user) => user._id !== userId)
//         );
//         toast.success("User deleted successfully");
//       } catch (error: any) {
//         toast.error(`Error deleting user: ${error.message}`);
//       }
//     }
//   };

//   // Open modal for editing or adding user
//   const handleOpenModal = (user: User | null = null) => {
//     setSelectedUser(user);
//     setFormData(
//       user
//         ? {
//             adminId: USER_ID,
//             name: user.name,
//             email: user.email,
//             password: "",
//             role: user.role,
//             department: user.department,
//             status: user.status,
//           }
//         : {
//             adminId: USER_ID,
//             name: "",
//             email: "",
//             password: "",
//             role: "",
//             department: "",
//             status: "active",
//           }
//     );
//     setShowModal(true);
//   };

//   // Close modal
//   const handleCloseModal = () => {
//     setShowModal(false);
//     setSelectedUser(null);
//     setShowManagerField(false);
//     setSelectedMainDepartment("");
//     setSubDomains([]);
//   };

//   // Handle role change
//   const handleRoleChange = (role: string) => {
//     setFormData({ ...formData, role });
//     setShowManagerField(role === "Employee");
//   };

//   // Handle main department change
//   const handleMainDepartmentChange = (mainDepartment: any) => {
//     setSelectedMainDepartment(mainDepartment);
//     setFormData({ ...formData, department: mainDepartment });
//     setSubDomains(departmentOptions[mainDepartment] || []);
//   };

//   // Filter users based on search term
//   const filteredUsers = users.filter(
//     (user) =>
//       user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       user.email.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const handleSubDepartmentChange = (subDepartment: string) => {
//     setFormData({ ...formData, subDepartment });
//   };

//   // Department options
//   const departmentOptions = {
//     Engineering: ["Software Development", "QA", "DevOps"],
//     Marketing: ["SEO", "Content", "Social Media"],
//     Sales: ["Domestic Sales", "International Sales", "Account Management"],
//   };

//   // Columns for DataGrid
//   const columns = [
//     { field: "name", headerName: "Name", flex: 1 },
//     { field: "email", headerName: "Email", flex: 1 },
//     { field: "role", headerName: "Role", flex: 1 },
//     { field: "department", headerName: "Department", flex: 1 },
//     {
//       field: "status",
//       headerName: "Status",
//       flex: 1,
//       renderCell: (params: any) => (
//         <Typography
//           sx={{
//             bgcolor: params.value === "active" ? "green.100" : "red.100",
//             color: params.value === "active" ? "green.800" : "red.800",
//             px: 1,
//             py: 0.5,
//             borderRadius: 1,
//           }}
//         >
//           {params.value}
//         </Typography>
//       ),
//     },
//     {
//       field: "actions",
//       headerName: "Actions",
//       flex: 1,
//       renderCell: (params: any) => (
//         <div style={{ display: "flex", gap: "8px" }}>
//           <Button
//             size="small"
//             variant="outlined"
//             color="primary"
//             onClick={() => handleOpenModal(params.row)}
//           >
//             Edit
//           </Button>
//           <Button
//             size="small"
//             variant="outlined"
//             color="error"
//             onClick={() => handleDelete(params.row._id)}
//           >
//             Delete
//           </Button>
//         </div>
//       ),
//     },
//   ];

//   return (
//     <Box sx={{ p: 3 }}>
//       <ToastContainer />
//       <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
//         <TextField
//           placeholder="Search users..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           variant="outlined"
//           size="small"
//         />
//         <Button
//           startIcon={<Plus />}
//           variant="contained"
//           color="primary"
//           onClick={() => handleOpenModal()}
//         >
//           Add User
//         </Button>
//       </Box>

//       <div style={{ height: 400, width: "100%" }}>
//         <DataGrid
//           rows={filteredUsers}
//           columns={columns}
//           getRowId={(row) => row._id}
//         />
//       </div>

//       <Modal open={showModal} onClose={handleCloseModal}>
//         <Box
//           sx={{
//             position: "absolute",
//             top: "50%",
//             left: "50%",
//             transform: "translate(-50%, -50%)",
//             width: 400,
//             bgcolor: "background.paper",
//             p: 3,
//             borderRadius: 2,
//           }}
//         >
//           <Typography variant="h6" mb={2}>
//             {selectedUser ? "Edit User" : "Add User"}
//           </Typography>
//           <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
//             <TextField
//               label="Name"
//               value={formData.name}
//               onChange={(e) =>
//                 setFormData({ ...formData, name: e.target.value })
//               }
//               fullWidth
//             />
//             <TextField
//               label="Email"
//               value={formData.email}
//               onChange={(e) =>
//                 setFormData({ ...formData, email: e.target.value })
//               }
//               fullWidth
//             />
//             <TextField
//               label="Password"
//               value={formData.password}
//               onChange={(e) =>
//                 setFormData({ ...formData, password: e.target.value })
//               }
//               type="password"
//               fullWidth
//             />
//             <TextField
//               select
//               label="Role"
//               value={formData.role}
//               onChange={(e) => handleRoleChange(e.target.value)}
//               fullWidth
//             >
//               <MenuItem value="Manager">Manager</MenuItem>
//               <MenuItem value="Employee">Employee</MenuItem>
//             </TextField>
//             {showManagerField && (
//               <TextField
//                 label="Manager"
//                 value={formData.manager}
//                 onChange={(e) =>
//                   setFormData({ ...formData, manager: e.target.value })
//                 }
//                 fullWidth
//               />
//             )}
//             <TextField
//               select
//               label="Main Department"
//               value={selectedMainDepartment}
//               onChange={(e) => handleMainDepartmentChange(e.target.value)}
//               fullWidth
//             >
//               {Object.keys(departmentOptions).map((key) => (
//                 <MenuItem key={key} value={key}>
//                   {key}
//                 </MenuItem>
//               ))}
//             </TextField>

//             {subDomains.length > 0 && (
//               <TextField
//                 select
//                 label="Sub-Domain"
//                 value={formData.subDepartment}
//                 onChange={(e) =>
//                   setFormData({ ...formData, subDepartment: e.target.value })
//                 }
//                 fullWidth
//               >
//                 {subDomains.map((subDomain) => (
//                   <MenuItem key={subDomain} value={subDomain}>
//                     {subDomain}
//                   </MenuItem>
//                 ))}
//               </TextField>
//             )}
//             <TextField
//               select
//               label="Status"
//               value={formData.status}
//               onChange={(e) =>
//                 setFormData({
//                   ...formData,
//                   status: e.target.value as "active" | "inactive",
//                 })
//               }
//               fullWidth
//             >
//               <MenuItem value="active">Active</MenuItem>
//               <MenuItem value="inactive">Inactive</MenuItem>
//             </TextField>

//             <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
//               <Button variant="outlined" onClick={handleCloseModal}>
//                 Cancel
//               </Button>
//               <Button variant="contained" color="primary" onClick={handleSave}>
//                 Save
//               </Button>
//             </Box>
//           </Box>
//         </Box>
//       </Modal>
//     </Box>
//   );
// };

// export default UserManagement;

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

// Interfaces
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
  department: string;
  subDepartment: string; // Add this field
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
  const handleSave = async () => {
    try {
      const url = selectedUser
        ? `http://localhost:5000/api/users/${selectedUser._id}`
        : "http://localhost:5000/api/users/add";

      const method = selectedUser ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save user");
      }

      const data = await response.json();

      if (selectedUser) {
        setUsers((prevUsers) =>
          prevUsers.map((user) => (user._id === data._id ? data : user))
        );
      } else {
        setUsers((prevUsers) => [...prevUsers, data]);
      }

      toast.success(`User ${selectedUser ? "updated" : "added"} successfully`);
      handleCloseModal();
    } catch (error: any) {
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
  const handleMainDepartmentChange = (departmentName: string) => {
    setSelectedMainDepartment(departmentName);
    setFormData((prev) => ({
      ...prev,
      department: departmentName,
      subDepartment: "", // Reset sub-department on department change
    }));

    // Update sub-domains for the selected department
    setSubDomains(departmentOptions[departmentName] || []);
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

  // Columns for DataGrid
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
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
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
          onClick={() => handleOpenModal()}
        >
          Add User
        </Button>
      </Box>

      <div style={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={filteredUsers}
          columns={columns}
          getRowId={(row) => row._id}
        />
      </div>

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
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              fullWidth
            >
              <MenuItem value="Manager">Manager</MenuItem>
              <MenuItem value="Employee">Employee</MenuItem>
            </TextField>
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
            {selectedMainDepartment && (
              <TextField
                select
                label="Sub-Department"
                value={formData.subDepartment}
                onChange={(e) => handleSubDepartmentChange(e.target.value)}
                fullWidth
              >
                <MenuItem value="">Select Sub-Domain</MenuItem>
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
    </Box>
  );
};

export default UserManagement;
