import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as api from '../../services/mockApiService';
import { useAuth } from '../../hooks/useAuth';
import { User, Affiliate } from '../../types';
import Header from '../Header';
import UserProfile from '../UserProfile';
import WalletManager from '../WalletManager';
import { CustomerNotes } from './CustomerNotes';
import { UserSessionsManager } from './UserSessionsManager';
import { BonusManager } from './BonusManager';
import { ResponsibleGamingManager } from './ResponsibleGamingManager';
import { DocumentManager } from './DocumentManager';
import { LinkedAccountsView } from './LinkedAccountsView';
import { UserTimeline } from './UserTimeline';
import { PlayerStats } from './PlayerStats';
import { Spinner } from '../ui/Spinner';
import { Alert } from '../ui/Alert';
import { GamingActivityFeed } from './GamingActivityFeed';
import { TaskManager } from './TaskManager';
import { DataPrivacyManager } from './privacy/DataPrivacyManager';
import { UserAchievements } from './gamification/UserAchievements';

const CustomerDetailView: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const { hasPermission } = useAuth();
    const [user, setUser] = useState<User | null>(null);
    const [referringAffiliate, setReferringAffiliate] = useState<Affiliate | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('overview');

    const fetchUser = useCallback(async () => {
        if (!userId) return;
        setIsLoading(true);
        setError('');
        try {
            const userResponse = await api.getUserById(userId);
            const userData = userResponse.data;
            setUser(userData);

            if (userData.referredByAffiliateId) {
                const affiliatesResponse = await api.getAffiliates();
                const affiliate = affiliatesResponse.data.find(a => a.id === userData.referredByAffiliateId);
                setReferringAffiliate(affiliate || null);
            }

        } catch (err: any) {
            setError(err.message || 'Failed to fetch user data.');
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const handleUserUpdate = (updatedUser: User) => {
        setUser(updatedUser);
    };
    
    const onUserAnonymized = () => {
        fetchUser(); // Refetch user data after anonymization
    };


    if (isLoading) {
        return <div className="min-h-screen bg-dark-bg flex items-center justify-center"><Spinner /></div>;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-dark-bg">
                <Header />
                <main className="py-10"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><Alert message={error} type="error" /></div></main>
            </div>
        );
    }
    
    if (!user) {
        return (
             <div className="min-h-screen bg-dark-bg">
                <Header />
                <main className="py-10"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><Alert message="User not found." type="error" /></div></main>
            </div>
        );
    }

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'tasks', label: 'Tasks' },
        { id: 'timeline', label: 'Timeline' },
        { id: 'gamification', label: 'Gamification' },
        { id: 'bonuses', label: 'Bonuses', permission: 'can_grant_bonuses' },
        { id: 'sessions', label: 'Sessions' },
        { id: 'rg', label: 'Responsible Gaming', permission: 'can_manage_rg_limits' },
        { id: 'documents', label: 'Documents' },
        { id: 'linked', label: 'Linked Accounts' },
        { id: 'privacy', label: 'Privacy', permission: 'can_manage_gdpr' }
    ].filter(tab => !tab.permission || hasPermission(tab.permission as any));

    return (
        <div className="min-h-screen bg-dark-bg">
            <Header />
            <main className="py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <Link to="/" className="text-sm text-brand-secondary hover:underline mb-4 inline-block">
                            &larr; Back to Admin Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold text-white">Customer View: {user.username}</h1>
                        <p className="mt-1 text-lg text-dark-text-secondary">{user.email}</p>
                        {referringAffiliate && (
                            <p className="mt-2 text-sm text-dark-text-secondary">
                                Referred by: <span className="font-semibold text-brand-secondary">{referringAffiliate.name}</span>
                            </p>
                        )}
                    </div>

                    <div className="border-b border-dark-border mb-6">
                        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`${
                                        activeTab === tab.id
                                            ? 'border-brand-primary text-brand-primary'
                                            : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div>
                        {activeTab === 'overview' && (
                             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-8">
                                    <PlayerStats user={user} />
                                    <GamingActivityFeed />
                                    <WalletManager userId={user.id} isAdminView />
                                </div>
                                <div className="lg:col-span-1 space-y-8">
                                    <UserProfile user={user} isAdminView onUpdate={handleUserUpdate} />
                                    <CustomerNotes user={user} onUpdate={handleUserUpdate} />
                                </div>
                            </div>
                        )}
                         {activeTab === 'tasks' && <TaskManager userId={user.id} allAdmins={[user]} />}
                         {activeTab === 'timeline' && <UserTimeline userId={user.id} />}
                         {activeTab === 'gamification' && <UserAchievements user={user} />}
                         {activeTab === 'bonuses' && <BonusManager userId={user.id} />}
                         {activeTab === 'sessions' && <UserSessionsManager userId={user.id} />}
                         {activeTab === 'rg' && <ResponsibleGamingManager user={user} onUpdate={handleUserUpdate} />}
                         {activeTab === 'documents' && <DocumentManager userId={user.id} />}
                         {activeTab === 'linked' && <LinkedAccountsView userId={user.id} />}
                         {activeTab === 'privacy' && <DataPrivacyManager user={user} onAnonymize={onUserAnonymized} />}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CustomerDetailView;