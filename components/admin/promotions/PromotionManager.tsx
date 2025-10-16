import React, { useState, useEffect, useCallback } from 'react';
import { Promotion, PromotionStatus } from '../../../types';
import * as api from '../../../services/mockApiService';
import { useAuth } from '../../../hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Spinner } from '../../ui/Spinner';
import { Alert } from '../../ui/Alert';

const PromotionStatusBadge: React.FC<{ status: PromotionStatus }> = ({ status }) => {
    const colors = {
        Active: 'bg-green-600 text-green-100',
        Scheduled: 'bg-blue-600 text-blue-100',
        Expired: 'bg-gray-600 text-gray-100',
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[status]}`}>{status}</span>;
}

export const PromotionManager: React.FC = () => {
    const { hasPermission } = useAuth();
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchPromotions = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await api.getPromotions();
            setPromotions(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch promotions.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPromotions();
    }, [fetchPromotions]);

    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

    return (
        <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="mb-4 md:mb-0">
                    <CardTitle>Promotion Campaigns</CardTitle>
                    <p className="mt-1 text-sm text-dark-text-secondary">Manage site-wide promotional offers and campaigns.</p>
                </div>
                {hasPermission('can_manage_promotions') && (
                    <Button onClick={() => alert('Promotion creation wizard coming soon!')} className="w-full md:w-auto">
                        Create New Promotion
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                {error && <Alert message={error} type="error" />}
                {isLoading ? (
                    <div className="flex justify-center py-16"><Spinner /></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-dark-border">
                            <thead className="bg-gray-800">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Promotion Name</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Type</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Duration</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-dark-card divide-y divide-dark-border">
                                {promotions.map(promo => (
                                    <tr key={promo.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-dark-text">{promo.name}</div>
                                            <div className="text-xs text-dark-text-secondary max-w-xs truncate">{promo.description}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text-secondary">{promo.type}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text-secondary">
                                            {formatDate(promo.startDate)} - {formatDate(promo.endDate)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <PromotionStatusBadge status={promo.status} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                            <button className="text-brand-secondary hover:text-brand-primary" disabled={!hasPermission('can_manage_promotions')}>Edit</button>
                                            <button className="text-red-500 hover:text-red-400" disabled={!hasPermission('can_manage_promotions')}>Deactivate</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};