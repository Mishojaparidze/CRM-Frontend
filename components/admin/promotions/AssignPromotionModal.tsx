import React, { useState, useEffect, useCallback } from 'react';
import { Promotion } from '../../../types';
import * as api from '../../../services/mockApiService';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Spinner } from '../../ui/Spinner';
import { Alert } from '../../ui/Alert';

interface AssignPromotionModalProps {
    userIds: string[];
    onClose: () => void;
    onAssign: (assignedCount: number, promotionName: string) => void;
}

export const AssignPromotionModal: React.FC<AssignPromotionModalProps> = ({ userIds, onClose, onAssign }) => {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAssigning, setIsAssigning] = useState(false);
    const [error, setError] = useState('');

    const fetchPromotions = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await api.getPromotions();
            // Filter for promotions that can be assigned
            setPromotions(response.data.filter(p => p.status === 'Active' || p.status === 'Scheduled'));
        } catch (err: any) {
            setError(err.message || 'Failed to fetch available promotions.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPromotions();
    }, [fetchPromotions]);
    
    const handleAssign = async (promotion: Promotion) => {
        setIsAssigning(true);
        setError('');
        try {
            if (userIds.length === 1) {
                await api.assignPromotionToUser(userIds[0], promotion.id);
            } else {
                await api.assignPromotionToUsers(userIds, promotion.id);
            }
            onAssign(userIds.length, promotion.name);
        } catch(err: any) {
            setError(err.message || 'Failed to assign promotion.');
        } finally {
            setIsAssigning(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-dark-card rounded-lg shadow-xl w-full max-w-2xl max-h-full flex flex-col">
                <CardHeader className="flex justify-between items-center">
                    <CardTitle>Assign Promotion to {userIds.length} User(s)</CardTitle>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </CardHeader>
                <CardContent className="flex-grow overflow-y-auto">
                    <Alert message={error} type="error" />
                    {isLoading ? <div className="flex justify-center py-16"><Spinner/></div> : (
                        <ul className="divide-y divide-dark-border">
                            {promotions.map(promo => (
                                <li key={promo.id} className="py-3 flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-white">{promo.name}</p>
                                        <p className="text-sm text-dark-text-secondary">{promo.description}</p>
                                        <p className="text-xs text-dark-text-secondary font-mono mt-1">Code: {promo.bonusCode || 'N/A'}</p>
                                    </div>
                                    <Button
                                        onClick={() => handleAssign(promo)}
                                        isLoading={isAssigning}
                                        className="w-auto ml-4"
                                    >
                                        Assign
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
                <div className="bg-gray-800 px-6 py-4 flex justify-end rounded-b-lg">
                    <Button variant="secondary" onClick={onClose} className="w-auto">Cancel</Button>
                </div>
            </div>
        </div>
    );
};