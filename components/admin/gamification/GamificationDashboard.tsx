import React, { useState, useEffect, useCallback } from 'react';
import { Achievement, Mission } from '../../../types';
import * as api from '../../../services/mockApiService';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Spinner } from '../../ui/Spinner';
import { Alert } from '../../ui/Alert';
import { ToggleSwitch } from '../../ui/ToggleSwitch';

const GamificationDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'achievements' | 'missions'>('achievements');

    const AchievementManager = () => {
        const [achievements, setAchievements] = useState<Achievement[]>([]);
        const [isLoading, setIsLoading] = useState(true);
        const [error, setError] = useState('');

        useEffect(() => {
            api.getAchievements()
                .then(res => setAchievements(res.data))
                .catch(err => setError(err.message || 'Failed to load achievements'))
                .finally(() => setIsLoading(false));
        }, []);
        
        return (
            <Card>
                <CardHeader className="flex justify-between items-center">
                    <CardTitle>Achievement Library</CardTitle>
                    <Button className="w-auto" onClick={() => alert('New achievement coming soon!')}>New Achievement</Button>
                </CardHeader>
                <CardContent>
                    {isLoading && <Spinner/>}
                    {error && <Alert message={error} type="error" />}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {achievements.map(ach => (
                            <div key={ach.id} className="p-4 bg-gray-800 rounded-lg text-center">
                                <p className="text-4xl mb-2">{ach.icon === 'star' ? '⭐' : ach.icon === 'diamond' ? '💎' : '❤️'}</p>
                                <p className="font-semibold text-white">{ach.name}</p>
                                <p className="text-xs text-dark-text-secondary">{ach.description}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    };
    
    const MissionManager = () => {
        const [missions, setMissions] = useState<Mission[]>([]);
        const [isLoading, setIsLoading] = useState(true);
        const [error, setError] = useState('');

        useEffect(() => {
            api.getMissions()
                .then(res => setMissions(res.data))
                .catch(err => setError(err.message || 'Failed to load missions'))
                .finally(() => setIsLoading(false));
        }, []);

        return (
            <Card>
                <CardHeader className="flex justify-between items-center">
                    <CardTitle>Active Missions</CardTitle>
                     <Button className="w-auto" onClick={() => alert('New mission coming soon!')}>New Mission</Button>
                </CardHeader>
                <CardContent>
                    {isLoading && <Spinner/>}
                    {error && <Alert message={error} type="error" />}
                    <div className="space-y-4">
                        {missions.map(mis => (
                             <div key={mis.id} className="p-4 bg-gray-800 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-white">{mis.title}</p>
                                    <p className="text-sm text-dark-text-secondary">{mis.description}</p>
                                    <p className="text-xs font-bold text-brand-secondary mt-1">Reward: {mis.reward}</p>
                                </div>
                                <ToggleSwitch id={`mission-${mis.id}`} label="Active" checked={mis.isActive} onChange={() => {}}/>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        )
    };
    
    const TabButton: React.FC<{ tabId: 'achievements' | 'missions', label: string }> = ({ tabId, label }) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`px-4 py-2 font-medium text-sm rounded-md ${activeTab === tabId ? 'bg-brand-primary text-white' : 'text-dark-text-secondary hover:bg-gray-800'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="space-y-6">
            <div>
                 <h2 className="text-2xl font-bold text-white mb-1">Gamification Engine</h2>
                <p className="text-dark-text-secondary">Configure achievements, missions, and leaderboards to drive engagement.</p>
            </div>
            <div className="flex items-center space-x-2 border-b border-dark-border pb-2">
                <TabButton tabId="achievements" label="Achievements" />
                <TabButton tabId="missions" label="Missions" />
            </div>
            <div>
                {activeTab === 'achievements' ? <AchievementManager /> : <MissionManager />}
            </div>
        </div>
    )
};

export default GamificationDashboard;