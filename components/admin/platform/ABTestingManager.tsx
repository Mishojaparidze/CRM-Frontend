import React, { useState, useEffect, useCallback } from 'react';
import { ABTest } from '../../../types';
import * as api from '../../../services/mockApiService';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Spinner } from '../../ui/Spinner';
import { Alert } from '../../ui/Alert';

const TestStatusBadge: React.FC<{ status: ABTest['status'] }> = ({ status }) => {
    const colors = {
        Running: 'bg-green-600 text-green-100',
        Paused: 'bg-yellow-600 text-yellow-100',
        Completed: 'bg-gray-600 text-gray-100',
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[status]}`}>{status}</span>;
}

export const ABTestingManager: React.FC = () => {
    const [tests, setTests] = useState<ABTest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchTests = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await api.getABTests();
            setTests(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch A/B tests.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTests();
    }, [fetchTests]);

    return (
        <Card>
            <CardHeader className="flex justify-between items-center">
                <div>
                    <CardTitle>A/B Testing Framework</CardTitle>
                    <p className="text-sm text-dark-text-secondary mt-1">Manage and analyze experiments.</p>
                </div>
                <Button onClick={() => alert('A/B Test creation wizard coming soon!')} className="w-auto">New A/B Test</Button>
            </CardHeader>
            <CardContent>
                {error && <Alert message={error} type="error" />}
                {isLoading ? (
                    <div className="flex justify-center py-16"><Spinner /></div>
                ) : tests.length === 0 ? (
                    <p className="text-center text-dark-text-secondary py-16">No A/B tests have been created yet.</p>
                ) : (
                    <div className="space-y-6">
                        {tests.map(test => (
                            <Card key={test.id} className="bg-gray-800">
                                <CardHeader className="flex justify-between items-center">
                                    <CardTitle className="text-base">{test.name}</CardTitle>
                                    <TestStatusBadge status={test.status} />
                                </CardHeader>
                                <CardContent>
                                    <table className="min-w-full">
                                        <thead>
                                            <tr>
                                                <th className="py-2 text-left text-xs font-medium text-dark-text-secondary uppercase">Variant</th>
                                                <th className="py-2 text-left text-xs font-medium text-dark-text-secondary uppercase">Users</th>
                                                <th className="py-2 text-left text-xs font-medium text-dark-text-secondary uppercase">Conversion Rate</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {test.variants.map(variant => (
                                                <tr key={variant.name}>
                                                    <td className="py-2 text-sm text-dark-text">{variant.name}</td>
                                                    <td className="py-2 text-sm text-dark-text-secondary">{variant.users.toLocaleString()}</td>
                                                    <td className="py-2 text-sm text-dark-text-secondary">{(variant.conversionRate * 100).toFixed(2)}%</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};