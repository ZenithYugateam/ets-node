import React from 'react';

interface LeaveStatusBadgeProps {
  status: 'pending' | 'approved' | 'rejected';
  className?: string;
}

const LeaveStatusBadge: React.FC<LeaveStatusBadgeProps> = ({ status = 'pending', className = '' }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  if (!status) {
    console.error('Invalid status passed to LeaveStatusBadge:', status);
    return null; // You can return a fallback element here if necessary
  }

  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
        status
      )} ${className}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default LeaveStatusBadge;
