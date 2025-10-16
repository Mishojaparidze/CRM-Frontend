
import React, { useMemo } from 'react';
import { User } from '../../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';

interface CohortAnalysisProps {
    users: User[];
}

export const CohortAnalysis: React.FC<CohortAnalysisProps> = ({ users }) => {
    const cohorts = useMemo(() => {
        const cohortData: Record<string, { count: number; totalLtv: number }> = {};
        
        users.forEach(user => {
            const signupDate = new Date(user.createdAt);
            const cohortKey = `${signupDate.getFullYear()}-${String(signupDate.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
            
            if (!cohortData[cohortKey]) {
                cohortData[cohortKey] = { count: 0, totalLtv: 0 };
            }
            cohortData[cohortKey].count++;
            cohortData[cohortKey].totalLtv += user.ltv;
        });

        return Object.entries(cohortData)
            .sort(([keyA], [keyB]) => keyB.localeCompare(keyA)) // Sort by most recent first
            .map(([key, data]) => ({
                month: key,
                userCount: data.count,
                totalLtv: data.totalLtv,
                avgLtv: data.count > 0 ? data.totalLtv / data.count : 0,
            }));
    }, [users]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Cohort Analysis</CardTitle>
                <p className="text-sm text-dark-text-secondary mt-1">User LTV by Sign-up Month</p>
            </CardHeader>
            <CardContent>
                 <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-dark-border">
                        <thead className="bg-gray-800">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Cohort (Sign-up Month)</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">New Users</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Total LTV</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Avg. LTV per User</th>
                            </tr>
                        </thead>
                        <tbody className="bg-dark-card divide-y divide-dark-border">
                            {cohorts.map(cohort => (
                                <tr key={cohort.month}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark-text">{cohort.month}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text-secondary">{cohort.userCount.toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text-secondary">${cohort.totalLtv.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text-secondary">${cohort.avgLtv.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
};