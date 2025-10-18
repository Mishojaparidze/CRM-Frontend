import React, { useState, useEffect, useCallback } from 'react';
import { PlayerBonus } from '../types';
import * as api from '../services/mockApiService';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Spinner } from './ui/Spinner';
import { Alert } from './ui/Alert';

interface BonusTrackerProps {
    userId: string;
}

const BonusStatusBadge: React.FC<{ status: PlayerBonus['status'] }> = ({ status }) => {
    const statusStyles = {
        pending: 'bg-yellow-800 text-yellow-200',
        active: 'bg-green-800 text-green-200',
        completed: 'bg-blue-800 text-blue-200',
        expired: 'bg-gray-700 text-gray-200',
        forfeited: 'bg-red-800 text-red-200',
    };
    return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${statusStyles[status]}`}>
            {status}
        </span>
    );
};

const WageringProgress: React.FC<{ progress: number; target: number }> = ({ progress, target }) => {
    const percentage = target > 0 ? (progress / target) * 100 : 0;
    return (
        <div>
            <div className="flex justify-between text-xs text-dark-text-secondary mb-1">
                <span>Wagering</span>
                <span>${progress.toFixed(2)} / ${target.toFixed(2)}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div className="bg-brand-primary h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
            </div>
            <p className="text-center text-xs text-dark-text-secondary mt-1">{percentage.toFixed(1)}% Complete</p>
        </div>
    );
};

const TimeLeft: React.FC<{ expiryDate: string }> = ({ expiryDate }) => {
    const calculateTimeLeft = useCallback(() => {
        const difference = +new Date(expiryDate) - +new Date();
        let timeLeft: { [key: string]: number } = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            };
        }
        return timeLeft;
    }, [expiryDate]);

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000 * 60); // update every minute

        return () => clearInterval(timer);
    }, [calculateTimeLeft]);
    
    if (Object.keys(timeLeft).length === 0) {
        return <span className="text-red-400">Expired</span>;
    }

    return (
        <span>
            {timeLeft.days > 0 && `${timeLeft.days}d `}
            {timeLeft.hours > 0 && `${timeLeft.hours}h `}
            left
        </span>
    );
};


const BonusCard: React.FC<{ bonus: PlayerBonus }> = ({ bonus }) => {
    const isExpired = new Date(bonus.expiryDate) < new Date();
    
    return (
        <div className="bg-gray-800 p-4 rounded-lg border border-dark-border">
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-semibold text-white">{bonus.name}</h4>
                    <p className="text-sm text-dark-text-secondary capitalize">{bonus.type.replace('_', ' ')} Bonus</p>
                </div>
                <BonusStatusBadge status={bonus.status} />
            </div>

            <div className="my-4 text-center">
                <p className="text-3xl font-bold text-brand-secondary">
                    {bonus.type === 'free_spins' ? bonus.amount : `$${bonus.amount.toFixed(2)}`}
                </p>
                {bonus.type === 'free_spins' && <p className="text-sm text-dark-text-secondary">Free Spins</p>}
            </div>

            <WageringProgress progress={bonus.wageringRequirement.progress} target={bonus.wageringRequirement.target} />
            
            <div className="mt-4 pt-4 border-t border-dark-border space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-dark-text-secondary">Expires:</span>
                    <span className={`font-semibold ${isExpired ? 'text-red-400' : 'text-dark-text'}`}>
                        {new Date(bonus.expiryDate).toLocaleDateString()} (<TimeLeft expiryDate={bonus.expiryDate} />)
                    </span>
                </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-dark-text-secondary">Eligible Games:</span>
                    <span className="font-semibold text-dark-text text-right">{bonus.eligibleGames.join(', ')}</span>
                </div>
            </div>
        </div>
    );
};

const BonusTracker: React.FC<BonusTrackerProps> = ({ userId }) => {
    const [bonuses, setBonuses] = useState<PlayerBonus[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchBonuses = useCallback(async () => {
        if (!userId) return;
        setIsLoading(true);
        try {
            const response = await api.getPlayerBonuses(userId);
            setBonuses(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch bonuses.');
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchBonuses();
    }, [fetchBonuses]);

    const activeBonuses = bonuses.filter(b => b.status === 'active' || b.status === 'pending');
    const pastBonuses = bonuses.filter(b => b.status !== 'active' && b.status !== 'pending');

    return (
        <Card>
            <CardHeader>
                <CardTitle>My Bonuses</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center"><Spinner /></div>
                ) : error ? (
                    <Alert message={error} type="error" />
                ) : (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-4">Active Bonuses</h3>
                            {activeBonuses.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {activeBonuses.map(bonus => <BonusCard key={bonus.id} bonus={bonus} />)}
                                </div>
                            ) : (
                                <p className="text-dark-text-secondary text-center py-6 bg-dark-card rounded-md">
                                    You have no active bonuses at the moment.
                                </p>
                            )}
                        </div>
                         <div>
                            <h3 className="text-lg font-semibold text-white mb-4">Past Bonuses</h3>
                             {pastBonuses.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {pastBonuses.map(bonus => <BonusCard key={bonus.id} bonus={bonus} />)}
                                </div>
                            ) : (
                                <p className="text-dark-text-secondary text-center py-6 bg-dark-card rounded-md">
                                    No past bonuses found.
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default BonusTracker;
