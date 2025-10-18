
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import Header from './Header';
import UserProfile from './UserProfile';
import WalletManager from './WalletManager';
import AdminDashboard from './admin/AdminDashboard';
import ChangePassword from './ChangePassword';
import BonusTracker from './BonusTracker';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null; // Or a loading spinner
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <Header />
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {user.role === 'admin' ? (
            <AdminDashboard />
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Welcome back, {user.username}!</h1>
                <p className="mt-1 text-lg text-dark-text-secondary">Here's your CRM dashboard.</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <UserProfile />
                  <ChangePassword />
                </div>
                <div className="lg:col-span-3 space-y-8">
                  <BonusTracker userId={user.id} />
                  <WalletManager userId={user.id} />
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;