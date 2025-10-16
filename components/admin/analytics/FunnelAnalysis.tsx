
import React, { useMemo } from 'react';
import { User } from '../../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';

interface FunnelAnalysisProps {
    users: User[];
}

const FunnelStep: React.FC<{ name: string; value: number; percentage: number; color: string }> = ({ name, value, percentage, color }) => (
    <div className="relative text-left p-2">
        <div className="flex justify-between items-center mb-1">
            <div className="text-sm font-semibold text-dark-text">{name}</div>
            <div className="text-xs text-dark-text-secondary">{value.toLocaleString()} users ({percentage.toFixed(1)}%)</div>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-4">
            <div className={`${color} h-4 rounded-full`} style={{ width: `${percentage}%` }}></div>
        </div>
    </div>
);


export const FunnelAnalysis: React.FC<FunnelAnalysisProps> = ({ users }) => {
    const funnelData = useMemo(() => {
        const totalUsers = users.length;
        if (totalUsers === 0) return [];
        
        const kycVerified = users.filter(u => u.kycStatus === 'verified').length;
        const firstDeposit = users.filter(u => u.ltv > 0 || u.ggr !== 0).length; // simple proxy for first deposit

        return [
            { name: 'Total Signups', value: totalUsers, percentage: 100, color: 'bg-indigo-600' },
            { name: 'KYC Verified', value: kycVerified, percentage: (kycVerified / totalUsers) * 100, color: 'bg-blue-600' },
            { name: 'First Deposit', value: firstDeposit, percentage: (firstDeposit / totalUsers) * 100, color: 'bg-green-600' },
        ];
    }, [users]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>User Conversion Funnel</CardTitle>
                 <p className="text-sm text-dark-text-secondary mt-1">From Sign-up to First Deposit</p>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {funnelData.map((step, index) => (
                        <FunnelStep key={index} {...step} />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};