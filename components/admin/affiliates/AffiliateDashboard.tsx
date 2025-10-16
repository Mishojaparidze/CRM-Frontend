import React, { useState, useEffect, useCallback } from 'react';
import { Affiliate } from '../../../types';
import * as api from '../../../services/mockApiService';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Spinner } from '../../ui/Spinner';
import { Alert } from '../../ui/Alert';

const AffiliateDashboard: React.FC = () => {
    const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchAffiliates = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await api.getAffiliates();
            setAffiliates(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch affiliates.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAffiliates();
    }, [fetchAffiliates]);

    return (
        <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="mb-4 md:mb-0">
                    <CardTitle>Affiliate Management</CardTitle>
                    <p className="mt-1 text-sm text-dark-text-secondary">Track and manage your affiliate partners.</p>
                </div>
                <Button onClick={() => alert('Feature coming soon!')} className="w-full md:w-auto">
                    Add New Affiliate
                </Button>
            </CardHeader>
            <CardContent>
                {error && <Alert message={error} type="error" />}
                {isLoading ? (
                    <div className="flex justify-center py-16"><Spinner /></div>
                ) : (
                     <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-dark-border">
                            <thead className="bg-gray-800">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Affiliate Name</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Commission Rate</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Referred Users</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Total Commission</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-dark-card divide-y divide-dark-border">
                                {affiliates.map(affiliate => (
                                    <tr key={affiliate.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark-text">{affiliate.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text-secondary">{(affiliate.commissionRate * 100).toFixed(0)}%</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text-secondary">{affiliate.referredUsersCount}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text-secondary">${affiliate.totalCommissionEarned.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button className="text-brand-secondary hover:text-brand-primary">View Details</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default AffiliateDashboard;