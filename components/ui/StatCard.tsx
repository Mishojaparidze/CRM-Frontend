import React from 'react';
import { Card, CardContent } from './Card';

interface StatCardProps {
    title: string;
    value: string | number;
    icon?: React.ReactNode;
    valueClassName?: string;
    isCompact?: boolean;
}

const StatCardComponent: React.FC<StatCardProps> = ({ title, value, icon, valueClassName = '', isCompact = false }) => {
    if (isCompact) {
        return (
            <Card className="bg-gray-800">
                <CardContent className="!pt-6">
                    <p className="text-sm font-medium text-dark-text-secondary truncate">{title}</p>
                    <p className={`mt-1 text-2xl font-semibold text-dark-text ${valueClassName}`}>{value}</p>
                </CardContent>
            </Card>
        );
    }

    return (
         <Card>
            <CardContent className="flex items-center justify-between !pt-6">
                <div>
                    <p className="text-sm font-medium text-dark-text-secondary truncate">{title}</p>
                    <p className={`mt-1 text-3xl font-semibold text-dark-text ${valueClassName}`}>{value}</p>
                </div>
                {icon && (
                    <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center bg-brand-primary/80 rounded-md text-white">
                        {icon}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export const StatCard = React.memo(StatCardComponent);