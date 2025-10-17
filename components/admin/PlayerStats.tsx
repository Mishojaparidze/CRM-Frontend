import React from 'react';
import { User } from '../../types';
import { StatCard } from '../ui/StatCard';

interface PlayerStatsProps {
    user: User;
}

const getChurnRiskColor = (score: number) => {
    if (score > 75) return 'text-red-400';
    if (score > 40) return 'text-yellow-400';
    return 'text-green-400';
};

export const PlayerStats: React.FC<PlayerStatsProps> = ({ user }) => {
    const churnScore = user.churnPredictionScore;
    
    return (
        <div>
            <h3 className="text-lg font-medium text-white mb-4">Player Financials & Stats</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard title="Lifetime Value" value={`$${user.ltv.toFixed(2)}`} isCompact />
                <StatCard title="Gross Gaming Revenue" value={`$${user.ggr.toFixed(2)}`} isCompact />
                <StatCard title="Avg. Bet Size" value={`$${user.avgBetSize.toFixed(2)}`} isCompact />
                {churnScore !== undefined ? (
                    <StatCard 
                        title="Churn Prediction" 
                        value={`${churnScore}%`}
                        valueClassName={getChurnRiskColor(churnScore)}
                        isCompact
                    />
                ) : (
                     <StatCard title="Churn Prediction" value="N/A" isCompact />
                )}
            </div>
        </div>
    );
};