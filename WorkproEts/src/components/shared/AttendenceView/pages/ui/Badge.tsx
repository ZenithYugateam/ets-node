import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'outline' | 'success' | 'warning';
  className?: string;
}

export function Badge({ children, variant = 'primary', className = '' }: BadgeProps) {
  const baseStyles = 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium transition-colors duration-200';
  
  const variants = {
    primary: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    outline: 'border border-gray-300 text-gray-600 hover:bg-gray-50',
    success: 'bg-green-100 text-green-700 hover:bg-green-200',
    warning: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}