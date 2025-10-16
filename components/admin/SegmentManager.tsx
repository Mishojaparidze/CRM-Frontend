
import React, { useState, useEffect, useCallback } from 'react';
import { Segment } from '../../types';
// FIX: Use relative path for mockApiService
import * as api from '../../services/mockApiService';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { Alert } from '../ui/Alert';

export const SegmentManager: React.FC = () => {
    const [segments, setSegments] = useState<Segment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchSegments = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await api.getSegments();
            setSegments(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch segments.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSegments();
    }, [fetchSegments]);

    return (
        <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="mb-4 md:mb-0">
                    <CardTitle>User Segments</CardTitle>
                    <p className="mt-1 text-sm text-dark-text-secondary">Manage dynamic, rule-based groups of users.</p>
                </div>
                <Button onClick={() => alert('Segment builder coming soon!')} className="w-full md:w-auto">
                    Create New Segment
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
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Segment Name</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Description</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Users</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-dark-card divide-y divide-dark-border">
                                {segments.map(segment => (
                                    <tr key={segment.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-dark-text">{segment.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-normal text-sm text-dark-text-secondary max-w-md">{segment.description}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text font-semibold">{segment.userCount?.toLocaleString() ?? 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                            <button className="text-brand-secondary hover:text-brand-primary disabled:opacity-50 disabled:cursor-not-allowed" disabled>Edit</button>
                                            <button className="text-red-500 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed" disabled>Delete</button>
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