import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { cn } from "../../lib/utils";
import { Separator } from "../../../src/ui/Separator";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog";
import { ScrollArea } from "../../ui/scroll-area";
import { format } from 'date-fns';
import { Button as MuiButton } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type Priority = 'Low' | 'Medium' | 'High';
type Status = 'Completed' | 'In Progress' | 'Pending';

interface Task {
  _id: string;
  projectName: string;
  taskName: string;
  employeeName: string;
  priority: Priority;
  deadline: string | null;
  description: string;
  managerName: string;
  status: Status;
  remarks: string[];
}

interface TaskDetailItemProps {
  label: string;
  value: string;
  valueColor?: string;
  className?: string;
}

interface TaskStatusBadgeProps {
  status: Status;
  className?: string;
}

interface TaskPriorityBadgeProps {
  priority: Priority;
  className?: string;
}

const statusStyles = {
  Completed: "bg-green-100 text-green-700 hover:bg-green-100",
  "In Progress": "bg-amber-100 text-amber-700 hover:bg-amber-100",
  Pending: "bg-blue-100 text-blue-700 hover:bg-blue-100",
} as const;

const priorityStyles = {
  High: "bg-red-100 text-red-700 hover:bg-red-100",
  Medium: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  Low: "bg-green-100 text-green-700 hover:bg-green-100",
} as const;

export function TaskDetailItem({ label, value, valueColor, className }: TaskDetailItemProps) {
  return (
    <div className={cn("flex flex-col space-y-1", className)}>
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className={cn("text-base font-semibold", valueColor)}>{value}</dd>
    </div>
  );
}

export function TaskStatusBadge({ status, className }: TaskStatusBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "px-3 py-1 font-medium",
        statusStyles[status],
        className
      )}
    >
      {status}
    </Badge>
  );
}

export function TaskPriorityBadge({ priority, className }: TaskPriorityBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "px-3 py-1 font-medium",
        priorityStyles[priority],
        className
      )}
    >
      {priority}
    </Badge>
  );
}

const TaskViewEmployee: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [userName, setUserName] = useState<string | null>(sessionStorage.getItem('userName'));
  const [selectedRows, setSelectedRows] = useState<string[]>([]); // Track selected row IDs
  const [openDialog, setOpenDialog] = useState<boolean>(false); 
  const [selectedTask, setSelectedTask] = useState<Task | null>(null); // Store selected task for modal
  const [remarks, setRemarks] = useState<string[]>([]); 
  const [newRemark, setNewRemark] = useState<string>(''); 
  const [message, setMessage] = useState<string>("");

  const fetchTasks = async (employeeName: string) => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/tasks/employee', { employeeName });
      console.log('Fetched tasks: ', response.data);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userName) {
      fetchTasks(userName);
    }
  }, [userName]);

  const fetchRemarks = async (taskId: string) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/remarks/${taskId}`);
      setRemarks(response.data.remarks); 
    } catch (error) {
      console.error("Error fetching remarks:", error);
    }
  };

  const handleRowSelection = (newSelection: any) => {
    setSelectedRows(newSelection.rowIds);
  };

  const handleOpenDialog = (task: Task) => {
    setSelectedTask(task); 
    fetchRemarks(task._id);
    setOpenDialog(true);   
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);  
  };

  const handleAddNotes = async () => {
    if (newRemark.trim()) {
      try {
        if (selectedTask) {
          
          await axios.put(`http://localhost:5000/api/Employee/notes`, {
            id: selectedTask._id,
            note: newRemark, 
          });
          
          
          setRemarks((prevRemarks) => [...prevRemarks, newRemark]); 
          setNewRemark(''); 
          
          toast.success('Note added successfully!', {
            position: 'top-right', 
            autoClose: 5000,  
            hideProgressBar: false,  
            closeOnClick: true,  
            pauseOnHover: true,  
          });
        }
      } catch (error) {
        console.error("Error adding note:", error);
        toast.error('Failed to add note. Please try again.', {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
      } finally{
        handleCloseDialog();
      }
    }
  };

  const columns: GridColDef[] = [
    { field: 'projectName', headerName: 'Project Name', width: 200 },
    { field: 'taskName', headerName: 'Task Name', width: 200 },
    { field: 'priority', headerName: 'Priority', width: 120 },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      renderCell: (params) => {
        const status = params.value;
        const statusStyles = {
          Completed: "bg-green-100 text-green-800",
          "In Progress": "bg-yellow-100 text-yellow-800",
          Pending: "bg-blue-100 text-violet-800",
          Default: "bg-gray-100 text-gray-800",
        };

        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status] || statusStyles.Default}`}
          >
            {status}
          </span>
        );
      },
    },
    {
      field: 'remarks',
      headerName: 'Remarks',
      width: 300,
      renderCell: (params) => (params.value && params.value.length > 0 ? params.value.join(', ') : 'No Remarks'),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <MuiButton
          variant="outlined"
          color="primary"
          onClick={() => handleOpenDialog(params.row)}
          sx={{
            borderColor: 'skyblue',  
            '&:hover': {
              borderColor: 'skyblue', 
            },
            '&.MuiButton-outlined': {
              borderColor: 'skyblue',
            }
          }}
        >
          Add Note →
        </MuiButton>
      ),
    }
        
  ];

  return (
    <div style={{ height: 400, width: '100%' }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      ) : (
        <DataGrid
          rows={tasks}
          columns={columns}
          pageSize={5}
          getRowId={(row) => row._id}
          checkboxSelection
          onSelectionModelChange={(newSelection) => handleRowSelection(newSelection)}
          selectionModel={selectedRows}
          sx={{
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#f0f4f8", 
              color: "#333", 
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: "bold", 
            },
          }}
        />
      )}

      {/* Task Details Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white">
          <DialogHeader className="px-6 pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <DialogTitle className="text-2xl font-semibold tracking-tight">
                  Task Details
                </DialogTitle>
              </div>
              <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={() => {
            handleCloseDialog();
            setNewRemark('');
            setRemarks([]);
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </Button>
            </div>
          </DialogHeader>
          <Separator className="my-4" />
          <ScrollArea className="px-6 pb-6 max-h-[calc(80vh-8rem)]">
            <div className="grid gap-6">
              <div className="grid gap-4 md:grid-cols-2">
                <TaskDetailItem label="Project Name" value={selectedTask?.projectName || 'N/A'} />
                <TaskDetailItem label="Task Name" value={selectedTask?.taskName || 'N/A'} />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <TaskDetailItem label="Employee Name" value={selectedTask?.employeeName || 'N/A'} />
                <TaskDetailItem label="Deadline" value={selectedTask?.deadline ? format(new Date(selectedTask.deadline), "PPP") : 'N/A'} />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">Priority</span>
                  <div className="pt-1">
                    <TaskPriorityBadge priority={selectedTask?.priority || 'Low'} />
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">Status</span>
                  <div className="pt-1">
                    <TaskStatusBadge status={selectedTask?.status || 'Pending'} />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-sm font-medium text-muted-foreground">Description</span>
                <p className="text-sm leading-relaxed text-foreground">{selectedTask?.description || 'No description available'}</p>
              </div>

              <div className="space-y-1">
                <span className="text-sm font-medium text-muted-foreground">Remarks</span>
                <div className="space-y-2">
                  {remarks.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No remarks yet</p>
                  ) : (
                    remarks.map((remark, index) => (
                      <div key={index} className="p-2 bg-gray-100 rounded-md">
                        <p>{remark}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* New Section for Notes */}
              <div className="space-y-1">
                <span className="text-sm font-medium text-muted-foreground">Notes</span>
                <div className="space-y-2">
                  {selectedTask?.notes && selectedTask.notes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No notes yet</p>
                  ) : (
                    selectedTask?.notes?.map((note, index) => (
                      <div key={index} className="p-2 bg-gray-100 rounded-md">
                        <p>{note}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Add Notes Section */}
              <div className="space-y-1">
                <span className="text-sm font-medium text-muted-foreground">Add Notes *</span>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={4}
                  value={newRemark}
                  onChange={(e) => setNewRemark(e.target.value)}
                  placeholder="Type your notes here..."
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  onClick={handleAddNotes} // Assuming handleAddNotes will handle adding notes
                  className="relative px-6 py-2 text-sm font-semibold text-white bg-blue-500 rounded-lg shadow-md hover:bg-blue-600 hover:scale-105 transition-all duration-200"
                >
                  <span className="inline-flex items-center space-x-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.75 12h16.5m0 0-6.75-6.75M20.25 12l-6.75 6.75"
                      />
                    </svg>
                    <span>Send</span>
                  </span>
                </Button>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
      <ToastContainer 
        position="top-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default TaskViewEmployee;
