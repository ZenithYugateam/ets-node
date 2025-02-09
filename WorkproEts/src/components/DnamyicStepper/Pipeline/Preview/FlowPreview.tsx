import React, { useState } from 'react';
import { useStore } from '../store';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Question } from '../types';

interface FlowPreviewProps {
  onClose: () => void;
}

export function FlowPreview({ onClose }: FlowPreviewProps) {
  const { flows, currentFlowId } = useStore();
  const [currentStep, setCurrentStep] = useState(0);

  const currentFlow = flows.find(f => f.id === currentFlowId);
  const nodes = currentFlow?.nodes || [];
  const currentNode = nodes[currentStep];
  const totalSteps = nodes.length;

  const renderQuestionPreview = (question: Question) => {
    switch (question.type) {
      case 'shortAnswer':
      case 'email':
      case 'url':
      case 'phone':
        return (
          <input
            type={question.type === 'email' ? 'email' : question.type === 'url' ? 'url' : question.type === 'phone' ? 'tel' : 'text'}
            placeholder={`Enter ${question.type === 'shortAnswer' ? 'text' : question.type}`}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );
      case 'paragraph':
        return (
          <textarea
            placeholder="Enter your answer"
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );
      case 'multipleChoice':
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center gap-3">
                <input
                  type="radio"
                  name={question.id}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );
      case 'checkbox':
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );
      case 'dropdown':
        return (
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select an option</option>
            {question.options?.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      case 'date':
        return (
          <input
            type="date"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );
      case 'time':
        return (
          <input
            type="time"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );
      case 'location':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 text-center">
            <div className="text-gray-500">Location picker will be shown here</div>
          </div>
        );
      case 'image':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 text-center">
            <div className="text-gray-500">Image upload will be shown here</div>
          </div>
        );
      default:
        return null;
    }
  };

  if (!currentNode) return null;

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 flex items-center justify-between bg-white">
        <h2 className="text-xl font-bold text-gray-800">Flow Preview: {currentFlow?.name}</h2>
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
        >
          Close
        </button>
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Step {currentStep + 1} of {totalSteps}
            </span>
            <span className="text-sm font-medium text-gray-600">
              {Math.round(((currentStep + 1) / totalSteps) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {currentNode.data.label}
            </h3>
            <p className="text-gray-600">{currentNode.data.description}</p>
          </div>

          <div className="space-y-8">
            {currentNode.data.form?.questions.map((question, index) => (
              <div key={question.id} className="space-y-3">
                <label className="block text-base font-medium text-gray-900">
                  {index + 1}. {question.title}
                  {question.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                {renderQuestionPreview(question)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="border-t border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={() => setCurrentStep(prev => prev - 1)}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              currentStep === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <ChevronLeft size={20} />
            Previous
          </button>
          <div className="flex gap-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  currentStep === index
                    ? 'bg-blue-600 w-6'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>
          <button
            onClick={() => setCurrentStep(prev => prev + 1)}
            disabled={currentStep === totalSteps - 1}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              currentStep === totalSteps - 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Next
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}