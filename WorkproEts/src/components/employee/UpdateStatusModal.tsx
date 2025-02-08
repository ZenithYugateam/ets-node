import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select } from "@mui/material";
import axios from "axios";
import React, { useState } from "react";
import { toast } from "react-toastify";
import {
  UrgencyLevel
} from "../../utils/calculateTimeRemaining";
type Priority = "Low" | "Medium" | "High";
type Status = "Completed" | "In Progress" | "Pending";
interface Task {
  _id: string;
  projectName: string;
  taskName: string;
  employees: string[];
  priority: Priority;
  deadline: string | null;
  description: string;
  managerName: string;
  status: Status;
  remarks: string[];
  droneRequired: string;
  dgpsRequired?: string;
  selectedEmployees: string[];
  currentStep: string;
  estimatedHours: number;

  // Timer logic fields
  timeRemaining: string;
  urgencyLevel: UrgencyLevel;
  estimatedTimeRemaining: string;
  estimatedUrgencyLevel: UrgencyLevel;
  displayTimeRemaining: string;
  displayUrgencyLevel: UrgencyLevel;
  notified12?: boolean;
  notified6?: boolean;
  notified3?: boolean;

  // Accept/Complete fields
  accepted?: boolean;
  acceptedAt?: string;
  completedAt?: string;
  timeUsed?: number; 
  timeLeft?: number; // leftover hours

  // Notes field
  notes?: string[];
}

interface UpdateStatusModalProps {
  open: boolean;
  onClose: () => void;
  task: Task;
  currentStatus: string;
  fetchTasks : () => void;
}

const updateTaskScore = async (task: Task) => {

  if (!task.acceptedAt || !task.completedAt || !task.estimatedHours) return;

  const acceptedTime = new Date(task.acceptedAt).getTime();
  const completedTime = new Date(task.completedAt).getTime();
  const timeUsed = (completedTime - acceptedTime) / 3600000; 

  const earlyPercentage = (task.estimatedHours - timeUsed) / task.estimatedHours;

  let rawScore = 0;
  if (earlyPercentage >= 0.7) {
    rawScore = 4;
  } else if (earlyPercentage >= 0.5) {
    rawScore = 3; 
  } else if (earlyPercentage >= 0.3) {
    rawScore = 2; 
  } else if (earlyPercentage >= 0) {
    rawScore = 1; 
  } else {
    rawScore = 0; 
  }

  
  const difficulty = task.priority || "Easy";
  let multiplier = 1;
  if (difficulty === "Medium") {
    multiplier = 2;
  } else if (difficulty === "High") {
    multiplier = 3;
  }

  const finalScore = rawScore * multiplier;

  try {
    await axios.put(`https://ets-node-1.onrender.com/api/tasks/score`, {
      taskId: task._id,
      score: finalScore,
      userid: sessionStorage.getItem('userId'),
      userName: sessionStorage.getItem('userName')
    });
    console.log(`Task ${task._id} score updated to ${finalScore}`);
  } catch (error) {
    console.error("Error updating task score:", error);
  }
};

const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({ open, onClose, task, currentStatus, fetchTasks}) => {
  const [status, setStatus] = useState<string>(currentStatus);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.put(`https://ets-node-1.onrender.com/api/manager-tasks/update-status`, {
        id: task,
        status,
      });

      if(status === 'Completed'){
        await updateTaskScore(task);
      }

      toast.success("Status updated successfully!", {
        position: "top-right",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });

      fetchTasks();  
      onClose();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status. Please try again.", {
        position: "top-right",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Update Task Status</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2}>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            fullWidth
          >
            <MenuItem value="Completed">Completed</MenuItem>
            <MenuItem value="In Progress">In Progress</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
          </Select>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary" disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          color="primary"
          variant="contained"
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateStatusModal;