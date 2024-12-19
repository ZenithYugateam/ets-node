import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from "./ui/Modal";
import FormInput from "./ui/FormInput";

interface User {
  empId: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  company: string;
  department: string;
  departmentId: string;
  otherDepartments: string[];
  role: string;
  manager?: string;
  joinedDate: string;
}

interface FormError {
  field: string;
  message: string;
}

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<User>;
}

const ROLES = ["Employee", "Manager", "HR", "Accountant"];
const COMPANIES = ["IDA", "IPU"];

const UserForm: React.FC<UserFormProps> = ({ isOpen, onClose, initialData }) => {
  const [formData, setFormData] = useState<Partial<User>>({
    ...initialData,
    otherDepartments: [],
  });
  const [errors, setErrors] = useState<FormError[]>([]);
  const [departments, setDepartments] = useState<{ name: string; departmentId: string }[]>([]);
  const [availableManagers, setAvailableManagers] = useState<User[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch departments based on selected company
  useEffect(() => {
    const fetchDepartments = async () => {
      if (!formData.company) return;

      try {
        const response = await fetch(
          `http://localhost:5000/api/getdepartments/hr?company=${formData.company}`
        );
        if (!response.ok) throw new Error("Failed to fetch departments");
        const result = await response.json();
        setDepartments(result.data || []);
      } catch (error) {
        console.error("Error fetching departments:", error.message);
        setDepartments([]);
      }
    };

    fetchDepartments();
  }, [formData.company]);

  // Fetch managers based on selected company and department
  useEffect(() => {
    const fetchManagers = async () => {
      if (!formData.company || !formData.department) return;

      try {
        const response = await fetch(
          `http://localhost:5000/api/managers/hr?company=${formData.company}&department=${formData.department}`
        );
        if (!response.ok) throw new Error("Failed to fetch managers");
        const result = await response.json();
        setAvailableManagers(result.data || []);
      } catch (error) {
        console.error("Error fetching managers:", error.message);
        setAvailableManagers([]);
      }
    };

    fetchManagers();
  }, [formData.company, formData.department]);

  // Generate employee ID dynamically
  useEffect(() => {
    const generateEmpId = async () => {
      if (formData.company && formData.departmentId) {
        try {
          const response = await fetch(
            `http://localhost:5000/api/generate-empid/hr?company=${formData.company}&departmentId=${formData.departmentId}`
          );
          if (!response.ok) throw new Error("Failed to generate employee ID");
          const result = await response.json();
          setFormData((prev) => ({ ...prev, empId: result.empId }));
        } catch (error) {
          console.error("Error generating empId:", error.message);
        }
      }
    };

    generateEmpId();
  }, [formData.company, formData.departmentId]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "department") {
      const selectedDepartment = departments.find((dept) => dept.name === value);
      setFormData((prev) => ({
        ...prev,
        department: value,
        departmentId: selectedDepartment?.departmentId || "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    setErrors((prev) => prev.filter((error) => error.field !== name));
  };

  // Handle checkbox selection for other departments
  const handleOtherDepartmentChange = (departmentName: string) => {
    setFormData((prev) => {
      const isSelected = prev.otherDepartments?.includes(departmentName);
      return {
        ...prev,
        otherDepartments: isSelected
          ? prev.otherDepartments?.filter((name) => name !== departmentName)
          : [...(prev.otherDepartments || []), departmentName],
      };
    });
  };

  // Validate form fields
  const validateForm = (): boolean => {
    const newErrors: FormError[] = [];
    const requiredFields = ["name", "email", "phone", "password", "company", "department", "role"];

    requiredFields.forEach((field) => {
      if (!formData[field as keyof User]?.trim()) {
        newErrors.push({ field, message: `${field.charAt(0).toUpperCase() + field.slice(1)} is required` });
      }
    });

    if (formData.role === "Employee" && !formData.manager) {
      newErrors.push({ field: "manager", message: "Manager is required for employees" });
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("http://localhost:5000/api/users/hr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to submit form");
      }

      toast.success("User created successfully!");
      setFormData({ otherDepartments: [] });
      onClose();
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">{initialData ? "Edit User" : "Add New User"}</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company as Radio Buttons */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Company</label>
          <div className="flex space-x-4">
            {COMPANIES.map((company) => (
              <label key={company} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="company"
                  value={company}
                  checked={formData.company === company}
                  onChange={handleChange}
                  className="form-radio text-blue-600"
                />
                <span>{company}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Input Fields */}
        <FormInput label="Name" name="name" value={formData.name || ""} onChange={handleChange} />
        <FormInput label="Email" name="email" type="email" value={formData.email || ""} onChange={handleChange} />
        <FormInput label="Phone Number" name="phone" type="tel" value={formData.phone || ""} onChange={handleChange} />
        <FormInput label="Password" name="password" type="password" value={formData.password || ""} onChange={handleChange} />

        <FormInput
          label="Role"
          name="role"
          type="select"
          value={formData.role || ""}
          onChange={handleChange}
          options={[{ value: "", label: "Select Role" }, ...ROLES.map((role) => ({ value: role, label: role }))]}
        />

        <FormInput
          label="Main Department"
          name="department"
          type="select"
          value={formData.department || ""}
          onChange={handleChange}
          options={[{ value: "", label: "Select Main Department" }, ...departments.map((d) => ({ value: d.name, label: d.name }))]}
        />

        {/* Other Departments Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Other Departments</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDropdown((prev) => !prev)}
              className="w-full bg-white border border-gray-300 rounded-md px-4 py-2 text-left focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              {formData.otherDepartments?.length
                ? formData.otherDepartments.join(", ")
                : "Select Other Departments"}
              <span className="float-right">▼</span>
            </button>

            {showDropdown && (
              <div className="absolute mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-40 overflow-y-auto">
                {departments.map((department) => (
                  <label
                    key={department.name}
                    className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.otherDepartments?.includes(department.name) || false}
                      onChange={() => handleOtherDepartmentChange(department.name)}
                      className="form-checkbox h-5 w-5 text-blue-600 border-gray-300 rounded"
                    />
                    <span className="ml-2">{department.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {formData.role === "Employee" && (
          <FormInput
            label="Manager"
            name="manager"
            type="select"
            value={formData.manager || ""}
            onChange={handleChange}
            options={[{ value: "", label: "Select Manager" }, ...availableManagers.map((m) => ({ value: m.name, label: m.name }))]}
          />
        )}

        <FormInput label="Joining Date" name="joinedDate" type="date" value={formData.joinedDate || ""} onChange={handleChange} />
        <FormInput label="Employee ID" name="empId" readOnly value={formData.empId || ""} />

        <div className="flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
          <button
            type="submit"
            className={`px-4 py-2 text-white rounded ${isSubmitting ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UserForm;
