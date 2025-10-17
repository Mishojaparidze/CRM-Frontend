import React, { useState, useEffect, useCallback } from 'react';
import { User } from '../../types';
import * as api from '../../services/mockApiService';
import { useAuth } from '../../hooks/useAuth';
import { AdminStats } from './AdminStats';
import { UserTable } from './UserTable';
import { Card, CardContent } from '../ui/Card';
import { Alert } from '../ui/Alert';
import { Spinner } from '../ui/Spinner';
import { SegmentManager } from './SegmentManager';
import { RoleManager } from './RoleManager';
import { AuditLogView } from './AuditLogView';
import { SupportTicketManager } from './SupportTicketManager';
import { EmailTemplateManager } from './EmailTemplateManager';
import AnalyticsDashboard from './AnalyticsDashboard';
import AutomationDashboard from './AutomationDashboard';
import { TaskManager } from './TaskManager';
import AdminSettingsDashboard from './settings/AdminSettingsDashboard';
import PlatformSettingsDashboard from './platform/PlatformSettingsDashboard';
import AffiliateDashboard from './affiliates/AffiliateDashboard';
import GamificationDashboard from './gamification/GamificationDashboard';
import { LoyaltyProgramManager } from './loyalty/LoyaltyProgramManager';
import { PromotionManager } from './promotions/PromotionManager';
import { Button } from '../ui/Button';
import { CreateUserModal } from './CreateUserModal';
import { BulkActionsBar } from './BulkActionsBar';
import { UserTableSkeleton } from './UserTableSkeleton';

type Tab = 'overview' | 'users' | 'segments' | 'roles' | 'support' | 'tasks' | 'email' | 'analytics' | 'automation' | 'settings' | 'platform' | 'audit' | 'affiliates' | 'gamification' | 'loyalty' | 'promotions';

const AdminDashboard: React.FC = () => {
    const { hasPermission } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await api.getAllUsers();
            setUsers(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch users.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'users' || activeTab === 'overview') {
            fetchUsers();
        }
    }, [fetchUsers, activeTab]);

    const handleStatusChange = useCallback(async (userId: string, status: User['status']) => {
        const originalUsers = [...users];
        setUsers(users.map(u => u.id === userId ? { ...u, status } : u));
        try {
            await api.updateUserProfile(userId, { status });
            setMessage(`User ${userId} status updated to ${status}.`);
        } catch (err: any) {
            setError(err.message || `Failed to update status for user ${userId}.`);
            setUsers(originalUsers); // Revert on error
        }
    }, [users]);

    const handleKycChange = useCallback(async (userId: string, kycStatus: User['kycStatus']) => {
        const originalUsers = [...users];
        setUsers(users.map(u => u.id === userId ? { ...u, kycStatus } : u));
        try {
            await api.updateUserProfile(userId, { kycStatus });
            setMessage(`User ${userId} KYC status updated to ${kycStatus}.`);
        } catch (err: any) {
            setError(err.message || `Failed to update KYC status for user ${userId}.`);
            setUsers(originalUsers); // Revert on error
        }
    }, [users]);
    
    const handleSelectionChange = (userId: string, isSelected: boolean) => {
        setSelectedUserIds(prev =>
            isSelected ? [...prev, userId] : prev.filter(id => id !== userId)
        );
    };

    const handleSelectAll = (isSelected: boolean) => {
        if (isSelected) {
            setSelectedUserIds(users.filter(u => u.role !== 'admin').map(u => u.id));
        } else {
            setSelectedUserIds([]);
        }
    };

    const handleBulkAction = async (action: 'suspend' | 'activate' | 'add_tag', payload?: { tag?: string }) => {
        setMessage('');
        setError('');
        try {
            const response = await api.performBulkUserAction(selectedUserIds, action, payload);
            setMessage(response.message);
            setSelectedUserIds([]);
            fetchUsers();
        } catch (err: any) {
            setError(err.message || `Failed to perform bulk action: ${action}.`);
        }
    };


    const renderContent = () => {
        if (error) {
            return <Alert message={error} type="error" />;
        }
        
        switch (activeTab) {
            case 'overview':
                return isLoading ? <div className="flex justify-center py-16"><Spinner /></div> : (
                    <div className="space-y-8">
                        <AdminStats users={users} />
                        <TaskManager />
                        <SupportTicketManager />
                    </div>
                );
            case 'users':
                return (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-white">User Management</h2>
                            {hasPermission('can_manage_users') && (
                                <Button onClick={() => setIsCreateUserModalOpen(true)} className="w-auto">Create New User</Button>
                            )}
                        </div>
                        <Alert message={message} type="success" />
                        <Alert message={error} type="error" />
                        {selectedUserIds.length > 0 && (
                             <BulkActionsBar
                                selectedCount={selectedUserIds.length}
                                onClearSelection={() => setSelectedUserIds([])}
                                onBulkAction={handleBulkAction}
                            />
                        )}
                        {isLoading ? <UserTableSkeleton /> : (
                            <UserTable 
                                users={users} 
                                onStatusChange={handleStatusChange} 
                                onKycChange={handleKycChange}
                                selectedUserIds={selectedUserIds}
                                onSelectionChange={handleSelectionChange}
                                onSelectAllChange={handleSelectAll}
                                isAllSelected={selectedUserIds.length > 0 && selectedUserIds.length === users.filter(u => u.role !== 'admin').length}
                            />
                        )}
                    </div>
                );
            case 'segments': return <SegmentManager />;
            case 'roles': return hasPermission('can_manage_roles') ? <RoleManager /> : null;
            case 'support': return hasPermission('can_manage_support_tickets') ? <SupportTicketManager /> : null;
            case 'tasks': return <TaskManager />;
            case 'email': return hasPermission('can_manage_email_templates') ? <EmailTemplateManager /> : null;
            case 'analytics': return hasPermission('can_view_analytics') ? <AnalyticsDashboard /> : null;
            case 'automation': return hasPermission('can_manage_automation') ? <AutomationDashboard /> : null;
            case 'promotions': return hasPermission('can_manage_promotions') ? <PromotionManager /> : null;
            case 'affiliates': return hasPermission('can_manage_affiliates') ? <AffiliateDashboard /> : null;
            case 'gamification': return hasPermission('can_manage_gamification') ? <GamificationDashboard /> : null;
            case 'loyalty': return <LoyaltyProgramManager />;
            case 'settings': return <AdminSettingsDashboard />;
            case 'platform': return hasPermission('can_manage_platform_settings') ? <PlatformSettingsDashboard /> : null;
            case 'audit': return hasPermission('can_view_audit_logs') ? <AuditLogView /> : null;
            default: return null;
        }
    };
    
    const TabButton: React.FC<{ tabId: Tab, label: string }> = ({ tabId, label }) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`px-3 py-2 font-medium text-sm rounded-md ${activeTab === tabId ? 'bg-brand-primary text-white' : 'text-dark-text-secondary hover:bg-gray-800'}`}
        >
            {label}
        </button>
    );

    return (
        <>
            {isCreateUserModalOpen && (
                <CreateUserModal
                    onClose={() => setIsCreateUserModalOpen(false)}
                    onUserCreated={() => {
                        setIsCreateUserModalOpen(false);
                        setMessage('User created successfully.');
                        fetchUsers();
                    }}
                />
            )}
            <div className="space-y-8">
                <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                
                <Card>
                    <CardContent className="!p-2">
                        <nav className="flex flex-wrap gap-2">
                            <TabButton tabId="overview" label="Overview" />
                            <TabButton tabId="users" label="Users" />
                            {hasPermission('can_manage_support_tickets') && <TabButton tabId="support" label="Support" />}
                            {hasPermission('can_view_analytics') && <TabButton tabId="analytics" label="Analytics" />}
                            {hasPermission('can_manage_promotions') && <TabButton tabId="promotions" label="Promotions" />}
                            {hasPermission('can_manage_affiliates') && <TabButton tabId="affiliates" label="Affiliates" />}
                            {hasPermission('can_manage_gamification') && <TabButton tabId="gamification" label="Gamification" />}
                            <TabButton tabId="loyalty" label="Loyalty" />
                            {hasPermission('can_manage_automation') && <TabButton tabId="automation" label="Automation" />}
                            <TabButton tabId="settings" label="My Settings" />
                            {hasPermission('can_manage_platform_settings') && <TabButton tabId="platform" label="Platform" />}
                            {hasPermission('can_manage_roles') && <TabButton tabId="roles" label="Roles" />}
                            {hasPermission('can_view_audit_logs') && <TabButton tabId="audit" label="Audit Log" />}
                        </nav>
                    </CardContent>
                </Card>

                <div>
                    {renderContent()}
                </div>
            </div>
        </>
    );
};

export default AdminDashboard;