
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-dark-card shadow-lg rounded-lg overflow-hidden ${className}`}>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export const CardHeader: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`pb-4 border-b border-dark-border ${className}`}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <h3 className={`text-lg leading-6 font-medium text-dark-text ${className}`}>
      {children}
    </h3>
  );
};

export const CardContent: React.FC<CardProps> = ({ children, className = '' }) => {
    return (
      <div className={`pt-6 ${className}`}>
        {children}
      </div>
    );
  };
