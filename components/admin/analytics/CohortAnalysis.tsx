import React, { useMemo } from 'react';
import { User } from '../../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';

interface CohortAnalysisProps {
    users: User[];
}

export const CohortAnalysis: React.FC<CohortAnalysisProps> = ({ users }) => {
    const cohortData = useMemo(() => {
        // This is a simplified cohort analysis. A real one would be more complex.
        const cohorts: { [key: string]: { total: number; retained: number } } = {};
        
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        users.forEach(user => {
            const signupDate = new Date(user.createdAt);
            const cohortKey = `${signupDate.getFullYear()}-${String(signupDate.getMonth() + 1).padStart(2, '0')}`;
            
            if (!cohorts[cohortKey]) {
                cohorts[cohortKey] = { total: 0, retained: 0 };
            }
            cohorts[cohortKey].total++;

            if (new Date(user.lastLoginAt) > thirtyDaysAgo) {
                cohorts[cohortKey].retained++;
            }
        });

        return Object.entries(cohorts)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, data]) => ({
                cohort: key,
                ...data,
                retention: data.total > 0 ? (data.retained / data.total) * 100 : 0,
            }));
    }, [users]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Monthly Sign-up Cohorts</CardTitle>
                <p className="text-sm text-dark-text-secondary mt-1">30-day retention by sign-up month.</p>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr>
                                <th className="py-2 text-left text-xs font-medium text-dark-text-secondary uppercase">Cohort</th>
                                <th className="py-2 text-left text-xs font-medium text-dark-text-secondary uppercase">Sign-ups</th>
                                <th className="py-2 text-left text-xs font-medium text-dark-text-secondary uppercase">Active (30d)</th>
                                <th className="py-2 text-left text-xs font-medium text-dark-text-secondary uppercase">Retention</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cohortData.map(cohort => (
                                <tr key={cohort.cohort}>
                                    <td className="py-2 text-sm font-semibold text-dark-text">{cohort.cohort}</td>
                                    <td className="py-2 text-sm text-dark-text-secondary">{cohort.total}</td>
                                    <td className="py-2 text-sm text-dark-text-secondary">{cohort.retained}</td>
                                    <td className="py-2 text-sm text-dark-text-secondary">
                                        <div className="flex items-center">
                                            <div className="w-20 bg-gray-700 rounded-full h-2.5 mr-2">
                                                <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${cohort.retention.toFixed(1)}%` }}></div>
                                            </div>
                                            <span>{cohort.retention.toFixed(1)}%</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
};
