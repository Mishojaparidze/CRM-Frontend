import React, { useState, useEffect, useCallback } from 'react';
import { LoyaltyTier, User } from '../../../types';
import * as api from '../../../services/mockApiService';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { Spinner } from '../../ui/Spinner';
import { Alert } from '../../ui/Alert';

interface LoyaltyProgramStatusProps {
    user: User;
}

const tierStyles: Record<string, { icon: string; color: string }> = {
    Bronze: { icon: '🥉', color: 'text-yellow-600' },
    Silver: { icon: '🥈', color: 'text-gray-400' },
    Gold: { icon: '🥇', color: 'text-yellow-400' },
    Platinum: { icon: '💎', color: 'text-cyan-400' },
};

export const LoyaltyProgramStatus: React.FC<LoyaltyProgramStatusProps> = ({ user }) => {
    const [tiers, setTiers] = useState<LoyaltyTier[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchTiers = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.getLoyaltyTiers();
            setTiers(response.data.sort((a, b) => a.pointsRequired - b.pointsRequired));
        } catch (err: any) {
            setError(err.message || 'Failed to fetch loyalty tiers.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTiers();
    }, [fetchTiers]);

    if (isLoading) {
        return <Card><CardContent className="flex justify-center py-8"><Spinner /></CardContent></Card>;
    }

    if (error) {
        return <Card><CardContent><Alert message={error} type="error" /></CardContent></Card>;
    }
    
    const currentTier = tiers.find(t => t.id === user.loyaltyTierId);
    const currentTierIndex = currentTier ? tiers.indexOf(currentTier) : -1;
    const nextTier = currentTierIndex > -1 && currentTierIndex < tiers.length - 1 ? tiers[currentTierIndex + 1] : null;
    const userPoints = user.loyaltyPoints ?? 0;

    let progress = 0;
    if (nextTier && currentTier) {
        const pointsForNextTier = nextTier.pointsRequired - currentTier.pointsRequired;
        const pointsEarnedInTier = userPoints - currentTier.pointsRequired;
        progress = (pointsEarnedInTier / pointsForNextTier) * 100;
    } else if (currentTier) {
        progress = 100; // Max tier
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Loyalty Status</CardTitle>
            </CardHeader>
            <CardContent>
                {!currentTier ? (
                    <p className="text-dark-text-secondary">User is not part of the loyalty program.</p>
                ) : (
                    <div className="space-y-4">
                        <div className="text-center">
                            <span className="text-5xl">{tierStyles[currentTier.name]?.icon}</span>
                            <h3 className={`text-2xl font-bold ${tierStyles[currentTier.name]?.color}`}>{currentTier.name} Tier</h3>
                            <p className="font-semibold text-dark-text">{userPoints.toLocaleString()} Points</p>
                        </div>
                        
                        <div>
                            {nextTier ? (
                                <>
                                    <div className="flex justify-between text-xs text-dark-text-secondary mb-1">
                                        <span>{currentTier.name}</span>
                                        <span>{nextTier.name} ({nextTier.pointsRequired.toLocaleString()} pts)</span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                                        <div className="bg-brand-primary h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                                    </div>
                                    <p className="text-center text-xs text-dark-text-secondary mt-1">
                                        {nextTier.pointsRequired - userPoints > 0 ? `${(nextTier.pointsRequired - userPoints).toLocaleString()} points to next tier` : `Ready for promotion!`}
                                    </p>
                                </>
                            ) : (
                                <p className="text-center font-semibold text-brand-secondary">Highest Tier Achieved!</p>
                            )}
                        </div>

                        <div className="pt-4 border-t border-dark-border">
                            <h4 className="font-semibold text-dark-text mb-2">Current Tier Benefits:</h4>
                            <ul className="space-y-1">
                                {currentTier.benefits.map(benefit => (
                                    <li key={benefit} className="flex items-center text-sm text-dark-text-secondary">
                                        <svg className="w-4 h-4 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                                        {benefit}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};