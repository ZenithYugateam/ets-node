import React, { useState, useEffect } from 'react';
import { GraduationCap, Users, BookOpen, Award } from 'lucide-react';
import { Student, StudentFormData } from '../Types/student';
import DataGrid from '../shared/DataGrid';
import Modal from '../shared/Modal';
import Card from '../shared/Card';
import Button from '../shared/Button';
import StudentForm from '../students/StudentForm';
import StudentDetails from '../students/StudentDetails';
import Side from '../../Hr/Side'; // Import the Sidebar component

const columns = [
  { field: 'name', header: 'Name' },
  { field: 'age', header: 'Age' },
  {
    field: 'hasPassport',
    header: 'Passport',
    render: (value: boolean) => (value ? 'Yes' : 'No'),
  },
  { field: 'highestQualification', header: 'Highest Qualification' },
  {
    field: 'status',
    header: 'Status',
    render: (value: string) => (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${
          value === 'enrolled'
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}
      >
        {value.charAt(0).toUpperCase() + value.slice(1)}
      </span>
    ),
  },
  {
    field: 'enrollmentDate',
    header: 'Enrollment Date',
    render: (value: string) => new Date(value).toLocaleDateString(),
  },
];

const StudentsPage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [loading, setLoading] = useState(false);

  // Fetch students from the backend
  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:5000/api/getstudents/hr');
        if (!response.ok) {
          throw new Error('Failed to fetch students');
        }
        const data = await response.json();
        setStudents(data.data);
      } catch (error) {
        console.error('Error fetching students:', error.message);
        alert('Error fetching students.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const handleAdd = () => {
    setModalMode('add');
    setSelectedStudent(null);
    setIsModalOpen(true);
  };

  const handleEdit = (student: Student) => {
    setModalMode('edit');
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleView = (student: Student) => {
    setModalMode('view');
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleSubmit = async (formData: StudentFormData) => {
    try {
      if (modalMode === 'add') {
        const response = await fetch('http://localhost:5000/api/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error('Failed to add student');
        }

        const newStudent = await response.json();
        setStudents([...students, newStudent.data]);
      } else if (modalMode === 'edit' && selectedStudent) {
        const response = await fetch(
          `http://localhost:5000/api/getstudents/hr`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to update student');
        }

        const updatedStudent = await response.json();
        setStudents(
          students.map((student) =>
            student._id === selectedStudent._id
              ? { ...student, ...updatedStudent.data }
              : student
          )
        );
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error submitting form:', error.message);
      alert('Error saving student.');
    }
  };

  const getModalTitle = () => {
    switch (modalMode) {
      case 'add':
        return 'Add New Student';
      case 'edit':
        return 'Edit Student';
      case 'view':
        return 'Student Details';
      default:
        return '';
    }
  };

  return (
    <div className="flex">
      <Side /> {/* Include the Sidebar */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 mt-14 lg:mt-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Students</h1>
          <Button variant="primary" icon={GraduationCap} onClick={handleAdd}>
            Add Student
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card
            title="Total Students"
            value={students.length}
            icon={Users}
            trend={{ value: 12, isPositive: true }}
          />
          <Card
            title="Enrolled Students"
            value={students.filter((s) => s.status === 'enrolled').length}
            icon={GraduationCap}
            trend={{ value: 5, isPositive: true }}
          />
          <Card
            title="Qualifications"
            value={new Set(students.map((s) => s.highestQualification)).size}
            icon={BookOpen}
          />
          <Card
            title="Honor Students"
            value={students.filter((s) => s.grade === 'A').length}
            icon={Award}
            trend={{ value: 8, isPositive: true }}
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <p className="text-center py-4">Loading students...</p>
          ) : (
            <DataGrid
              columns={columns}
              data={students}
              onEdit={handleEdit}
              onView={handleView}
            />
          )}
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={getModalTitle()}
        >
          {modalMode === 'view' && selectedStudent ? (
            <StudentDetails student={selectedStudent} />
          ) : (
            <StudentForm
              initialData={selectedStudent || undefined}
              onSubmit={handleSubmit}
              onCancel={() => setIsModalOpen(false)}
            />
          )}
        </Modal>
      </div>
    </div>
  );
};

export default StudentsPage;
