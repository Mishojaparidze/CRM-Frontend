import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, GamingActivity } from '../../types';
import * as api from '../../services/mockApiService';
import Header from '../Header';
import { Spinner } from '../ui/Spinner';
import { Alert } from '../ui/Alert';
import UserProfile from '../UserProfile';
import WalletManager from '../WalletManager';
import { CustomerNotes } from './CustomerNotes';
import { UserSessionsManager } from './UserSessionsManager';
import { UserPreferencesManager } from './UserPreferencesManager';
import { PlayerStats } from './PlayerStats';
import { GamingActivityFeed } from './GamingActivityFeed';
import { BonusManager } from './BonusManager';
import { ResponsibleGamingManager } from './ResponsibleGamingManager';
import { DocumentManager } from './DocumentManager';
import { LinkedAccountsView } from './LinkedAccountsView';
import { UserTimeline } from './UserTimeline';
import { DataPrivacyManager } from './privacy/DataPrivacyManager';
import { UserAchievements } from './gamification/UserAchievements';
import { LoyaltyProgramStatus } from './loyalty/LoyaltyProgramStatus';
import { RiskAssessmentCard } from './risk/RiskAssessmentCard';
import { TaskManager } from './TaskManager';
import AccountBalanceCard from './financials/AccountBalanceCard';
import TransactionTable from './financials/TransactionTable';
import { PlayerPromotionsManager } from './promotions/PlayerPromotionsManager';

type DetailTab = 'overview' | 'financials' | 'notes' | 'gaming' | 'bonuses' | 'settings' | 'security' | 'privacy';

const CustomerDetailView: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');

  const fetchUser = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    setError('');
    try {
      const response = await api.getUserById(userId);
      setUser(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load user data.');
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
  
  const handleAnonymize = () => {
    fetchUser(); // Refetch user data after anonymization
  }

  const TabButton: React.FC<{ tabId: DetailTab, label: string }> = ({ tabId, label }) => (
    <button
      onClick={() => setActiveTab(tabId)}
      className={`px-3 py-2 font-medium text-sm rounded-md whitespace-nowrap ${activeTab === tabId ? 'bg-brand-primary text-white' : 'text-dark-text-secondary hover:bg-gray-800'}`}
    >
      {label}
    </button>
  );

  const renderContent = () => {
    if (!user) return null;
    switch (activeTab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <PlayerStats user={user} />
              <UserProfile user={user} isAdminView={true} onUpdate={handleUserUpdate} />
            </div>
            <div className="lg:col-span-1 space-y-8">
              <AccountBalanceCard user={user} />
              <RiskAssessmentCard userId={user.id} userStatus={user.status} />
              <LoyaltyProgramStatus user={user} />
            </div>
          </div>
        );
      case 'financials':
          return (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                      <TransactionTable type="deposit" title="Deposit History" userId={user.id} />
                      <TransactionTable type="withdrawal" title="Withdrawal History" userId={user.id} />
                  </div>
                  <div className="lg:col-span-1 space-y-8">
                      <WalletManager userId={user.id} isAdminView={true} />
                  </div>
              </div>
          );
      case 'notes':
        return <CustomerNotes user={user} onUpdate={handleUserUpdate} />;
      case 'gaming':
         return (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2"><UserTimeline userId={user.id} /></div>
                <div className="lg:col-span-1 space-y-8">
                  <UserAchievements user={user} />
                  <TaskManager userId={user.id} />
                </div>
             </div>
         );
      case 'bonuses':
        return (
            <div className="space-y-8">
                <PlayerPromotionsManager userId={user.id} />
                <BonusManager userId={user.id} />
            </div>
        );
      case 'settings':
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <UserPreferencesManager user={user} onUpdate={handleUserUpdate} />
                <ResponsibleGamingManager user={user} onUpdate={handleUserUpdate} />
            </div>
        );
      case 'security':
         return (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <UserSessionsManager userId={user.id} />
                <DocumentManager userId={user.id} />
                <LinkedAccountsView userId={user.id} />
            </div>
         );
       case 'privacy':
         return <DataPrivacyManager user={user} onAnonymize={handleAnonymize} />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <Spinner />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-dark-bg">
      <Header />
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {error && <Alert message={error} type="error" />}
          {user && (
            <div className="space-y-6">
              <div>
                <Link to="/" className="text-sm text-brand-secondary hover:underline mb-4 inline-block">
                  &larr; Back to Admin Dashboard
                </Link>
                <h1 className="text-3xl font-bold text-white">Customer Profile: {user.username}</h1>
                <p className="mt-1 text-lg text-dark-text-secondary">Viewing details for user ID: <span className="font-mono text-xs">{user.id}</span></p>
              </div>
              <div className="border-b border-dark-border">
                <nav className="-mb-px flex space-x-2 overflow-x-auto" aria-label="Tabs">
                    <TabButton tabId="overview" label="Overview" />
                    <TabButton tabId="financials" label="Financials" />
                    <TabButton tabId="notes" label="Notes" />
                    <TabButton tabId="gaming" label="Gaming Activity" />
                    <TabButton tabId="bonuses" label="Bonuses & Promotions" />
                    <TabButton tabId="settings" label="Preferences" />
                    <TabButton tabId="security" label="Security" />
                    <TabButton tabId="privacy" label="Privacy (GDPR)" />
                </nav>
              </div>
              <div>
                {renderContent()}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CustomerDetailView;