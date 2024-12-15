// import { Edit } from '@mui/icons-material';
import { Box, Button, CircularProgress, TextField, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import { Eye } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { ScrollArea } from '../../ui/scroll-area';
import { CalendarIcon, UserCircle, Briefcase } from "lucide-react";
import { Card } from "../../ui/card";

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
  const [storedRole, setStoredRole] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const fetchUserDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5001/api/user/${sessionStorage.getItem('userId')}`);
      setAssignName(sessionStorage.getItem('userName'));
      setRole(response.data.role);
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

  const fetchWorksheets = async () => {
    try {
      const response = await axios.post('http://localhost:5001/api/worksheetsData', { assign_name: sessionStorage.getItem('userName') });
      setWorksheets(response.data);
    } catch (err) {
      console.error('Error fetching worksheet data:', err);
      toast.error('Failed to fetch worksheet data.');
    }
  };

  const fetchWorksheetOverview = async () => {
    try {
      const response = await axios.post('http://localhost:5001/api/worksheets/manager', {
        assign_to: sessionStorage.getItem('userName'),
        role: sessionStorage.getItem('role')?.slice(1, -1) === "Manager" ? "Employee" : "Manager"
      });
      setWorksheetOverview(response.data);
    } catch (err) {
      console.error('Error fetching worksheet overview:', err);
      toast.error('Failed to fetch worksheet overview.');
    }
  };

  useEffect(() => {
    
    let storedRoles: string | null = sessionStorage.getItem('role');
  
    if(storedRoles?.slice(1,-1) !== 'Admin'){
      fetchWorksheets();
    }

    if (storedRoles) {
      storedRoles = storedRoles.substring(1, storedRoles.length - 1);
      setStoredRole(storedRoles);
    }

    if (storedRoles === 'Manager' || storedRoles === 'Admin') {
      fetchWorksheetOverview();
    }
  }, []);

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
      await axios.post('http://localhost:5001/api/worksheets', {
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

  const handleView = async (params: any) => {
    setSelectedRow(params.row);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRow(null);
  };

  const rows = worksheets.map((worksheet, index) => {
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
    }
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
      field: "action",
      headerName: "Action",
      width: 120,
      renderCell: (params : any) => {
        return (
          <Button
          variant="contained"
          startIcon={<Eye />}
          onClick={() => handleView(params)}
        >
          View
        </Button>
        )
      },
    },
  ];

  return (
    <>
      <Box sx={{ maxWidth: 1200, margin: 'auto', padding: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {storedRole !== 'Admin' && (
          <>
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
          </>
        )}

        {storedRole && (storedRole === 'Manager' || storedRole === 'Admin') && (
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

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white">
          <DialogHeader className="px-6 pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <DialogTitle className="text-2xl font-semibold tracking-tight">
                  Worksheet Details
                </DialogTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={handleClose}
              >
              </Button>
            </div>
          </DialogHeader>
          <Card className="p-6">
          <ScrollArea className="h-[calc(80vh-8rem)]">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">{selectedRow?.worksheetTitle}</h2>
              </div>

             

              {/* Description Section */}
              <div className="space-y-2">
                <h3 className="text-md font-large leading-none">Description</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedRow?.worksheetDescription}
                </p>
              </div>

              {/* <Separator /> */}

              {/* Details Grid */}
              <div className="grid gap-6">
                {/* Assignment Info */}
                <div className="flex items-center space-x-4">
                  <UserCircle className="h-4 w-4 text-muted-foreground" />
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium leading-none">Assigned To</p>
                    {/* Chip for name */}
                    <span className="inline-flex items-center px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                      {selectedRow?.assign_name}
                    </span>
                  </div>
                </div>

                {/* Role Info */}
                <div className="flex items-center space-x-4">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium leading-none">Role</p>
                    {/* Chip for role */}
                    <span className="inline-flex items-center px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">
                      {selectedRow?.role}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium leading-none">Date</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedRow?.date}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
    </Card>
        </DialogContent>
      </Dialog>
      <ToastContainer />
    </>
  );
};

export default WorksheetManagement;
