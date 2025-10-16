import React, { useState, useEffect, useCallback } from 'react';
import { LoyaltyTier } from '../../../types';
import * as api from '../../../services/mockApiService';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Spinner } from '../../ui/Spinner';
import { Alert } from '../../ui/Alert';

const tierStyles: Record<string, { icon: string; color: string }> = {
    Bronze: { icon: '🥉', color: 'text-yellow-600' },
    Silver: { icon: '🥈', color: 'text-gray-400' },
    Gold: { icon: '🥇', color: 'text-yellow-400' },
    Platinum: { icon: '💎', color: 'text-cyan-400' },
};

export const LoyaltyProgramManager: React.FC = () => {
    const [tiers, setTiers] = useState<LoyaltyTier[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchTiers = useCallback(async () => {
        setIsLoading(true);
        setError('');
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
    
    return (
         <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="mb-4 md:mb-0">
                    <CardTitle>Loyalty Program Tiers</CardTitle>
                    <p className="mt-1 text-sm text-dark-text-secondary">Configure the tiers and benefits for the loyalty program.</p>
                </div>
                <Button onClick={() => alert('Feature coming soon!')} className="w-full md:w-auto">
                    Add New Tier
                </Button>
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
                                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Tier</th>
                                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Points Required</th>
                                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Benefits</th>
                                     <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Actions</th>
                                 </tr>
                             </thead>
                             <tbody className="bg-dark-card divide-y divide-dark-border">
                                 {tiers.map(tier => (
                                     <tr key={tier.id}>
                                         <td className="px-6 py-4 whitespace-nowrap">
                                             <div className={`text-sm font-bold flex items-center ${tierStyles[tier.name]?.color}`}>
                                                 <span className="text-lg mr-2">{tierStyles[tier.name]?.icon}</span>
                                                 {tier.name}
                                             </div>
                                         </td>
                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text-secondary font-mono">{tier.pointsRequired.toLocaleString()}</td>
                                         <td className="px-6 py-4 whitespace-normal text-sm text-dark-text-secondary max-w-md">{tier.benefits.join(', ')}</td>
                                         <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                             <button className="text-brand-secondary hover:text-brand-primary">Edit</button>
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