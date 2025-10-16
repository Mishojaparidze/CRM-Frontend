
import React from 'react';

interface AlertProps {
  message: string;
  type: 'success' | 'error';
}

export const Alert: React.FC<AlertProps> = ({ message, type }) => {
  const baseClasses = 'p-4 mb-4 text-sm rounded-lg';
  const typeClasses = {
    success: 'bg-green-800 text-green-300',
    error: 'bg-red-800 text-red-300',
  };

  if (!message) return null;

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`} role="alert">
      {message}
    </div>
  );
};
