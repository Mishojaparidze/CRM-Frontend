import React, { useState, useEffect, useCallback } from 'react';
import { PlayerPromotion } from '../../../types';
import * as api from '../../../services/mockApiService';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Alert } from '../../ui/Alert';
import { Spinner } from '../../ui/Spinner';
import { useAuth } from '../../../hooks/useAuth';
import { AssignPromotionModal } from './AssignPromotionModal';

interface PlayerPromotionsManagerProps {
    userId: string;
}

const PromotionStatusBadge: React.FC<{ status: PlayerPromotion['status'] }> = ({ status }) => {
    const statusStyles = {
        active: 'bg-green-800 text-green-200',
        completed: 'bg-blue-800 text-blue-200',
        expired: 'bg-gray-700 text-gray-200',
    };
    return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${statusStyles[status]}`}>
            {status}
        </span>
    );
};

export const PlayerPromotionsManager: React.FC<PlayerPromotionsManagerProps> = ({ userId }) => {
    const { hasPermission } = useAuth();
    const [promotions, setPromotions] = useState<PlayerPromotion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchPromotions = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await api.getPlayerPromotions(userId);
            setPromotions(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch player promotions.');
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchPromotions();
    }, [fetchPromotions]);

    const handlePromotionAssigned = (count: number, promotionName: string) => {
        setIsModalOpen(false);
        setMessage(`Promotion "${promotionName}" assigned successfully.`);
        fetchPromotions();
    };

    return (
        <>
            {isModalOpen && (
                <AssignPromotionModal 
                    userIds={[userId]}
                    onClose={() => setIsModalOpen(false)}
                    onAssign={handlePromotionAssigned}
                />
            )}
            <Card>
                <CardHeader className="flex justify-between items-center">
                    <CardTitle>Assigned Promotions</CardTitle>
                    {hasPermission('can_manage_promotions') && (
                        <Button onClick={() => setIsModalOpen(true)} className="w-auto">Assign Promotion</Button>
                    )}
                </CardHeader>
                <CardContent>
                    <Alert message={error} type="error" />
                    <Alert message={message} type="success" />
                    {isLoading ? (
                        <div className="flex justify-center py-8"><Spinner /></div>
                    ) : promotions.length === 0 ? (
                        <p className="text-center text-dark-text-secondary py-8">No promotions have been assigned to this user.</p>
                    ) : (
                        <ul className="divide-y divide-dark-border">
                            {promotions.map(promo => (
                                <li key={promo.id} className="py-3 flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-dark-text">{promo.promotionName}</p>
                                        <p className="text-xs text-dark-text-secondary mt-1">
                                            Assigned on {new Date(promo.assignedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <PromotionStatusBadge status={promo.status} />
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </>
    );
};