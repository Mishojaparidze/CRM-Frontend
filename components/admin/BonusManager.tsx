import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Bonus, BonusHistoryEvent } from '../../../types';
import * as api from '../../../services/mockApiService';
import { useAuth } from '../../../hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Alert } from '../../ui/Alert';
import { Spinner } from '../../ui/Spinner';
import { Input } from '../../ui/Input';
import { StatCard } from '../../ui/StatCard';

interface BonusManagerProps {
    userId: string;
}

const GrantBonusModal: React.FC<{
    onClose: () => void;
    onBonusGranted: () => void;
    userId: string;
}> = ({ onClose, onBonusGranted, userId }) => {
    const [type, setType] = useState<Bonus['type']>('Free Spins');
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const numAmount = parseInt(amount, 10);
        if (isNaN(numAmount) || numAmount <= 0) {
            setError('Please enter a valid, positive amount.');
            return;
        }
        if (!reason.trim()) {
            setError('Reason for bonus is required.');
            return;
        }
        
        setIsSubmitting(true);
        try {
            await api.grantBonus(userId, type, numAmount, reason);
            onBonusGranted();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to grant bonus.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
            <div className="bg-dark-card rounded-lg shadow-xl w-full max-w-md m-4">
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle>Grant New Bonus</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <Alert message={error} type="error" />
                        <div>
                            <label htmlFor="bonus-type" className="block text-sm font-medium text-dark-text-secondary">Bonus Type</label>
                            <select id="bonus-type" value={type} onChange={e => setType(e.target.value as Bonus['type'])} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-dark-border focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm rounded-md bg-gray-800 text-dark-text">
                                <option>Free Spins</option>
                                <option>Deposit Match</option>
                                <option>Cash Credit</option>
                            </select>
                        </div>
                        <Input id="bonus-amount" label="Amount" type="number" required value={amount} onChange={e => setAmount(e.target.value)} />
                        <Input id="bonus-reason" label="Reason" type="text" required value={reason} onChange={e => setReason(e.target.value)} />
                    </CardContent>
                    <div className="bg-gray-800 px-6 py-3 flex justify-end space-x-2 rounded-b-lg">
                        <Button type="button" variant="secondary" onClick={onClose} className="w-auto">Cancel</Button>
                        <Button type="submit" isLoading={isSubmitting} className="w-auto">Grant Bonus</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const BonusHistoryStatusBadge: React.FC<{ status: BonusHistoryEvent['status'] }> = ({ status }) => {
    const statusStyles: Record<BonusHistoryEvent['status'], string> = {
        awarded: 'bg-indigo-800 text-indigo-200',
        pending: 'bg-yellow-800 text-yellow-200',
        active: 'bg-blue-800 text-blue-200',
        completed: 'bg-green-800 text-green-200',
        expired: 'bg-gray-700 text-gray-200',
        forfeited: 'bg-red-800 text-red-200',
    };
    return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${statusStyles[status]}`}>
            {status}
        </span>
    );
};

export const BonusManager: React.FC<BonusManagerProps> = ({ userId }) => {
    const { hasPermission } = useAuth();
    const [bonusHistory, setBonusHistory] = useState<BonusHistoryEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [showModal, setShowModal] = useState(false);

    const fetchBonusHistory = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await api.getComprehensiveBonusHistory(userId);
            setBonusHistory(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch bonus history.');
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchBonusHistory();
    }, [fetchBonusHistory]);

    const handleBonusGranted = () => {
        setMessage('Bonus granted successfully!');
        fetchBonusHistory();
    };
    
    const stats = useMemo(() => {
        const totalAwarded = bonusHistory.length;
        const totalAmount = bonusHistory.reduce((sum, b) => {
            if (b.type !== 'Free Spins') {
                return sum + b.amount;
            }
            return sum;
        }, 0);
        
        const completedBonuses = bonusHistory.filter(b => b.status === 'completed' && typeof b.conversionRate === 'number');
        const avgConversion = completedBonuses.length > 0
            ? completedBonuses.reduce((sum, b) => sum + (b.conversionRate || 0), 0) / completedBonuses.length
            : 0;

        return { totalAwarded, totalAmount, avgConversion };
    }, [bonusHistory]);

    return (
        <>
            {showModal && <GrantBonusModal userId={userId} onClose={() => setShowModal(false)} onBonusGranted={handleBonusGranted} />}
            <Card>
                <CardHeader className="flex justify-between items-center">
                    <CardTitle>Bonus History</CardTitle>
                    {hasPermission('can_grant_bonuses') && (
                        <Button onClick={() => setShowModal(true)} className="w-auto">Grant Bonus</Button>
                    )}
                </CardHeader>
                <CardContent>
                    <Alert message={error} type="error" />
                    <Alert message={message} type="success" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <StatCard isCompact title="Total Bonuses Awarded" value={stats.totalAwarded} />
                        <StatCard isCompact title="Total Bonus Amount" value={`$${stats.totalAmount.toFixed(2)}`} />
                        <StatCard isCompact title="Avg. Conversion Rate" value={`${stats.avgConversion.toFixed(1)}%`} />
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-8"><Spinner /></div>
                    ) : bonusHistory.length === 0 ? (
                        <p className="text-center text-dark-text-secondary py-8">No bonuses have been granted to this user.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-dark-border">
                                <thead className="bg-gray-800">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase">Bonus</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase">Amount</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase">Source</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase">Conversion</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-dark-card divide-y divide-dark-border">
                                    {bonusHistory.map(b => (
                                        <tr key={b.id}>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <p className="font-semibold text-white text-sm">{b.name}</p>
                                                <p className="text-xs text-dark-text-secondary">{b.type}</p>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-brand-secondary">
                                                {b.type === 'Free Spins' ? `${b.amount} FS` : `$${b.amount.toFixed(2)}`}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                                                <p className="text-dark-text">{b.source}</p>
                                                <p className="text-xs text-dark-text-secondary">{b.sourceDetails}</p>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <BonusHistoryStatusBadge status={b.status} />
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                                                {typeof b.conversionRate === 'number' ? (
                                                    <div>
                                                        <p className="text-green-400 font-semibold">{b.conversionRate.toFixed(1)}%</p>
                                                        <p className="text-xs text-dark-text-secondary">${(b.convertedAmount || 0).toFixed(2)}</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-dark-text-secondary">N/A</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-dark-text-secondary">
                                                {new Date(b.grantedAt).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </>
    );
};