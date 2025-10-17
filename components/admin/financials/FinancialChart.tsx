import React, { useMemo } from 'react';
import { GamingActivity } from '../../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';

interface FinancialChartProps {
    transactions: GamingActivity[];
}

const FinancialChart: React.FC<FinancialChartProps> = ({ transactions }) => {
    const chartData = useMemo(() => {
        const days = 30;
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - days);

        const dailyData: { [key: string]: { deposits: number; withdrawals: number } } = {};

        for (let i = 0; i < days; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            const key = date.toISOString().split('T')[0];
            dailyData[key] = { deposits: 0, withdrawals: 0 };
        }

        transactions.forEach(tx => {
            const key = new Date(tx.timestamp).toISOString().split('T')[0];
            if (dailyData[key]) {
                if (tx.type === 'deposit') {
                    dailyData[key].deposits += tx.amount;
                } else if (tx.type === 'withdrawal') {
                    dailyData[key].withdrawals += tx.amount;
                }
            }
        });
        
        return Object.entries(dailyData).map(([date, values]) => ({ date, ...values }));
    }, [transactions]);

    const maxAmount = useMemo(() => {
        const max = Math.max(...chartData.map(d => Math.max(d.deposits, d.withdrawals)));
        return max === 0 ? 1000 : max; // Avoid division by zero
    }, [chartData]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Financial Trends (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-end h-64 w-full space-x-1 border-b border-l border-dark-border p-2">
                    {chartData.map(({ date, deposits, withdrawals }) => (
                        <div key={date} className="flex-1 flex flex-col items-center justify-end h-full relative group">
                            <div className="absolute bottom-full mb-2 w-32 p-2 bg-gray-900 border border-dark-border text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none text-center">
                                <strong>{date}</strong><br/>
                                <span className="text-green-400">Deposits: ${deposits.toFixed(2)}</span><br/>
                                <span className="text-red-400">Withdrawals: ${withdrawals.toFixed(2)}</span>
                            </div>
                            <div
                                className="w-1/2 bg-green-500 rounded-t-sm"
                                style={{ height: `${(deposits / maxAmount) * 100}%` }}
                            ></div>
                            <div
                                className="w-1/2 bg-red-500 rounded-t-sm"
                                style={{ height: `${(withdrawals / maxAmount) * 100}%` }}
                            ></div>
                        </div>
                    ))}
                </div>
                 <div className="flex justify-center items-center space-x-4 mt-2 text-xs text-dark-text-secondary">
                    <div className="flex items-center"><span className="w-3 h-3 bg-green-500 rounded-sm mr-1.5"></span> Deposits</div>
                    <div className="flex items-center"><span className="w-3 h-3 bg-red-500 rounded-sm mr-1.5"></span> Withdrawals</div>
                </div>
            </CardContent>
        </Card>
    );
};

export default FinancialChart;
