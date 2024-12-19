import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../utils/classNames';

interface MetricCardProps {
  title: string;
  count: number;
  icon: LucideIcon;
  gradient: string;
}

export function MetricCard({ title, count, icon: Icon, gradient }: MetricCardProps) {
  return (
    <div 
      className={cn(
        "relative overflow-hidden bg-white rounded-2xl p-6 shadow-sm border border-gray-100",
        gradient
      )}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <Icon className="w-6 h-6 text-gray-700" />
          <span className="text-3xl font-semibold text-gray-900">{count}</span>
        </div>
        <h3 className="text-sm font-medium text-gray-700">{title}</h3>
      </div>
    </div>
  );
}