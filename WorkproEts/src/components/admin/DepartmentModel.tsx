import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import {
  Box,
  Button,
  Modal,
  TextField,
  Typography,
  IconButton,
} from "@mui/material";
import { toast } from "react-toastify";
import axios from "axios";

interface DepartmentModalProps {
  open: boolean;
  onClose: () => void;
  departmentFormData: DepartmentFormData;
  onFormDataChange: (formData: DepartmentFormData) => void;
  onAddSubDepartment: () => void;
  onRemoveSubDepartment: (index: number) => void;
  onSubDepartmentChange: (
    index: number,
    field: "name" | "description",
    value: string
  ) => void;
  onSave: () => Promise<void>;
}

interface SubDepartment {
  name: string;
  description: string;
  employees?: any[]; // Added to match your schema
}

interface DepartmentFormData {
  name: string;
  description: string;
  subDepartments: SubDepartment[];
}

interface DepartmentModalProps {
  open: boolean;
  onClose: () => void;
  onDepartmentCreated: (newDepartment: any) => void;
}

const DepartmentModal: React.FC<DepartmentModalProps> = ({
  open,
  onClose,
  onDepartmentCreated,
}) => {
  const [formData, setFormData] = useState<DepartmentFormData>({
    name: "",
    description: "",
    subDepartments: [{ name: "", description: "" }],
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      subDepartments: [{ name: "", description: "" }],
    });
  };

  const handleDepartmentChange = (
    field: keyof DepartmentFormData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubDepartmentChange = (
    index: number,
    field: keyof SubDepartment,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      subDepartments: prev.subDepartments.map((subDept, i) =>
        i === index ? { ...subDept, [field]: value } : subDept
      ),
    }));
  };

  const addSubDepartment = () => {
    setFormData((prev) => ({
      ...prev,
      subDepartments: [...prev.subDepartments, { name: "", description: "" }],
    }));
  };

  const removeSubDepartment = (index: number) => {
    if (formData.subDepartments.length === 1) {
      toast.warning("At least one sub-department is required");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      subDepartments: prev.subDepartments.filter((_, i) => i !== index),
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast.error("Department name is required");
      return false;
    }

    if (!formData.description.trim()) {
      toast.error("Department description is required");
      return false;
    }

    const invalidSubDepts = formData.subDepartments.some(
      (subDept) => !subDept.name.trim() || !subDept.description.trim()
    );

    if (invalidSubDepts) {
      toast.error("All sub-department fields are required");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    try {
      if (!validateForm()) return;

      const response = await axios.post(
        "https://ets-node-dpa9.onrender.com/api/departments/add",
        formData
      );

      toast.success("Department created successfully");
      // onDepartmentCreated(response.data);
      resetForm();
      onClose();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message;
      // toast.error(`Error creating department: ${errorMessage}`);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        <Typography variant="h6" component="h2" mb={3}>
          Add New Department
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <TextField
            label="Department Name"
            value={formData.name}
            onChange={(e) => handleDepartmentChange("name", e.target.value)}
            fullWidth
            required
          />

          <TextField
            label="Department Description"
            value={formData.description}
            onChange={(e) =>
              handleDepartmentChange("description", e.target.value)
            }
            fullWidth
            multiline
            rows={2}
            required
          />

          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" component="h3" mb={2}>
              Sub-Departments
            </Typography>

            {formData.subDepartments.map((subDept, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  gap: 2,
                  mb: 2,
                  alignItems: "flex-start",
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <TextField
                    label="Sub-Department Name"
                    value={subDept.name}
                    onChange={(e) =>
                      handleSubDepartmentChange(index, "name", e.target.value)
                    }
                    fullWidth
                    required
                    size="small"
                    sx={{ mb: 1 }}
                  />
                  <TextField
                    label="Sub-Department Description"
                    value={subDept.description}
                    onChange={(e) =>
                      handleSubDepartmentChange(
                        index,
                        "description",
                        e.target.value
                      )
                    }
                    fullWidth
                    multiline
                    rows={2}
                    required
                    size="small"
                  />
                </Box>
                <IconButton
                  onClick={() => removeSubDepartment(index)}
                  color="error"
                  sx={{ mt: 1 }}
                >
                  <X />
                </IconButton>
              </Box>
            ))}

            <Button
              startIcon={<Plus />}
              onClick={addSubDepartment}
              variant="outlined"
              sx={{ mt: 1 }}
            >
              Add Sub-Department
            </Button>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button variant="outlined" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSubmit}>
              Create Department
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default DepartmentModal;
