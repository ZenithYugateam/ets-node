import { Edit } from '@mui/icons-material';
import { Box, Button, CircularProgress, IconButton, TextField, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

  const fetchUserDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/user/${sessionStorage.getItem('userId')}`);
      setAssignName(sessionStorage.getItem('userName'));
      setRole(response.data.role);  // Set the fetched role
      setAssignTo(response.data.manager);
      setUserLoading(false);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setUserLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  // Fetch worksheets data for the user
  const fetchWorksheets = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/worksheetsData', { assign_name: sessionStorage.getItem('userName') });
      setWorksheets(response.data);
    } catch (err) {
      console.error('Error fetching worksheet data:', err);
      toast.error('Failed to fetch worksheet data.');
    }
  };

  // Fetch worksheet overview data, only for manager or admin roles
  const fetchWorksheetOverview = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/worksheets/manager');
      setWorksheetOverview(response.data);
    } catch (err) {
      console.error('Error fetching worksheet overview:', err);
      toast.error('Failed to fetch worksheet overview.');
    }
  };

  useEffect(() => {
    // Fetch worksheets regardless of the role
    fetchWorksheets();
    
    // Check sessionStorage role directly and fetch worksheet overview only if the role is manager or admin
    const storedRole = sessionStorage.getItem('role');
    if (storedRole === 'Manager' || storedRole === 'Admin') {
      fetchWorksheetOverview();
    }
  }, []);  // Run only once when the component is mounted

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
    } catch (err) {
      setLoading(false);
      toast.error('Failed to submit the worksheet. Please try again.');
    } finally {
      fetchWorksheets();
    }
  };

  const handleSelectionChange = (newSelection: any) => {
    setSelectedRows(newSelection.selectionModel);
  };

  const handleEdit = (id: any) => {
    console.log(`Edit worksheet with ID: ${id}`);
  };

  const rows = worksheets.map((worksheet, index) => {
    const dateObject = new Date(worksheet.date);
    const formattedDate = dateObject.toLocaleDateString('en-US', {
      weekday: 'short',  // Mon, Tue, etc.
      day: 'numeric',
      month: 'short',    // Dec, Jan, etc.
      year: 'numeric',
    });

    const formattedTime = dateObject.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,      // Use 12-hour format with AM/PM
    });

    return {
      id: index + 1,
      date: formattedDate,
      time: formattedTime,
      worksheetTitle: worksheet.worksheetTitle,
      worksheetDescription: worksheet.worksheetDescription,
    };
  });

  const overviewRows = worksheetOverview.map((worksheet, index) => {
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
      id: index + 1,
      date: formattedDate,
      time: formattedTime,
      worksheetTitle: worksheet.worksheetTitle,
      worksheetDescription: worksheet.worksheetDescription,
      assign_name: worksheet.assign_name,
      role: worksheet.role,
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
      flex: 0.5,
      renderCell: (params: any) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton color="primary" onClick={() => handleEdit(params.row.id)}>
            <Edit />
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
        {(sessionStorage.getItem('role') === "Manager" || sessionStorage.getItem('role') === "Admin") && (
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
    </>
  );
};

export default WorksheetManagement;
