import React from 'react';

interface SuccessToastProps {
  message: string;
}

export const SuccessToast: React.FC<SuccessToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed top-6 right-6 bg-green-100 border-2 border-green-400 text-green-800 px-4 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
      <p className="font-semibold">{message}</p>
    </div>
  );
};