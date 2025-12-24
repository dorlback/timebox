import React from 'react';

interface ErrorToastProps {
  message: string;
}

export const ErrorToast: React.FC<ErrorToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed top-6 right-6 bg-red-100 border-2 border-red-400 text-red-800 px-4 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
      <p className="font-semibold">{message}</p>
    </div>
  );
};