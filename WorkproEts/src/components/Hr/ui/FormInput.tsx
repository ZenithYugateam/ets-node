import React from 'react';
import { FormError } from '../Types/types';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement> {
  label: string;
  error?: string;
  type?: string;
  options?: { value: string; label: string }[];
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  type = 'text',
  options,
  className = '',
  ...props
}) => {
  const baseInputClasses = `
    mt-1 block w-full rounded-lg border border-gray-200
    px-4 py-2.5 text-gray-900 placeholder-gray-500
    transition-all duration-200 ease-in-out
    focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
    hover:border-gray-300
  `;

  const inputClasses = `
    ${baseInputClasses}
    ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
    ${className}
  `;

  const labelClasses = `
    block text-sm font-medium text-gray-700
    transition-all duration-200
    ${props.value ? 'text-gray-900' : ''}
    ${error ? 'text-red-500' : ''}
  `;

  return (
    <div className="relative">
      <label className={labelClasses}>
        {label}
      </label>
      
      {type === 'select' && options ? (
        <select {...props} className={inputClasses}>
          {options.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          {...props}
          className={inputClasses}
        />
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-500 transition-all duration-200">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormInput;