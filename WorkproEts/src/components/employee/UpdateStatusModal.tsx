import React, {  useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Select, Button, Box, CircularProgress } from "@mui/material";
import axios from "axios";
import { toast } from "react-toastify";

interface UpdateStatusModalProps {
  open: boolean;
  onClose: () => void;
  taskId: string;
  currentStatus: string;
  fetchTasks : () => void;
}

const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({ open, onClose, taskId, currentStatus, fetchTasks}) => {
  const [status, setStatus] = useState<string>(currentStatus);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.put(`http://localhost:5000/api/manager-tasks/update-status`, {
        id: taskId,
        status,
      });

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