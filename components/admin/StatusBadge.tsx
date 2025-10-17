
import React from 'react';

interface StatusBadgeProps {
  status: 'active' | 'suspended' | 'banned' | 'anonymized';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    const colorClasses = {
        active: 'bg-green-800 text-green-200',
        suspended: 'bg-yellow-800 text-yellow-200',
        banned: 'bg-red-800 text-red-200',
        anonymized: 'bg-gray-700 text-gray-200',
    };
    
    return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${colorClasses[status]}`}>
            {status}
        </span>
    );
};