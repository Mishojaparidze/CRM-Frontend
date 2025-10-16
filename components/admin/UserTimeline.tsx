
import React, { useState, useEffect, useCallback } from 'react';
import { TimelineEvent } from '../../types';
// FIX: Use relative path for mockApiService
import * as api from '../../services/mockApiService';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Spinner } from '../ui/Spinner';
import { Alert } from '../ui/Alert';

interface UserTimelineProps {
    userId: string;
}

const TimelineIcon: React.FC<{ type: TimelineEvent['timelineType'] }> = ({ type }) => {
    const icons = {
        activity: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L10 11.586l3.293-3.293a1 1 0 011.414 0l-3 3 1.414 1.414L17.586 9H13a1 1 0 110-2h-1z" clipRule="evenodd" /></svg>,
        note: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>,
        bonus: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5v3a1 1 0 01-2 0v-3H4a2 2 0 110-4h1.17A3 3 0 015 5zm4.472 4a4.03 4.03 0 00-1.26-3.133A4.002 4.002 0 005 5a4 4 0 00-4 4v1a1 1 0 001 1h12a1 1 0 001-1v-1a4 4 0 00-4-4 3.998 3.998 0 00-2.268.667L10 9.472z" clipRule="evenodd" /></svg>,
        audit: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" /></svg>,
    };
    const colors = {
        activity: 'bg-blue-500', note: 'bg-yellow-500', bonus: 'bg-green-500', audit: 'bg-purple-500'
    };
    return (
        <span className={`flex items-center justify-center h-8 w-8 rounded-full ${colors[type]} text-white`}>
            {icons[type] || icons.activity}
        </span>
    );
};

const TimelineItem: React.FC<{ event: TimelineEvent }> = ({ event }) => {
    const formatAmount = (amount?: number, currency?: string) => {
        if (typeof amount !== 'number' || !currency) return '';
        return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
    }

    const renderContent = () => {
        switch (event.timelineType) {
            case 'activity':
                switch (event.type) {
                    case 'deposit': return <>Deposited <span className="font-semibold text-green-400">{formatAmount(event.amount, event.currency)}</span></>;
                    case 'withdrawal': return <>Withdrew <span className="font-semibold text-red-400">{formatAmount(event.amount, event.currency)}</span></>;
                    case 'win': return <>Won <span className="font-semibold text-blue-400">{formatAmount(event.amount, event.currency)}</span> in {event.game}</>;
                    case 'loss': return <>Lost <span className="font-semibold text-orange-400">{formatAmount(event.amount, event.currency)}</span> in {event.game}</>;
                    case 'jackpot': return <>Hit a jackpot of <span className="font-semibold text-yellow-400">{formatAmount(event.amount, event.currency)}</span> in {event.game}!</>;
                    default: return <>{event.type.replace('_', ' ')} in {event.game}</>;
                }
            case 'note':
                return <>Note added by <span className="font-semibold">{event.adminUsername}</span>: <span className="italic text-dark-text-secondary">"{event.content}"</span></>;
            case 'bonus':
                return <>Bonus granted by <span className="font-semibold">{event.adminUsername}</span>: {event.type} of {event.type === 'Free Spins' ? `${event.amount} spins` : `$${event.amount}`}. Reason: <span className="italic">{event.reason}</span></>;
            case 'audit':
                return <>Admin <span className="font-semibold">{event.adminUsername}</span> performed action: <span className="font-mono text-brand-secondary">{event.action}</span></>;
            default:
                return 'Unknown event';
        }
    };
    
    return (
        <div className="relative pb-8">
            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-dark-border" aria-hidden="true"></span>
            <div className="relative flex items-start space-x-3">
                <TimelineIcon type={event.timelineType} />
                <div className="min-w-0 flex-1">
                    <div>
                        <div className="text-sm text-dark-text">
                           {renderContent()}
                        </div>
                        <p className="mt-0.5 text-xs text-dark-text-secondary">
                           {new Date(event.date).toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};


export const UserTimeline: React.FC<UserTimelineProps> = ({ userId }) => {
    const [events, setEvents] = useState<TimelineEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchTimeline = useCallback(async () => {
        if (!userId) return;
        setIsLoading(true);
        setError('');
        try {
            const response = await api.getUserTimeline(userId);
            setEvents(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch user timeline.');
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchTimeline();
    }, [fetchTimeline]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Comprehensive User Timeline</CardTitle>
            </CardHeader>
            <CardContent>
                {error && <Alert message={error} type="error" />}
                {isLoading ? (
                    <div className="flex justify-center py-8"><Spinner /></div>
                ) : events.length === 0 ? (
                    <p className="text-center text-dark-text-secondary py-8">No events found for this user.</p>
                ) : (
                    <div>
                        {events.map((event, index) => (
                            <TimelineItem key={`${event.id}_${index}`} event={event} />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};