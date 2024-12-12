import { Edit, Visibility } from '@mui/icons-material';
import { Box, Button, CircularProgress, IconButton, TextField, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import the modal you adapted from TaskViewModal to WorksheetDetailModal
import { WorksheetDetailModal } from '../manager/Dialog_ui/WorksheetDetailModal'; // Adjust this import path

const WorksheetManagement = () => {
  const [assign_name, setAssignName] = useState<any>('');
  const [role, setRole] = useState('');
  const [assign_to, setAssignTo] = useState('');
  const [date, setDate] = useState('');
  const [worksheetTitle, setWorksheetTitle] = useState('');
  const [worksheetDescription, setWorksheetDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(true);

  const [worksheets, setWorksheets] = useState([]);
  const [worksheetOverview, setWorksheetOverview] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);

  // State for modal
  const [selectedWorksheet, setSelectedWorksheet] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    console.log("sessionStorage userName:", sessionStorage.getItem('userName'));
    console.log("sessionStorage role:", sessionStorage.getItem('role'));
    console.log("sessionStorage userId:", sessionStorage.getItem('userId'));
  }, []);

  const fetchUserDetails = async () => {
    try {
      const userId = sessionStorage.getItem('userId');
      const response = await axios.get(`http://localhost:5000/api/user/${userId}`);
      const { role: fetchedRole, manager } = response.data;
      const userName = sessionStorage.getItem('userName');

      setAssignName(userName);
      setRole(fetchedRole);
      setAssignTo(manager);
      setUserLoading(false);

      console.log("User Details:", { userName, fetchedRole, manager });
    } catch (err) {
      console.error('Error fetching user data:', err);
      setUserLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const fetchWorksheets = async () => {
    const userName = sessionStorage.getItem('userName');
    console.log("Fetching worksheets for assign_name:", userName);

    try {
      const response = await axios.post('http://localhost:5000/api/worksheetsData', {
        assign_name: userName
      });
      console.log("Worksheets response data:", response.data);

      if (Array.isArray(response.data) && response.data.length === 0) {
        toast.info('No worksheets found for this user.');
        setWorksheets([]);
      } else {
        setWorksheets(response.data);
      }
    } catch (err) {
      console.error('Error fetching worksheet data:', err);
      toast.error('Failed to fetch worksheet data.');
    }
  };

  const fetchWorksheetOverview = async () => {
    console.log("Fetching worksheet overview for role:", role);

    try {
      let response;
      if (role === 'Admin') {
        // Admin: Fetch all worksheets
        response = await axios.get('http://localhost:5000/api/worksheets/all');
      } else if (role === 'Manager') {
        // Manager: Fetch worksheets for manager and their employees
        response = await axios.post('http://localhost:5000/api/worksheets/manager-overview', { 
          managerName: sessionStorage.getItem('userName') 
        });
      } else {
        return;
      }

      console.log("Worksheet overview response data:", response.data);

      if (Array.isArray(response.data) && response.data.length === 0) {
        toast.info('No worksheets found for the given criteria.');
        setWorksheetOverview([]);
      } else {
        setWorksheetOverview(response.data);
      }
    } catch (err) {
      console.error('Error fetching worksheet overview:', err);
      toast.error('Failed to fetch worksheet overview.');
    }
  };

  useEffect(() => {
    if (!userLoading) {
      fetchWorksheets();
      if (role === 'Manager' || role === 'Admin') {
        fetchWorksheetOverview();
      }
    }
  }, [userLoading, role]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    switch (name) {
      case 'date':
        setDate(value);
        break;
      case 'worksheetTitle':
        setWorksheetTitle(value);
        break;
      case 'worksheetDescription':
        setWorksheetDescription(value);
        break;
      default:
        break;
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    console.log("Submitting worksheet:", { assign_name, role, assign_to, date, worksheetTitle, worksheetDescription });

    try {
      await axios.post('http://localhost:5000/api/worksheets', {
        assign_name,
        role,
        assign_to,
        date,
        worksheetTitle,
        worksheetDescription,
      });
      setLoading(false);
      toast.success('Worksheet submitted successfully!');
      setDate('');
      setWorksheetTitle('');
      setWorksheetDescription('');

      await fetchWorksheets();
      
      if (role === 'Manager' || role === 'Admin') {
        await fetchWorksheetOverview();
      }
    } catch (err) {
      setLoading(false);
      console.error('Error submitting worksheet:', err);
      toast.error('Failed to submit the worksheet. Please try again.');
    }
  };

  const handleSelectionChange = (newSelection: any) => {
    setSelectedRows(newSelection.selectionModel);
  };

  const handleEdit = (id: string) => {
    console.log(`Edit worksheet with ID: ${id}`);
    // Implement edit functionality as needed
  };

  const handleView = (id: string) => {
    // Find the selected worksheet by _id
    const worksheet = worksheetOverview.find(w => w._id === id) || worksheets.find(w => w._id === id);
    if (worksheet) {
      setSelectedWorksheet(worksheet);
      setModalOpen(true);
    } else {
      console.error(`Worksheet with ID ${id} not found.`);
      toast.error('Worksheet not found.');
    }
  };

  const rows = worksheets.map((worksheet) => {
    const dateObject = new Date(worksheet.date);
    const formattedDate = dateObject.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const formattedTime = dateObject.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    return {
      id: worksheet._id, // Use the actual _id
      date: formattedDate,
      time: formattedTime,
      worksheetTitle: worksheet.worksheetTitle,
      worksheetDescription: worksheet.worksheetDescription,
      _original: worksheet,
    };
  });
  
  const overviewRows = worksheetOverview.map((worksheet) => {
    const dateObject = new Date(worksheet.date);
    const formattedDate = dateObject.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const formattedTime = dateObject.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    return {
      id: worksheet._id, // Use the actual _id
      date: formattedDate,
      time: formattedTime,
      worksheetTitle: worksheet.worksheetTitle,
      worksheetDescription: worksheet.worksheetDescription,
      assign_name: worksheet.assign_name,
      role: worksheet.role,
      _original: worksheet,
    };
  });

  const columns = [
    {
      field: 'date',
      headerName: 'Date',
      flex: 1,
    },
    {
      field: 'time',
      headerName: 'Time',
      flex: 1,
    },
    {
      field: 'worksheetTitle',
      headerName: 'Worksheet Title',
      flex: 1.5,
    },
    {
      field: 'worksheetDescription',
      headerName: 'Description',
      flex: 2,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      renderCell: (params: any) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          {/* Edit Icon - Only for Admin and Manager */}
          {(role === 'Admin' || role === 'Manager') && (
            <IconButton color="primary" onClick={() => handleEdit(params.row.id)}>
              <Edit />
            </IconButton>
          )}
          {/* Visibility Icon - Available to all roles */}
          <IconButton color="secondary" onClick={() => handleView(params.row.id)}>
            <Visibility />
          </IconButton>
        </Box>
      ),
    },
  ];

  const overviewColumns = [
    {
      field: 'date',
      headerName: 'Date',
      flex: 1,
    },
    {
      field: 'time',
      headerName: 'Time',
      flex: 1,
    },
    {
      field: 'worksheetTitle',
      headerName: 'Worksheet Title',
      flex: 1.5,
    },
    {
      field: 'worksheetDescription',
      headerName: 'Description',
      flex: 2,
    },
    {
      field: 'assign_name',
      headerName: 'Assigned By',
      flex: 1.5,
    },
    {
      field: 'role',
      headerName: 'Role',
      flex: 1,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.5,
      renderCell: (params: any) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton color="primary" onClick={() => handleView(params.row.id)}>
            <Visibility />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <>
      <Box sx={{ maxWidth: 1200, margin: 'auto', padding: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h5">Submit Worksheet</Typography>
          {userLoading ? (
            <CircularProgress size={40} color="primary" />
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <TextField
                label="Date"
                variant="outlined"
                name="date"
                type="date"
                value={date}
                onChange={handleChange}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Worksheet Title"
                variant="outlined"
                name="worksheetTitle"
                value={worksheetTitle}
                onChange={handleChange}
                fullWidth
                required
              />
              <TextField
                label="Worksheet Description"
                variant="outlined"
                name="worksheetDescription"
                value={worksheetDescription}
                onChange={handleChange}
                fullWidth
                required
                multiline
                rows={4}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                startIcon={loading && <CircularProgress size={20} />}
              >
                {loading ? 'Submitting...' : 'Submit Worksheet'}
              </Button>
            </form>
          )}
        </Box>

        {/* Data Table Section */}
        <Box>
          <Typography variant="h6">Worksheets Data</Typography>
          <div style={{ height: 400, width: '100%' }}>
            <DataGrid
              rows={rows}
              columns={columns}
              pageSize={5}
              rowsPerPageOptions={[5]}
              checkboxSelection
              onSelectionModelChange={handleSelectionChange}
              selectionModel={selectedRows}
            />
          </div>
        </Box>

        {/* Conditional Worksheet Overview Section */}
        {(role === "Manager" || role === "Admin") && (
          <Box sx={{ marginTop: 3 }}>
            <Typography variant="h6">Worksheet Overview</Typography>
            <div style={{ height: 400, width: '100%' }}>
              <DataGrid
                rows={overviewRows}
                columns={overviewColumns}
                pageSize={5}
                rowsPerPageOptions={[5]}
              />
            </div>
          </Box>
        )}
      </Box>

      <ToastContainer />

      {/* Modal for Viewing Worksheet Details */}
      {selectedWorksheet && (
        <WorksheetDetailModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          worksheet={selectedWorksheet}
          userRole={role}
        />
      )}
    </>
  );
};

export default WorksheetManagement;
