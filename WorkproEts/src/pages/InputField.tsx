import React from 'react';

interface InputFieldProps {
  icon: React.ReactNode;
  type: string;
  placeholder: string;
}

const InputField: React.FC<InputFieldProps> = ({ icon, type, placeholder }) => {
  return (
    <div className="relative">
      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
        {icon}
      </span>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full pl-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      />
    </div>
  );
};

export default InputField;
