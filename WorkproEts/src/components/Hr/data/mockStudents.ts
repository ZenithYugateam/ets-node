import { Student } from '../types/student';

export const MOCK_STUDENTS: Student[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    course: 'Computer Science',
    grade: 'A',
    status: 'active',
    enrollmentDate: '2024-01-15',
  },
  {
    id: '2',
    name: 'Bob Wilson',
    email: 'bob@example.com',
    course: 'Mathematics',
    grade: 'B+',
    status: 'active',
    enrollmentDate: '2024-02-01',
  },
  {
    id: '3',
    name: 'Carol Smith',
    email: 'carol@example.com',
    course: 'Physics',
    grade: 'A-',
    status: 'inactive',
    enrollmentDate: '2024-01-20',
  },
];