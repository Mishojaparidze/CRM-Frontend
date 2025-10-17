
import React, { useState, useEffect, useCallback } from 'react';
import { UserSession } from '../../types';
import * as api from '../../services/mockApiService';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { Spinner } from '../ui/Spinner';

interface UserSessionsManagerProps {
    userId: string;
}

export const UserSessionsManager: React.FC<UserSessionsManagerProps> = ({ userId }) => {
    const [sessions, setSessions] = useState<UserSession[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const fetchSessions = useCallback(async () => {
        if (!userId) return;
        setIsLoading(true);
        setError('');
        try {
            const response = await api.getUserSessions(userId);
            setSessions(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch sessions.');
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    const handleTerminateSession = async (sessionId: string) => {
        if (!window.confirm('Are you sure you want to terminate this session? This will log the user out on that device.')) return;
        
        setError('');
        setMessage('');
        try {
            await api.terminateUserSession(sessionId);
            setMessage('Session terminated successfully.');
            fetchSessions(); // Refresh the list
        } catch (err: any) {
            setError(err.message || 'Failed to terminate session.');
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Active User Sessions</CardTitle>
            </CardHeader>
            <CardContent>
                <Alert message={error} type="error" />
                <Alert message={message} type="success" />
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="flex justify-center py-8"><Spinner /></div>
                    ) : sessions.length === 0 ? (
                        <p className="text-center text-dark-text-secondary py-8">No active sessions found.</p>
                    ) : (
                        <ul className="divide-y divide-dark-border">
                            {sessions.map(session => (
                                <li key={session.id} className="py-4 flex flex-col md:flex-row md:items-center md:justify-between">
                                    <div className="flex-1 mb-4 md:mb-0">
                                        <p className="text-sm font-medium text-dark-text">
                                            IP Address: <span className="font-mono text-brand-secondary">{session.ipAddress}</span>
                                        </p>
                                        <p className="text-xs text-dark-text-secondary mt-1 truncate" title={session.userAgent}>
                                            {session.userAgent}
                                        </p>
                                        <p className="text-xs text-dark-text-secondary mt-2">
                                            Logged in on: {new Date(session.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <Button 
                                            variant="danger" 
                                            className="w-full md:w-auto"
                                            onClick={() => handleTerminateSession(session.id)}
                                        >
                                            Terminate Session
                                        </Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};