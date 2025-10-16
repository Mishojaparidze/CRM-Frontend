import React, { useState, useEffect, useCallback } from 'react';
import { GamingActivity } from '../../types';
import * as api from '../../services/mockApiService';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Spinner } from '../ui/Spinner';
import { Alert } from '../ui/Alert';

interface GamingActivityFeedProps {
    userId: string;
}

const ActivityIcon: React.FC<{ type: GamingActivity['type'] }> = ({ type }) => {
    const iconMap = {
        deposit: { path: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z", color: "text-green-400" },
        withdrawal: { path: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z", color: "text-red-400" },
        bet: { path: "M14.121 15.536A9.004 9.004 0 0112 15c-1.464 0-2.822.38-3.992 1.034-1.14.63-2.14 1.488-2.91 2.492A9.001 9.001 0 014 9c0-5.186 4.418-9.42 9.879-8.983L12 0l-1.879.017A9.952 9.952 0 002 9c0 5.523 4.477 10 10 10 2.21 0 4.254-.72 5.922-1.966-.432-.61-.78-1.282-1.034-1.998zM12 4a1 1 0 110 2 1 1 0 010-2z", color: "text-blue-400" },
        win: { path: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6", color: "text-yellow-400" },
        loss: { path: "M13 16h8m0 0V8m0 8l-8-8-4 4-6-6", color: "text-orange-400" },
        jackpot: { path: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l-3 3m6 0l-3 3M9 12a3 3 0 11-6 0 3 3 0 016 0zm12 0a3 3 0 11-6 0 3 3 0 016 0zM9 12h6m-6 3h6m6-3a3 3 0 11-6 0 3 3 0 016 0z", color: "text-purple-400" },
    }
    const selected = iconMap[type] || iconMap.bet;
    return (
        <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-dark-card border border-dark-border ${selected.color}`}>
            <svg xmlns="http://www.w.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={selected.path} />
            </svg>
        </div>
    );
};

export const GamingActivityFeed: React.FC<GamingActivityFeedProps> = ({ userId }) => {
    const [activities, setActivities] = useState<GamingActivity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchActivities = useCallback(async () => {
        if (!userId) return;
        setIsLoading(true);
        try {
            const response = await api.getGamingActivityForUser(userId);
            setActivities(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch gaming activity.');
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchActivities();
    }, [fetchActivities]);

    const renderDescription = (activity: GamingActivity) => {
        const amountStr = activity.amount ? `$${activity.amount.toFixed(2)}` : '';
        switch (activity.type) {
            case 'deposit': return <><span className="font-semibold">Deposit:</span> <span className="text-green-400">{amountStr}</span></>;
            case 'withdrawal': return <><span className="font-semibold">Withdrawal:</span> <span className="text-red-400">{amountStr}</span></>;
            case 'bet': return <><span className="font-semibold">Bet:</span> {amountStr} on <span className="text-brand-secondary">{activity.game}</span></>;
            case 'win': return <><span className="font-semibold">Win:</span> <span className="text-yellow-400">{amountStr}</span> on <span className="text-brand-secondary">{activity.game}</span></>;
            case 'loss': return <><span className="font-semibold">Loss:</span> {amountStr} on <span className="text-brand-secondary">{activity.game}</span></>;
            case 'jackpot': return <><span className="font-semibold text-purple-400">JACKPOT:</span> <span className="text-purple-400">{amountStr}</span> on <span className="text-brand-secondary">{activity.game}</span></>;
            default: return 'Unknown activity';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Gaming Activity</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center py-10"><Spinner /></div>
                ) : error ? (
                    <Alert message={error} type="error" />
                ) : activities.length === 0 ? (
                    <p className="text-dark-text-secondary text-center py-10">
                        No gaming activity recorded for this user.
                    </p>
                ) : (
                    <ul className="space-y-4">
                        {activities.map(activity => (
                            <li key={activity.id} className="flex items-center space-x-4">
                                <ActivityIcon type={activity.type} />
                                <div className="flex-1">
                                    <p className="text-sm text-dark-text">{renderDescription(activity)}</p>
                                    <p className="text-xs text-dark-text-secondary">{new Date(activity.timestamp).toLocaleString()}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
};