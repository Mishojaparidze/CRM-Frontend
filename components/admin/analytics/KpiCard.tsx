import React from 'react';
import { Card, CardContent } from '../../ui/Card';

interface KpiCardProps {
    title: string;
    value: string | number;
}

export const KpiCard: React.FC<KpiCardProps> = ({ title, value }) => {
    return (
        <Card>
            <CardContent>
                <p className="text-sm font-medium text-dark-text-secondary truncate">{title}</p>
                <p className="mt-1 text-3xl font-semibold text-dark-text">{value}</p>
            </CardContent>
        </Card>
    );
};