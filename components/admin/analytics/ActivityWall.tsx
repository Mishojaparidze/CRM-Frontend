
import React from 'react';
import { GamingActivity, User } from '../../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { Link } from 'react-router-dom';

interface ActivityWallProps {
    activities: GamingActivity[];
    users: User[];
}

const ACTIVITY_LIMIT = 5;

export const ActivityWall: React.FC<ActivityWallProps> = ({ activities, users }) => {

    const renderActivity = (activity: GamingActivity) => {
        const user = users.find(u => u.id === activity.userId);
        const username = user ? user.username : 'Unknown User';
        const userLink = user ? <Link to={`/admin/user/${user.id}`} className="font-semibold text-brand-secondary hover:underline">{username}</Link> : <span className="font-semibold">{username}</span>;

        switch (activity.type) {
            case 'deposit':
                return <p><span>{userLink}</span> made a deposit of <span className="text-green-400">${activity.amount?.toFixed(2)}</span>.</p>;
            case 'win':
                return <p><span>{userLink}</span> won <span className="text-blue-400">${activity.amount?.toFixed(2)}</span> on {activity.game}.</p>;
            case 'jackpot':
                 return <p>🎉 <span>{userLink}</span> hit a JACKPOT of <span className="font-bold text-yellow-400">${activity.amount?.toFixed(2)}</span> on {activity.game}!</p>;
            default:
                return null;
        }
    };

    // Filter for interesting activities and limit to 5
    const recentActivities = activities
        .filter(a => ['deposit', 'win', 'jackpot'].includes(a.type) && a.amount && a.amount > 100)
        .slice(0, ACTIVITY_LIMIT);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Real-time Activity Wall</CardTitle>
            </CardHeader>
            <CardContent>
                {recentActivities.length > 0 ? (
                    <ul className="space-y-4">
                        {recentActivities.map(activity => (
                            <li key={activity.id} className="text-sm text-dark-text-secondary">
                                {renderActivity(activity)}
                                <p className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleTimeString()}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-dark-text-secondary text-center py-4">No significant recent activity.</p>
                )}
            </CardContent>
        </Card>
    );
};