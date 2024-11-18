import React from 'react';

interface SubmitButtonProps {
  children: React.ReactNode;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ children }) => {
  return (
    <button
      type="submit"
      className="w-full py-2 px-4 bg-indigo-600 text-white font-medium rounded hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
    >
      {children}
    </button>
  );
};

export default SubmitButton;
