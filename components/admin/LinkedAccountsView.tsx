
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../../services/mockApiService';
import { User } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Spinner } from '../ui/Spinner';
import { Alert } from '../ui/Alert';
import { StatusBadge } from './StatusBadge';

interface LinkedAccountsViewProps {
    userId: string;
}

interface LinkedAccount {
    user: User;
    reason: string;
}

export const LinkedAccountsView: React.FC<LinkedAccountsViewProps> = ({ userId }) => {
    const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchLinkedAccounts = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await api.findLinkedAccounts(userId);
            setLinkedAccounts(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch linked accounts.');
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchLinkedAccounts();
    }, [fetchLinkedAccounts]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Linked Accounts</CardTitle>
            </CardHeader>
            <CardContent>
                <Alert message={error} type="error" />
                {isLoading ? (
                    <div className="flex justify-center"><Spinner /></div>
                ) : linkedAccounts.length === 0 ? (
                    <p className="text-dark-text-secondary text-center py-10">No linked accounts found based on shared IP addresses.</p>
                ) : (
                    <ul className="divide-y divide-dark-border">
                        {linkedAccounts.map(({ user, reason }) => (
                            <li key={user.id} className="py-4 flex items-center justify-between">
                                <div>
                                    <Link to={`/admin/user/${user.id}`} className="text-sm font-medium text-brand-secondary hover:text-brand-primary hover:underline">
                                        {user.username}
                                    </Link>
                                    <p className="text-xs text-dark-text-secondary">{user.email}</p>
                                    <p className="text-xs text-yellow-400 mt-1 font-mono">{reason}</p>
                                </div>
                                <StatusBadge status={user.status} />
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
};