// src/manager/Dialog_ui/WorksheetDetailModal.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../ui/dialog";
import { Separator } from "../../../ui/Separator";
import { ScrollArea } from "../../../ui/scroll-area";
import { Button, Typography, Box, TextField } from '@mui/material';
import { toast } from 'react-toastify';

// Define TypeScript interfaces for better type safety
interface Worksheet {
  _id: string;
  worksheetTitle: string;
  worksheetDescription: string;
  assign_name: string;
  role: string;
  date: string;
}

interface Remark {
  text: string;
  addedBy: string;
  role: string;
  addedAt: string;
}

interface WorksheetDetailModalProps {
  open: boolean;
  onClose: () => void;
  worksheet: Worksheet;
  userRole: string; // "Admin" | "Manager" | "Employee"
}

export function WorksheetDetailModal({ open, onClose, worksheet, userRole }: WorksheetDetailModalProps) {
  const [message, setMessage] = useState<string>("");
  const [remarks, setRemarks] = useState<Remark[]>([]);
  const [notes, setNotes] = useState<string[]>([]); // Assuming notes are simple strings

  // Axios instance with baseURL (optional but recommended)
  const axiosInstance = axios.create({
    baseURL: 'http://localhost:5000/api',
  });

  useEffect(() => {
    if (open && worksheet._id) {
      // Fetch remarks for the worksheet
      axiosInstance
        .get(`/worksheets/${worksheet._id}/remarks`)
        .then((response) => {
          setRemarks(response.data.remarks);
        })
        .catch((error) => {
          console.error("Error fetching remarks:", error);
          toast.error("Failed to fetch remarks.");
        });

      // Fetch notes for the worksheet (if applicable)
      axiosInstance
        .post(`/employeeNotes`, { id: worksheet._id })
        .then((response) => {
          setNotes(response.data.notes);
        })
        .catch((error) => {
          console.error("Error fetching notes:", error);
          toast.error("Failed to fetch notes.");
        });
    }
  }, [open, worksheet._id]);

  const handleSend = async () => {
    if (message.trim()) {
      try {
        // Retrieve user information from sessionStorage or another source
        const addedBy = sessionStorage.getItem('userName') || "Unknown"; // Replace with actual user name retrieval
        const role = userRole;

        // Send POST request to add a new remark
        const response = await axiosInstance.post(`/worksheets/${worksheet._id}/remarks`, {
          text: message,
          addedBy,
          role,
        });

        // Update remarks state with the new remarks array from the response
        setRemarks(response.data.remarks);
        setMessage("");
        toast.success("Remark added successfully!");
      } catch (error) {
        console.error("Error adding remark:", error);
        toast.error("Failed to add remark.");
      }
    } else {
      toast.warn("Remark cannot be empty.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
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
              onClick={onClose}
            >
              {/* Close Icon or Text */}
              X
            </Button>
          </div>
        </DialogHeader>
        <Separator className="my-4" />
        <ScrollArea className="px-6 pb-6 max-h-[calc(80vh-8rem)]">
          <Box className="grid gap-6">
            {/* Display basic worksheet info */}
            <Box>
              <Typography variant="h6"><strong>Title:</strong> {worksheet.worksheetTitle}</Typography>
              <Typography variant="body1"><strong>Description:</strong> {worksheet.worksheetDescription}</Typography>
              <Typography variant="body1"><strong>Assigned By:</strong> {worksheet.assign_name}</Typography>
              <Typography variant="body1"><strong>Role:</strong> {worksheet.role}</Typography>
              <Typography variant="body1"><strong>Date:</strong> {new Date(worksheet.date).toLocaleString()}</Typography>
            </Box>

            {/* Remarks Section */}
            <Box>
              <Typography variant="h6">Remarks:</Typography>
              {remarks.length === 0 ? (
                <Typography variant="body2">No remarks yet.</Typography>
              ) : (
                remarks.map((remark, index) => (
                  <Box key={index} className="p-2 my-2 bg-gray-100 rounded-md">
                    <Typography variant="body2"><strong>{remark.addedBy}</strong> ({remark.role})</Typography>
                    <Typography variant="body1">{remark.text}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {new Date(remark.addedAt).toLocaleString()}
                    </Typography>
                  </Box>
                ))
              )}
            </Box>

            {/* Notes Section */}
            {/* <Box>
              <Typography variant="h6">Notes:</Typography>
              {notes.length === 0 ? (
                <Typography variant="body2">No notes yet.</Typography>
              ) : (
                notes.map((note, index) => (
                  <Box key={index} className="p-2 my-2 bg-gray-100 rounded-md">
                    {note}
                  </Box>
                ))
              )}
            </Box> */}

            {/* Add Remark Section */}
            {(userRole === "Admin" || userRole === "Manager") && (
              <>
                <Box>
                  <Typography variant="h6">Add Remark:</Typography>
                  <TextField
                    multiline
                    rows={4}
                    variant="outlined"
                    fullWidth
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your remark here..."
                  />
                </Box>
                <Button
                  onClick={handleSend}
                  className="relative px-6 py-2 text-sm font-semibold text-white bg-blue-500 rounded-lg shadow-md hover:bg-blue-600 hover:scale-105 transition-all duration-200"
                >
                  Send Remark
                </Button>
              </>
            )}
          </Box>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
