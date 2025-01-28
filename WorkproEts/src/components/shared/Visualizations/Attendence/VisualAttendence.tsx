import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Calendar, TrendingUp } from 'lucide-react';
import axios from 'axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);


const options = {
  responsive: true,
  interaction: {
    mode: 'index' as const,
    intersect: false,
  },
  plugins: {
    legend: {
      display: true,
      position: 'top' as const,
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          size: 12,
          family: "'Inter', sans-serif",
        },
      },
    },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      titleColor: '#1a1a1a',
      bodyColor: '#1a1a1a',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      padding: 12,
      bodyFont: {
        size: 12,
        family: "'Inter', sans-serif",
      },
      titleFont: {
        size: 14,
        family: "'Inter', sans-serif",
        weight: 'bold',
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.06)',
      },
      ticks: {
        font: {
          size: 12,
          family: "'Inter', sans-serif",
        },
      },
    },
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          size: 12,
          family: "'Inter', sans-serif",
        },
      },
    },
  },
};

type Period = 'weekly' | 'monthly' | 'yearly';

function VisualAttendance() {
  const [period, setPeriod] = useState<Period>('monthly');
  const [data, setData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`https://ets-node-1.onrender.com/api/attendance-graphs?period=${period}`);
        const labels = response.data.labels;
        const present = response.data.data.map((item: any) => item.present);
        const absent = response.data.data.map((item: any) => item.absent);
        setData({
          labels,
          datasets: [
            {
              label: 'Present',
              fill: true,
              data: present,
              borderColor: 'rgb(34, 197, 94)',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              tension: 0.4,
              pointBackgroundColor: 'rgb(255, 255, 255)',
              pointBorderColor: 'rgb(34, 197, 94)',
              pointBorderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6,
            },
            {
              label: 'Absent',
              fill: true,
              data: absent,
              borderColor: 'rgb(239, 68, 68)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              tension: 0.4,
              pointBackgroundColor: 'rgb(255, 255, 255)',
              pointBorderColor: 'rgb(239, 68, 68)',
              pointBorderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6,
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };
    fetchData();
  }, [period]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-green-50 p-2 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Attendance Dashboard</h1>
              </div>
              <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-1">
                {['weekly', 'monthly', 'yearly'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p as Period)}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                      period === p
                        ? 'bg-white shadow-sm text-gray-900 font-medium'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="bg-white rounded-xl">
              <div className="flex items-center space-x-2 mb-6">
                <Calendar className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900">
                  {period.charAt(0).toUpperCase() + period.slice(1)} Attendance Statistics
                </h2>
              </div>
              <div className="h-[400px]">
                <Line options={options} data={data} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VisualAttendance;
