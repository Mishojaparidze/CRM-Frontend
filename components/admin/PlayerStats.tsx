import React, { useMemo } from 'react';
import { User, GamingActivity } from '../../types';
import { StatCard } from '../ui/StatCard';
import * as api from '../../services/mockApiService';

interface PlayerStatsProps {
  user: User;
}

export const PlayerStats: React.FC<PlayerStatsProps> = ({ user }) => {
    const [activities, setActivities] = React.useState<GamingActivity[]>([]);

    React.useEffect(() => {
        const fetchActivities = async () => {
            const response = await api.getAllGamingActivities();
            setActivities(response.data.filter(a => a.userId === user.id));
        };
        fetchActivities();
    }, [user.id]);
    
    const financialStats = useMemo(() => {
        const deposits = activities.filter(a => a.type === 'deposit');
        const withdrawals = activities.filter(a => a.type === 'withdrawal');
        const totalDeposits = deposits.reduce((sum, a) => sum + a.amount, 0);
        const totalWithdrawals = withdrawals.reduce((sum, a) => sum + a.amount, 0);
        const netRevenue = totalDeposits - totalWithdrawals;

        const bets = activities.filter(a => a.type === 'bet').map(a => a.amount);
        const avgBet = bets.length > 0 ? bets.reduce((a, b) => a + b, 0) / bets.length : user.avgBetSize;
        const stdDev = Math.sqrt(bets.map(x => Math.pow(x - avgBet, 2)).reduce((a, b) => a + b, 0) / bets.length);
        const volatility = avgBet > 0 ? (stdDev / avgBet) * 100 : 0; // Coefficient of variation

        return {
            totalDeposits,
            totalWithdrawals,
            netRevenue,
            volatility: isNaN(volatility) ? 0 : volatility,
        };
    }, [activities, user.avgBetSize]);


  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard isCompact title="Lifetime Value" value={`$${user.ltv.toFixed(2)}`} />
        <StatCard isCompact title="Lifetime Deposits" value={`$${financialStats.totalDeposits.toFixed(2)}`} />
        <StatCard isCompact title="Lifetime Withdrawals" value={`$${financialStats.totalWithdrawals.toFixed(2)}`} />
        <StatCard isCompact title="Net Revenue" value={`$${financialStats.netRevenue.toFixed(2)}`} valueClassName={financialStats.netRevenue >= 0 ? 'text-green-400' : 'text-red-400'} />
        <StatCard isCompact title="Gross Gaming Revenue" value={`$${user.ggr.toFixed(2)}`} />
        <StatCard isCompact title="Avg. Bet Size" value={`$${user.avgBetSize.toFixed(2)}`} />
        <StatCard isCompact title="Volatility" value={`${financialStats.volatility.toFixed(1)}%`} />
        <StatCard isCompact title="Churn Risk" value={`${user.churnPredictionScore || 0}%`} valueClassName={user.churnPredictionScore && user.churnPredictionScore > 75 ? 'text-red-400' : (user.churnPredictionScore && user.churnPredictionScore > 40 ? 'text-yellow-400' : 'text-green-400')} />
    </div>
  );
};
