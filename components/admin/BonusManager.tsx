
import React, { useState, useEffect, useCallback } from 'react';
import { Bonus } from '../../types';
// FIX: Use relative path for mockApiService
import * as api from '../../services/mockApiService';
// FIX: Use relative path for useAuth
import { useAuth } from '../../hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { Spinner } from '../ui/Spinner';
import { Input } from '../ui/Input';

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


export const BonusManager: React.FC<BonusManagerProps> = ({ userId }) => {
    const { hasPermission } = useAuth();
    const [bonuses, setBonuses] = useState<Bonus[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [showModal, setShowModal] = useState(false);

    const fetchBonuses = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await api.getUserBonuses(userId);
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

    const handleBonusGranted = () => {
        setMessage('Bonus granted successfully!');
        fetchBonuses();
    };

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
                    {isLoading ? (
                        <div className="flex justify-center py-8"><Spinner /></div>
                    ) : bonuses.length === 0 ? (
                        <p className="text-center text-dark-text-secondary py-8">No bonuses have been granted to this user.</p>
                    ) : (
                        <ul className="divide-y divide-dark-border">
                            {bonuses.map(bonus => (
                                <li key={bonus.id} className="py-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-brand-secondary">{bonus.type} - {bonus.type === 'Free Spins' ? `${bonus.amount} spins` : `$${bonus.amount}`}</p>
                                            <p className="text-sm text-dark-text mt-1">{bonus.reason}</p>
                                        </div>
                                        <p className="text-xs text-dark-text-secondary text-right flex-shrink-0 ml-4">
                                            Granted by {bonus.adminUsername}<br/>
                                            {new Date(bonus.grantedAt).toLocaleString()}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </>
    );
};