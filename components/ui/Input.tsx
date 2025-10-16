
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, id, className, icon, ...props }) => {
  const hasIcon = !!icon;
  const paddingClasses = hasIcon ? 'pl-10' : 'px-3';

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-dark-text-secondary">
        {label}
      </label>
      <div className="mt-1 relative">
        {hasIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={id}
          className={`appearance-none block w-full ${paddingClasses} py-2 border border-dark-border rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm bg-dark-card text-dark-text ${className}`}
          {...props}
        />
      </div>
    </div>
  );
};
