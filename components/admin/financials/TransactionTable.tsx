import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { GamingActivity } from '../../../types';
import * as api from '../../../services/mockApiService';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Alert } from '../../ui/Alert';

interface TransactionTableProps {
    type: 'deposit' | 'withdrawal';
    title: string;
    transactions?: GamingActivity[];
    userId?: string; // If provided, filters transactions for a specific user
    onUpdate?: () => void;
}

const StatusBadge: React.FC<{ status: GamingActivity['status'] }> = ({ status }) => {
    const colors = {
        pending: 'bg-yellow-800 text-yellow-200',
        completed: 'bg-green-800 text-green-200',
        rejected: 'bg-red-800 text-red-200',
    };
    return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${colors[status || 'pending']}`}>{status}</span>;
}

const TimeSince: React.FC<{ date: string }> = ({ date }) => {
    const [timeString, setTimeString] = useState('');

    React.useEffect(() => {
        const update = () => {
            const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
            let interval = seconds / 31536000;
            if (interval > 1) return setTimeString(Math.floor(interval) + " years ago");
            interval = seconds / 2592000;
            if (interval > 1) return setTimeString(Math.floor(interval) + " months ago");
            interval = seconds / 86400;
            if (interval > 1) return setTimeString(Math.floor(interval) + " days ago");
            interval = seconds / 3600;
            if (interval > 1) return setTimeString(Math.floor(interval) + " hours ago");
            interval = seconds / 60;
            if (interval > 1) return setTimeString(Math.floor(interval) + " minutes ago");
            setTimeString(Math.floor(seconds) + " seconds ago");
        };
        update();
        const intervalId = setInterval(update, 5000);
        return () => clearInterval(intervalId);
    }, [date]);

    return <span className="text-xs text-dark-text-secondary">{timeString}</span>;
};

const TransactionTable: React.FC<TransactionTableProps> = ({ type, title, transactions: initialTransactions, userId, onUpdate }) => {
    const [allTransactions, setAllTransactions] = useState<GamingActivity[]>([]);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'rejected'>('all');

    React.useEffect(() => {
        if (initialTransactions) {
            setAllTransactions(initialTransactions);
        } else if (userId) {
            api.getAllGamingActivities().then(res => {
                setAllTransactions(res.data.filter(tx => tx.userId === userId && tx.type === type));
            });
        }
    }, [initialTransactions, userId, type]);
    
    const handleUpdateStatus = async (transactionId: string, status: 'completed' | 'rejected') => {
        setError('');
        try {
            await api.updateTransactionStatus(transactionId, status);
            if (onUpdate) onUpdate();
        } catch(err: any) {
            setError(err.message || 'Failed to update transaction.');
        }
    };
    
    const filteredTransactions = useMemo(() => {
        if (filter === 'all') return allTransactions;
        return allTransactions.filter(tx => tx.status === filter);
    }, [allTransactions, filter]);

    const isGlobalView = !userId;

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                {error && <Alert message={error} type="error" />}
                {isGlobalView && (
                    <div className="flex space-x-2 mb-4">
                        {(['all', 'pending', 'completed', 'rejected'] as const).map(f => (
                            <button 
                                key={f} 
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1 text-sm rounded-md ${filter === f ? 'bg-brand-primary text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                )}
                 <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-dark-border">
                        <thead className="bg-gray-800">
                            <tr>
                                {isGlobalView && <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase">User</th>}
                                <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase">Method</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase">Date</th>
                                {isGlobalView && <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="bg-dark-card divide-y divide-dark-border">
                            {filteredTransactions.map(tx => (
                                <tr key={tx.id}>
                                    {isGlobalView && (
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Link to={`/admin/user/${tx.userId}`} className="text-sm font-medium text-brand-secondary hover:underline">
                                                View User
                                            </Link>
                                        </td>
                                    )}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-dark-text">${tx.amount.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text-secondary">{tx.paymentMethod}</td>
                                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={tx.status} /></td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <p className="text-sm text-dark-text-secondary">{new Date(tx.timestamp).toLocaleString()}</p>
                                        {tx.status === 'pending' && <TimeSince date={tx.timestamp} />}
                                    </td>
                                    {isGlobalView && (
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            {tx.status === 'pending' ? (
                                                <>
                                                    <Button onClick={() => handleUpdateStatus(tx.id, 'completed')} className="w-auto !py-1 !px-2 bg-green-600 hover:bg-green-700">Approve</Button>
                                                    <Button onClick={() => handleUpdateStatus(tx.id, 'rejected')} variant="danger" className="w-auto !py-1 !px-2">Reject</Button>
                                                </>
                                            ) : (
                                                <span className="text-xs text-dark-text-secondary">No actions</span>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
};

export default TransactionTable;
