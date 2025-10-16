
import React, { useState, useEffect, useCallback } from 'react';
import { AuditLog } from '../../types';
// FIX: Use relative path for mockApiService
import * as api from '../../services/mockApiService';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Spinner } from '../ui/Spinner';
import { Alert } from '../ui/Alert';

export const AuditLogView: React.FC = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchLogs = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await api.getAuditLogs();
            setLogs(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch audit logs.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Admin Audit Log</CardTitle>
            </CardHeader>
            <CardContent>
                {error && <Alert message={error} type="error" />}
                {isLoading ? (
                    <div className="flex justify-center py-8"><Spinner /></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-dark-border">
                            <thead className="bg-gray-800">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Timestamp</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Admin</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Action</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Target</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Details</th>
                                </tr>
                            </thead>
                            <tbody className="bg-dark-card divide-y divide-dark-border">
                                {logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-10 text-dark-text-secondary">
                                            No audit logs found.
                                        </td>
                                    </tr>
                                ) : logs.map(log => (
                                    <tr key={log.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text-secondary">{new Date(log.timestamp).toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text">{log.adminUsername}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text">{log.action}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text-secondary font-mono">{`${log.targetType}:${log.targetId.split('_')[1]}`}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text-secondary font-mono text-xs">{JSON.stringify(log.details)}</td>
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