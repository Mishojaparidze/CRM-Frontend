import React from 'react';

interface ToggleSwitchProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ id, label, checked, onChange }) => {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-dark-text-secondary">{label}</span>
      <label htmlFor={id} className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          id={id}
          className="sr-only peer"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-secondary peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
      </label>
    </div>
  );
};
