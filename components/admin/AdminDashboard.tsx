import React, { useState, useEffect } from 'react';
import { User, LoyaltyTier, Promotion } from '../../types';
import * as api from '../../services/mockApiService';
import { AdminStats } from './AdminStats';
import { UserTable } from './UserTable';
import { UserTableSkeleton } from './UserTableSkeleton';
import { Alert } from '../ui/Alert';
import { UserFilters } from './UserFilters';
import { SegmentManager } from './SegmentManager';
import { SupportTicketManager } from './SupportTicketManager';
import { EmailTemplateManager } from './EmailTemplateManager';
import AnalyticsDashboard from './AnalyticsDashboard';
import AutomationDashboard from './automation/AutomationDashboard';
// FIX: Changed to a named import as TaskManager is not a default export.
import { TaskManager } from './TaskManager';
import AdminSettingsDashboard from './settings/AdminSettingsDashboard';
import PlatformSettingsDashboard from './platform/PlatformSettingsDashboard';
import { RoleManager } from './RoleManager';
import AffiliateDashboard from './affiliates/AffiliateDashboard';
import GamificationDashboard from './gamification/GamificationDashboard';
import { LoyaltyProgramManager } from './loyalty/LoyaltyProgramManager';
import { PromotionManager } from './promotions/PromotionManager';
import { BulkActionsBar } from './BulkActionsBar';
import { Button } from '../ui/Button';
import { CreateUserModal } from './CreateUserModal';
import FinancialDashboard from './financials/FinancialDashboard';
import { AssignPromotionModal } from './promotions/AssignPromotionModal';

type AdminTab = 'customers' | 'analytics' | 'financials' | 'support' | 'promotions' | 'gamification' | 'automation' | 'tasks' | 'settings' | 'platform';

type QuickFilterType = 'none' | 'new_players' | 'at_risk' | 'whales' | 'inactive';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('customers');
  const [users, setUsers] = useState<User[]>([]);
  const [loyaltyTiers, setLoyaltyTiers] = useState<LoyaltyTier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const [filters, setFilters] = useState({ query: '', status: 'all', kycStatus: 'all', loyaltyTierId: 'all' });
  const [activeQuickFilter, setActiveQuickFilter] = useState<QuickFilterType>('none');

  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isCreateUserModalOpen, setCreateUserModalOpen] = useState(false);
  const [isAssignPromotionModalOpen, setAssignPromotionModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError('');
      try {
        const [usersResponse, tiersResponse] = await Promise.all([
          api.getAllUsers(),
          api.getLoyaltyTiers()
        ]);
        setUsers(usersResponse.data);
        setLoyaltyTiers(tiersResponse.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch initial data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleStatusChange = async (userId: string, status: User['status']) => {
    try {
      const response = await api.updateUserProfile(userId, { status });
      setUsers(users.map(u => (u.id === userId ? response.data : u)));
    } catch (err: any) {
      setError(err.message || 'Failed to update status.');
    }
  };

  const handleKycChange = async (userId: string, kycStatus: User['kycStatus']) => {
     try {
      const response = await api.updateUserProfile(userId, { kycStatus });
      setUsers(users.map(u => (u.id === userId ? response.data : u)));
    } catch (err: any) {
      setError(err.message || 'Failed to update KYC status.');
    }
  };

  const handleSelectionChange = (userId: string, isSelected: boolean) => {
    setSelectedUserIds(prev => 
      isSelected ? [...prev, userId] : prev.filter(id => id !== userId)
    );
  };

  const handleSelectAllChange = (isSelected: boolean) => {
    if (isSelected) {
        const userIdsToSelect = filteredUsers.filter(u => u.role !== 'admin').map(u => u.id);
        setSelectedUserIds(userIdsToSelect);
    } else {
        setSelectedUserIds([]);
    }
  };

  const handleQuickFilterChange = (filter: QuickFilterType) => {
    setActiveQuickFilter(prev => prev === filter ? 'none' : filter);
    setFilters({ query: '', status: 'all', kycStatus: 'all', loyaltyTierId: 'all' }); // Reset manual filters
  };

  const handleBulkAction = async (action: 'suspend' | 'activate' | 'add_tag', payload?: { tag?: string }) => {
    setMessage('');
    setError('');

    const actionDescription = action === 'add_tag' ? `add tag "${payload?.tag}" to` : action;

    if (!window.confirm(`Are you sure you want to ${actionDescription} ${selectedUserIds.length} users?`)) return;

    try {
        const promises = selectedUserIds.map(userId => {
            if (action === 'add_tag' && payload?.tag) {
                const user = users.find(u => u.id === userId);
                const newTags = user ? [...new Set([...user.tags, payload.tag])] : [payload.tag];
                return api.updateUserProfile(userId, { tags: newTags });
            }
            return api.updateUserProfile(userId, { status: action === 'suspend' ? 'suspended' : 'active' });
        });

        const results = await Promise.all(promises);
        setUsers(currentUsers => currentUsers.map(u => {
            const updatedUser = results.find(res => res.data.id === u.id);
            return updatedUser ? updatedUser.data : u;
        }));
        
        setMessage(`Successfully performed bulk action on ${selectedUserIds.length} users.`);
        setSelectedUserIds([]);
    } catch(err: any) {
        setError(err.message || 'Failed to perform bulk action.');
    }
  }
  
  const handleUserCreated = () => {
    setCreateUserModalOpen(false);
    setMessage('User created successfully. Refreshing list...');
    api.getAllUsers().then(res => setUsers(res.data)); // refetch
  };

  const handlePromotionAssigned = (count: number, promotionName: string) => {
    setAssignPromotionModalOpen(false);
    setMessage(`${count} users have been assigned the "${promotionName}" promotion.`);
    setSelectedUserIds([]);
  }

  const filteredUsers = React.useMemo(() => {
    if (activeQuickFilter !== 'none') {
      const now = new Date();
      switch(activeQuickFilter) {
        case 'new_players':
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return users.filter(u => new Date(u.createdAt) > sevenDaysAgo);
        case 'at_risk':
          return users.filter(u => u.churnPredictionScore && u.churnPredictionScore > 75);
        case 'whales':
          return users.filter(u => u.ltv > 5000);
        case 'inactive':
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return users.filter(u => new Date(u.lastLoginAt) < thirtyDaysAgo);
        default:
          return users;
      }
    }

    return users.filter(user => {
      const queryLower = filters.query.toLowerCase();
      return (
        (filters.status === 'all' || user.status === filters.status) &&
        (filters.kycStatus === 'all' || user.kycStatus === filters.kycStatus) &&
        (filters.loyaltyTierId === 'all' || user.loyaltyTierId === filters.loyaltyTierId) &&
        (user.username.toLowerCase().includes(queryLower) ||
         user.email.toLowerCase().includes(queryLower) ||
         user.id.toLowerCase().includes(queryLower))
      );
    });
  }, [users, filters, activeQuickFilter]);
  
  const TabButton: React.FC<{ tabId: AdminTab, label: string }> = ({ tabId, label }) => (
    <button
      onClick={() => setActiveTab(tabId)}
      className={`px-3 py-2 font-medium text-sm rounded-md whitespace-nowrap ${activeTab === tabId ? 'bg-brand-primary text-white' : 'text-dark-text-secondary hover:bg-gray-800'}`}
    >
      {label}
    </button>
  );

  const renderContent = () => {
    if (isLoading) {
      return <UserTableSkeleton />;
    }
    if (error) {
      return <Alert message={error} type="error" />;
    }

    switch (activeTab) {
      case 'customers':
        return (
          <>
            <AdminStats users={users} />
            <div className="mt-8">
              <UserFilters 
                filters={filters} 
                onFilterChange={setFilters} 
                loyaltyTiers={loyaltyTiers}
                activeQuickFilter={activeQuickFilter}
                onQuickFilterChange={handleQuickFilterChange}
              />
            </div>
             <div className="mt-4 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">All Users ({filteredUsers.length})</h2>
                <Button onClick={() => setCreateUserModalOpen(true)} className="w-auto">Create User</Button>
            </div>
            {selectedUserIds.length > 0 && (
                <BulkActionsBar 
                    selectedCount={selectedUserIds.length}
                    onClearSelection={() => setSelectedUserIds([])}
                    onBulkAction={handleBulkAction}
                    onAssignPromotion={() => setAssignPromotionModalOpen(true)}
                />
            )}
            <div className="mt-4">
              <UserTable 
                users={filteredUsers} 
                onStatusChange={handleStatusChange} 
                onKycChange={handleKycChange}
                selectedUserIds={selectedUserIds}
                onSelectionChange={handleSelectionChange}
                isAllSelected={selectedUserIds.length > 0 && selectedUserIds.length === filteredUsers.filter(u => u.role !== 'admin').length}
                onSelectAllChange={handleSelectAllChange}
              />
            </div>
          </>
        );
      case 'financials':
        return <FinancialDashboard />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'support':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2"><SupportTicketManager /></div>
            <div className="lg:col-span-1"><SegmentManager /></div>
          </div>
        );
      case 'promotions':
          return (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2"><PromotionManager /></div>
                <div className="lg:col-span-1"><LoyaltyProgramManager /></div>
             </div>
          );
      case 'gamification':
        return <GamificationDashboard />;
      case 'automation':
        return <AutomationDashboard />;
      case 'tasks':
        return <TaskManager />;
      case 'settings':
        return (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2"><RoleManager /></div>
                <div className="lg:col-span-1"><AdminSettingsDashboard/></div>
             </div>
        );
      case 'platform':
        return <PlatformSettingsDashboard />;
      default:
        return null;
    }
  };

  return (
    <>
      {isCreateUserModalOpen && <CreateUserModal onClose={() => setCreateUserModalOpen(false)} onUserCreated={handleUserCreated} />}
      {isAssignPromotionModalOpen && (
        <AssignPromotionModal
            userIds={selectedUserIds}
            onClose={() => setAssignPromotionModalOpen(false)}
            onAssign={handlePromotionAssigned}
        />
      )}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="mt-1 text-lg text-dark-text-secondary">Welcome to the central control panel.</p>
        </div>
        <div className="border-b border-dark-border">
          <nav className="-mb-px flex space-x-2 overflow-x-auto" aria-label="Tabs">
            <TabButton tabId="customers" label="Customers" />
            <TabButton tabId="financials" label="Financials" />
            <TabButton tabId="analytics" label="Analytics" />
            <TabButton tabId="support" label="Support" />
            <TabButton tabId="promotions" label="Promotions" />
            <TabButton tabId="gamification" label="Gamification" />
            <TabButton tabId="automation" label="Automation" />
            <TabButton tabId="tasks" label="Tasks" />
            <TabButton tabId="platform" label="Platform" />
            <TabButton tabId="settings" label="My Settings" />
          </nav>
        </div>
        <div>
          {renderContent()}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;