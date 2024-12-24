// src/components/WorksheetManagement.tsx

import { Box, Button, CircularProgress, TextField, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import { Eye, CalendarIcon, UserCircle, Briefcase, FileText, Clock, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { ScrollArea } from '../../ui/scroll-area';
import { Card } from "../../ui/card";

const WorksheetManagement = () => {
  // State Declarations
  const [assign_name, setAssignName] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [assign_to, setAssignTo] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [worksheetTitle, setWorksheetTitle] = useState<string>('');
  const [worksheetDescription, setWorksheetDescription] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [userLoading, setUserLoading] = useState<boolean>(true);

  const [worksheets, setWorksheets] = useState<any[]>([]);
  const [worksheetOverview, setWorksheetOverview] = useState<any[]>([]);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [storedRole, setStoredRole] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);

  // Fetch User Details
  const fetchUserDetails = async () => {
    try {
      const response = await axios.get(`https://ets-node-dpa9.onrender.com/api/user/${sessionStorage.getItem('userId')}`);
      setAssignName(sessionStorage.getItem('userName') || '');
      setRole(response.data.role);
      setAssignTo(response.data.manager);
      setUserLoading(false);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setUserLoading(false);
      toast.error('Failed to fetch user data.');
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  // Fetch Worksheets for Employees
  const fetchWorksheets = async () => {
    try {
      const response = await axios.post('https://ets-node-dpa9.onrender.com/api/worksheetsData', { assign_name: sessionStorage.getItem('userName') });
      setWorksheets(response.data);
    } catch (err) {
      console.error('Error fetching worksheet data:', err);
      toast.error('Failed to fetch worksheet data.');
    }
  };

  // Fetch Worksheet Overview for Managers and Admins
  const fetchWorksheetOverview = async () => {
    try {
      const response = await axios.post('https://ets-node-dpa9.onrender.com/api/worksheets/manager', {
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

  // Handle Form Input Changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('https://ets-node-dpa9.onrender.com/api/worksheets', {
        assign_name,
        role,
        assign_to,
        date,
        worksheetTitle,
        worksheetDescription,
      });
      setLoading(false);
      toast.success('Worksheet submitted successfully!');
      // Reset Form Fields
      setDate('');
      setWorksheetTitle('');
      setWorksheetDescription('');
    } catch (err) {
      setLoading(false);
      console.error('Error submitting worksheet:', err);
      toast.error('Failed to submit the worksheet. Please try again.');
    } finally {
      fetchWorksheets();
    }
  };

  // Handle DataGrid Selection
  const handleSelectionChange = (newSelection: any) => {
    setSelectedRows(newSelection.selectionModel);
  };

  // Handle View Button Click
  const handleView = (params: any) => {
    setSelectedRow(params.row);
    setOpen(true);
  };

  // Close Dialog
  const handleClose = () => {
    setOpen(false);
    setSelectedRow(null);
  };

  // Prepare Rows for Employee Worksheets
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

  // Prepare Rows for Worksheet Overview (Managers/Admins)
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

  // Define Columns for Employee Worksheets DataGrid
  const columns = [
    {
      field: 'date',
      headerName: 'Date',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell',
    },
    {
      field: 'time',
      headerName: 'Time',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell',
    },
    {
      field: 'worksheetTitle',
      headerName: 'Worksheet Title',
      flex: 1.5,
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell',
    },
    {
      field: 'worksheetDescription',
      headerName: 'Description',
      flex: 2,
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell',
    }
  ];

  // Define Columns for Worksheet Overview DataGrid
  const overviewColumns = [
    {
      field: 'date',
      headerName: 'Date',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'time',
      headerName: 'Time',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'worksheetTitle',
      headerName: 'Worksheet Title',
      flex: 1.5,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'worksheetDescription',
      headerName: 'Description',
      flex: 2,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'assign_name',
      headerName: 'Assigned By',
      flex: 1.5,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'role',
      headerName: 'Role',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => (
        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
          {params.value}
        </span>
      ),
    },
    {
      field: "action",
      headerName: "Action",
      width: 120,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => (
        <Button
          variant="contained"
          size="small"
          startIcon={<Eye className="h-4 w-4" />}
          onClick={() => handleView(params)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <>
      {/* Main Container */}
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Conditional Rendering Based on Role */}
          {storedRole !== 'Admin' && (
            <div className="space-y-8">
              {/* Submit Worksheet Section */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                {/* Header */}
                <div className="flex items-center space-x-3 mb-6">
                  <FileText className="h-7 w-7 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Submit Worksheet</h2>
                </div>

                {/* Loading Indicator */}
                {userLoading ? (
                  <div className="flex justify-center py-12">
                    <CircularProgress size={40} className="text-blue-600" />
                  </div>
                ) : (
                  /* Worksheet Submission Form */
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Date and Title Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <TextField
                        label="Date"
                        variant="outlined"
                        name="date"
                        type="date"
                        value={date}
                        onChange={handleChange}
                        required
                        InputLabelProps={{ shrink: true }}
                        className="bg-white"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: '#3b82f6',
                            },
                          },
                        }}
                      />
                      <TextField
                        label="Worksheet Title"
                        variant="outlined"
                        name="worksheetTitle"
                        value={worksheetTitle}
                        onChange={handleChange}
                        required
                        className="bg-white"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: '#3b82f6',
                            },
                          },
                        }}
                      />
                    </div>
                    {/* Description Field */}
                    <TextField
                      label="Worksheet Description"
                      variant="outlined"
                      name="worksheetDescription"
                      value={worksheetDescription}
                      onChange={handleChange}
                      required
                      multiline
                      rows={4}
                      className="w-full bg-white"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: '#3b82f6',
                          },
                        },
                      }}
                    />
                    {/* Submit Button */}
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition-all transform hover:scale-105"
                        startIcon={loading && <CircularProgress size={20} />}
                      >
                        {loading ? 'Submitting...' : 'Submit Worksheet'}
                      </Button>
                    </div>
                  </form>
                )}
              </div>

              {/* Worksheets History Section */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                {/* Header */}
                <div className="flex items-center space-x-3 mb-6">
                  <Clock className="h-7 w-7 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Worksheets History</h2>
                </div>
                {/* DataGrid */}
                <div style={{ height: 400 }} className="w-full">
                  <DataGrid
                    rows={rows}
                    columns={columns}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                    checkboxSelection
                    onSelectionModelChange={handleSelectionChange}
                    selectionModel={selectedRows}
                    className="border-none"
                    sx={{
                      border: 'none',
                      '& .super-app-theme--header': {
                        backgroundColor: '#f8fafc',
                        color: '#1e293b',
                        fontWeight: 'bold',
                      },
                      '& .MuiDataGrid-cell': {
                        borderBottom: '1px solid #f1f5f9',
                      },
                      '& .MuiDataGrid-row:hover': {
                        backgroundColor: '#f8fafc',
                      },
                      '& .MuiCheckbox-root': {
                        color: '#3b82f6',
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Team Overview Section for Managers and Admins */}
          {storedRole && (storedRole === 'Manager' || storedRole === 'Admin') && (
            <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
              {/* Header */}
              <div className="flex items-center space-x-3 mb-6">
                <UserCircle className="h-7 w-7 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Team Worksheets Overview</h2>
              </div>
              {/* DataGrid */}
              <div style={{ height: 400 }} className="w-full">
                <DataGrid
                  rows={overviewRows}
                  columns={overviewColumns}
                  pageSize={5}
                  rowsPerPageOptions={[5]}
                  className="border-none"
                  sx={{
                    border: 'none',
                    '& .super-app-theme--header': {
                      backgroundColor: '#f8fafc',
                      color: '#1e293b',
                      fontWeight: 'bold',
                    },
                    '& .MuiDataGrid-cell': {
                      borderBottom: '1px solid #f1f5f9',
                    },
                    '& .MuiDataGrid-row:hover': {
                      backgroundColor: '#f8fafc',
                    },
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Details Dialog */}
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white rounded-xl">
          {/* Dialog Header */}
          <DialogHeader className="px-6 pt-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Worksheet Details
              </DialogTitle>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-500 transition-colors"
                aria-label="Close Details Dialog"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </DialogHeader>
          
          {/* Dialog Body */}
          <Card className="p-8">
            <ScrollArea className="h-[calc(80vh-8rem)]">
              <div className="space-y-8">
                {/* Title Section */}
                <div className="pb-6 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedRow?.worksheetTitle}
                  </h2>
                </div>

                {/* Description Section */}
                <div className="space-y-3 pb-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Description</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {selectedRow?.worksheetDescription}
                  </p>
                </div>

                {/* Details Grid */}
                <div className="grid gap-6">
                  {/* Assignment Info */}
                  <div className="flex items-center space-x-4">
                    <UserCircle className="h-5 w-5 text-blue-600" />
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-500">Assigned To</p>
                      <span className="inline-flex items-center px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                        {selectedRow?.assign_name}
                      </span>
                    </div>
                  </div>

                  {/* Role Info */}
                  <div className="flex items-center space-x-4">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-500">Role</p>
                      <span className="inline-flex items-center px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">
                        {selectedRow?.role}
                      </span>
                    </div>
                  </div>

                  {/* Date Info */}
                  <div className="flex items-center space-x-4">
                    <CalendarIcon className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Date</p>
                      <p className="text-sm text-gray-600 mt-1">
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

      {/* Toast Notifications */}
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </>
  );
};

export default WorksheetManagement;
