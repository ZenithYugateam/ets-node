import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { format, parse } from 'date-fns';
import AttendanceTable from '../pages/AttendenceTable';
import { CalendarDays, ArrowLeft } from 'lucide-react';
import axios from 'axios';

export default function DayDetails() {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const [attendanceData, setAttendanceData] = useState({
    managers: [],
    employees: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  let parsedDate: Date;
  if (date) {
    try {
      parsedDate = parse(date, 'yyyy-MM-dd', new Date());
    } catch (error) {
      console.error('Error parsing date:', error);
      parsedDate = new Date(); // Fallback to the current date
    }
  } else {
    console.warn('No date provided in the URL.');
    parsedDate = new Date(); // Fallback to the current date
  }

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`https://ets-node-1.onrender.com/api/attendance/${date}`);
        
        const { managers, employees } = response.data;
        setAttendanceData({
          managers: managers || [],
          employees: employees || [],
        });
      } catch (err: any) {
        console.error('Error fetching attendance data:', err.message);
        setError(err.response?.data?.message || 'Failed to fetch attendance data');
      } finally {
        setLoading(false);
      }
    };

    if (date) fetchAttendanceData();
  }, [date]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-4 sm:py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <div className="mb-4 sm:mb-6">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Back to Calendar</span>
            </button>
          </div>

          {/* Date and Header */}
          <div className="flex items-center space-x-3 mb-4 sm:mb-6">
            <CalendarDays className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
              Attendance for{' '}
              {isNaN(parsedDate.getTime())
                ? 'Invalid Date'
                : format(parsedDate, 'MMMM d, yyyy')}
            </h1>
          </div>

          {/* Attendance Tables */}
          <div className="space-y-4 sm:space-y-6">
            <AttendanceTable
              title="Managers"
              data={attendanceData.managers || []}
            />
            <AttendanceTable
              title="Employees"
              data={attendanceData.employees || []}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
