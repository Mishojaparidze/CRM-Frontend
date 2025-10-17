import React, { useState, useEffect, useCallback } from 'react';
import { GamingActivity } from '../../types';
import * as api from '../../services/mockApiService';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Spinner } from '../ui/Spinner';

interface GamingActivityFeedProps {
    userId: string;
}

export const GamingActivityFeed: React.FC<GamingActivityFeedProps> = ({ userId }) => {
    const [activities, setActivities] = useState<GamingActivity[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchActivities = useCallback(async () => {
        if (!userId) return;
        setIsLoading(true);
        try {
            const response = await api.getAllGamingActivities(); // In a real app, this would be a direct query for one user
            const userActivities = response.data
                .filter(a => a.userId === userId && !['deposit', 'withdrawal'].includes(a.type))
                .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .slice(0, 10);
            setActivities(userActivities);
        } catch (err) {
            console.error('Failed to fetch gaming activities:', err);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchActivities();
    }, [fetchActivities]);

    const renderActivity = (activity: GamingActivity) => {
        const amountStr = `$${activity.amount.toFixed(2)}`;
        switch (activity.type) {
            case 'bet':
                return <>Placed a <span className="font-semibold">{amountStr}</span> bet on <span className="text-brand-secondary">{activity.game}</span></>;
            case 'win':
                return <>Won <span className="font-semibold text-green-400">{amountStr}</span> on <span className="text-brand-secondary">{activity.game}</span></>;
            case 'loss':
                 return <>Lost <span className="font-semibold text-red-400">{amountStr}</span> on <span className="text-brand-secondary">{activity.game}</span></>;
            case 'jackpot':
                 return <>Hit a JACKPOT of <span className="font-bold text-yellow-400">{amountStr}</span> on <span className="text-brand-secondary">{activity.game}</span>!</>;
            default:
                return null;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Gaming Activity</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center"><Spinner /></div>
                ) : activities.length === 0 ? (
                    <p className="text-dark-text-secondary text-center py-10">No recent gaming activity found.</p>
                ) : (
                    <ul className="divide-y divide-dark-border">
                        {activities.map(act => (
                            <li key={act.id} className="py-3">
                                <p className="text-sm text-dark-text">{renderActivity(act)}</p>
                                <p className="text-xs text-dark-text-secondary mt-1">{new Date(act.timestamp).toLocaleString()}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
};
