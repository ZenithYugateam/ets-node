import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import {
    Box,
    Button,
    Modal,
    TextField,
    MenuItem,
    Typography,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// User interface
interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    department: string;
    status: 'active' | 'inactive';
}

// FormData interface
interface FormData {
    adminId: string;
    name: string;
    email: string;
    password: string;
    role: string;
    department: string;
    status: 'active' | 'inactive';
    delete: boolean;
}

const UserManagement = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [formData, setFormData] = useState<FormData>({
        adminId: '507f1f77bcf86cd799439011',
        name: '',
        email: '',
        password: '',
        role: '',
        department: '',
        status: 'active',
        delete: false,
    });

    useEffect(() => {
        const fetchAllUsers = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/usersData', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ adminId: '507f1f77bcf86cd799439011' }),
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }

                const data = await response.json();
                setUsers(data);
            } catch (error) {
                toast.error(`Error fetching users: ${error.message}`);
            }
        };

        fetchAllUsers();
    }, []);

    const handleSave = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/users/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save user');
            }

            const data = await response.json();
            setUsers((prevUsers) => [...prevUsers, data]); // Automatically update DataGrid
            toast.success('User saved successfully');
        } catch (error) {
            toast.error(`Error saving user: ${error.message}`);
        } finally {
            setShowModal(false);
            setFormData({
                adminId: '507f1f77bcf86cd799439011',
                name: '',
                email: '',
                password: '',
                role: '',
                department: '',
                status: 'active',
                delete: false,
            });
        }
    };

    const handleDelete = async (userId: string) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    throw new Error('Failed to delete user');
                }

                setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId)); // Remove deleted user from DataGrid
                toast.success('User deleted successfully');
            } catch (error) {
                toast.error(`Error deleting user: ${error.message}`);
            }
        }
    };

    const handleOpenModal = (user: User | null = null) => {
        setSelectedUser(user);
        setFormData(
            user
                ? {
                      adminId: '507f1f77bcf86cd799439011',
                      name: user.name,
                      email: user.email,
                      password: '',
                      role: user.role,
                      department: user.department,
                      status: user.status,
                      delete: false,
                  }
                : {
                      adminId: '507f1f77bcf86cd799439011',
                      name: '',
                      email: '',
                      password: '',
                      role: '',
                      department: '',
                      status: 'active',
                      delete: false,
                  }
        );
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedUser(null);
    };

    const filteredUsers = users.filter(
        (user: User) =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        { field: 'name', headerName: 'Name', flex: 1 },
        { field: 'email', headerName: 'Email', flex: 1 },
        { field: 'role', headerName: 'Role', flex: 1 },
        { field: 'department', headerName: 'Department', flex: 1 },
        {
            field: 'status',
            headerName: 'Status',
            flex: 1,
            renderCell: (params: any) => (
                <Typography
                    sx={{
                        bgcolor: params.value === 'active' ? 'green.100' : 'red.100',
                        color: params.value === 'active' ? 'green.800' : 'red.800',
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
            field: 'actions',
            headerName: 'Actions',
            flex: 1,
            renderCell: (params: any) => (
                <div style={{ display: 'flex', gap: '8px' }}>
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
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

            <div style={{ height: 400, width: '100%' }}>
                <DataGrid
                    rows={filteredUsers}
                    columns={columns}
                    getRowId={(row) => row._id}
                />
            </div>

            <Modal open={showModal} onClose={handleCloseModal}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 400,
                        bgcolor: 'background.paper',
                        p: 3,
                        borderRadius: 2,
                    }}
                >
                    <Typography variant="h6" mb={2}>
                        {selectedUser ? 'Edit User' : 'Add User'}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                            type="password"
                            value={formData.password}
                            onChange={(e) =>
                                setFormData({ ...formData, password: e.target.value })
                            }
                            fullWidth
                        />
                        <TextField
                            label="Role"
                            select
                            value={formData.role}
                            onChange={(e) =>
                                setFormData({ ...formData, role: e.target.value })
                            }
                            fullWidth
                        >
                            <MenuItem value="Employee">Employee</MenuItem>
                            <MenuItem value="Manager">Manager</MenuItem>
                        </TextField>
                        <TextField
                            label="Department"
                            value={formData.department}
                            onChange={(e) =>
                                setFormData({ ...formData, department: e.target.value })
                            }
                            fullWidth
                        />
                        <TextField
                            label="Status"
                            select
                            value={formData.status}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    status: e.target.value as 'active' | 'inactive',
                                })
                            }
                            fullWidth
                        >
                            <MenuItem value="active">Active</MenuItem>
                            <MenuItem value="inactive">Inactive</MenuItem>
                        </TextField>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Button
                                variant="outlined"
                                onClick={handleCloseModal}
                                color="error"
                            >
                                Cancel
                            </Button>
                            <Button variant="contained" color="primary" onClick={handleSave}>
                                {selectedUser ? 'Save Changes' : 'Save'}
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Modal>
        </Box>
    );
};

export default UserManagement;
