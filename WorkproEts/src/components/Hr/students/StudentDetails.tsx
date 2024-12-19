import React from 'react';

interface Student {
  _id: string;
  name: string;
  age: number;
  hasPassport: boolean;
  highestQualification: string;
  status: string;
  enrollmentDate: string;
}

interface StudentDetailsProps {
  student: Student;
}

const StudentDetails: React.FC<StudentDetailsProps> = ({ student }) => {
  if (!student) {
    return <div className="text-red-500">No student data available</div>;
  }

  return (
    <div className="space-y-4 bg-white p-6 rounded shadow-md">
      <h2 className="text-lg font-bold text-gray-800">Student Details</h2>
      <div className="grid grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <p className="text-sm font-medium text-gray-500">Name</p>
          <p className="mt-1 text-gray-800">{student.name}</p>
        </div>

        {/* Age */}
        <div>
          <p className="text-sm font-medium text-gray-500">Age</p>
          <p className="mt-1 text-gray-800">{student.age}</p>
        </div>

        {/* Passport */}
        <div>
          <p className="text-sm font-medium text-gray-500">Has Passport</p>
          <p className="mt-1 text-gray-800">{student.hasPassport ? 'Yes' : 'No'}</p>
        </div>

        {/* Highest Qualification */}
        <div>
          <p className="text-sm font-medium text-gray-500">Highest Qualification</p>
          <p className="mt-1 text-gray-800">{student.highestQualification}</p>
        </div>

        {/* Status */}
        <div>
          <p className="text-sm font-medium text-gray-500">Status</p>
          <p className="mt-1 text-gray-800 capitalize">{student.status}</p>
        </div>

        {/* Enrollment Date */}
        <div>
          <p className="text-sm font-medium text-gray-500">Enrollment Date</p>
          <p className="mt-1 text-gray-800">
            {new Date(student.enrollmentDate).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentDetails;
