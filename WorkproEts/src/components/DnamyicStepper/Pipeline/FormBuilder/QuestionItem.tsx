import React from 'react';
import { Grip, Trash2, Upload, MapPin } from 'lucide-react';
import { Question } from '../types';

interface QuestionItemProps {
  question: Question;
  onUpdate: (question: Question) => void;
  onDelete: () => void;
}

export function QuestionItem({ question, onUpdate, onDelete }: QuestionItemProps) {
  const handleOptionChange = (index: number, value: string) => {
    if (!question.options) return;
    const newOptions = [...question.options];
    newOptions[index] = value;
    onUpdate({ ...question, options: newOptions });
  };

  const addOption = () => {
    const newOptions = [...(question.options || []), ''];
    onUpdate({ ...question, options: newOptions });
  };

  const removeOption = (index: number) => {
    if (!question.options) return;
    const newOptions = question.options.filter((_, i) => i !== index);
    onUpdate({ ...question, options: newOptions });
  };

  const renderQuestionInput = () => {
    switch (question.type) {
      case 'location':
        return (
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <MapPin className="text-gray-400" size={20} />
            <span className="text-gray-500">Location picker will be shown here</span>
          </div>
        );
      case 'image':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="mx-auto text-gray-400 mb-2" size={24} />
            <div className="text-sm text-gray-500">
              Drag and drop an image here, or click to select
            </div>
            <div className="mt-2 text-xs text-gray-400">
              Supported formats: JPG, PNG, GIF (Max. 5MB)
            </div>
          </div>
        );
      case 'date':
        return <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled />;
      case 'time':
        return <input type="time" className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled />;
      case 'phone':
        return (
          <input
            type="tel"
            placeholder="Phone number"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            disabled
          />
        );
      case 'email':
        return (
          <input
            type="email"
            placeholder="Email address"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            disabled
          />
        );
      case 'url':
        return (
          <input
            type="url"
            placeholder="Website URL"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            disabled
          />
        );
      case 'multipleChoice':
      case 'checkbox':
      case 'dropdown':
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-6 flex-shrink-0">
                  {question.type === 'multipleChoice' && (
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                  )}
                  {question.type === 'checkbox' && (
                    <div className="w-4 h-4 border-2 border-gray-300 rounded" />
                  )}
                  {question.type === 'dropdown' && (
                    <div className="text-gray-400 text-sm">{index + 1}.</div>
                  )}
                </div>
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <button
                  onClick={() => removeOption(index)}
                  className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            <button
              onClick={addOption}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2"
            >
              Add option
            </button>
          </div>
        );
      default:
        return (
          <input
            type="text"
            placeholder={question.type === 'shortAnswer' ? 'Short answer text' : 'Long answer text'}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            disabled
          />
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 p-4">
        <div className="cursor-move text-gray-400 hover:text-gray-600 mt-2 touch-manipulation">
          <Grip size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="space-y-4">
            <input
              type="text"
              value={question.title}
              onChange={(e) => onUpdate({ ...question, title: e.target.value })}
              placeholder="Question title"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            {renderQuestionInput()}

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={question.required}
                  onChange={(e) => onUpdate({ ...question, required: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">Required</span>
              </label>
              <button
                onClick={onDelete}
                className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}