export interface Student {
  id: string;
  name: string;
  email: string;
  course: string;
  grade: string;
  status: 'active' | 'inactive';
  enrollmentDate: string;
}

export interface StudentFormData {
  age: string | number | readonly string[] | undefined;
  highestQualification: string | number | readonly string[] | undefined;
  hasPassport: boolean;
  name: string;
  email: string;
  course: string;
  grade: string;
  status: 'active' | 'inactive';
}