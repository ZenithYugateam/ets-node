import React from 'react';
import { 
  AlignLeft, 
  CheckSquare, 
  List, 
  MessageSquare, 
  Type,
  MapPin,
  Image,
  Calendar,
  Clock,
  Phone,
  Mail,
  Link
} from 'lucide-react';
import { QuestionType } from '../types';

interface QuestionTypeSelectorProps {
  value: QuestionType;
  onChange: (type: QuestionType) => void;
}

const questionTypes = [
  { type: 'shortAnswer' as const, icon: Type, label: 'Short Answer' },
  { type: 'paragraph' as const, icon: AlignLeft, label: 'Paragraph' },
  { type: 'multipleChoice' as const, icon: MessageSquare, label: 'Multiple Choice' },
  { type: 'checkbox' as const, icon: CheckSquare, label: 'Checkboxes' },
  { type: 'dropdown' as const, icon: List, label: 'Dropdown' },
  { type: 'location' as const, icon: MapPin, label: 'Location' },
  { type: 'image' as const, icon: Image, label: 'Image Upload' },
  { type: 'date' as const, icon: Calendar, label: 'Date' },
  { type: 'time' as const, icon: Clock, label: 'Time' },
  { type: 'phone' as const, icon: Phone, label: 'Phone' },
  { type: 'email' as const, icon: Mail, label: 'Email' },
  { type: 'url' as const, icon: Link, label: 'URL' },
];

export function QuestionTypeSelector({ value, onChange }: QuestionTypeSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4">
      {questionTypes.map(({ type, icon: Icon, label }) => (
        <button
          key={type}
          onClick={() => onChange(type)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all touch-manipulation ${
            value === type
              ? 'bg-blue-50 border-blue-200 text-blue-700'
              : 'border-gray-200 hover:border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Icon size={16} />
          <span className="text-sm truncate">{label}</span>
        </button>
      ))}
    </div>
  );
}