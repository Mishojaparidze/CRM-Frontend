import React, { useState, useEffect } from 'react';
import { User, Achievement } from '../../../types';
import * as api from '../../../services/mockApiService';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { Spinner } from '../../ui/Spinner';
import { Alert } from '../../ui/Alert';

interface UserAchievementsProps {
    user: User;
}

export const UserAchievements: React.FC<UserAchievementsProps> = ({ user }) => {
    const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAchievements = async () => {
            setIsLoading(true);
            try {
                const response = await api.getAchievements();
                setAllAchievements(response.data);
            } catch (err: any) {
                setError(err.message || 'Failed to load achievements library.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchAchievements();
    }, []);

    const userAchievements = allAchievements.filter(ach => user.achievements.includes(ach.id));

    return (
        <Card>
            <CardHeader>
                <CardTitle>User Achievements</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading && <div className="flex justify-center"><Spinner /></div>}
                {error && <Alert message={error} type="error" />}
                {!isLoading && !error && (
                    userAchievements.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {userAchievements.map(ach => (
                                <div key={ach.id} className="p-4 bg-gray-800 rounded-lg text-center flex flex-col items-center justify-center aspect-square" title={`${ach.name}: ${ach.description}`}>
                                    <p className="text-5xl mb-2">{ach.icon === 'star' ? '⭐' : ach.icon === 'diamond' ? '💎' : '❤️'}</p>
                                    <p className="font-semibold text-sm text-white">{ach.name}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-dark-text-secondary py-10">This user has not earned any achievements yet.</p>
                    )
                )}
            </CardContent>
        </Card>
    );
};