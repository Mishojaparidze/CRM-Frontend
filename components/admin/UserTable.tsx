import React from 'react';
import { Link } from 'react-router-dom';
import { User } from '../../types';
// FIX: Use relative path for useAuth
import { useAuth } from '../../hooks/useAuth';
import { Card, CardContent } from '../ui/Card';
import { StatusBadge } from './StatusBadge';

interface UserTableProps {
  users: User[];
  // FIX: Widen status type to match parent component's handler
  onStatusChange: (userId: string, status: User['status']) => void;
  onKycChange: (userId: string, kycStatus: 'none' | 'pending' | 'verified' | 'rejected') => void;
  selectedUserIds: string[];
  onSelectionChange: (userId: string, isSelected: boolean) => void;
  onSelectAllChange: (isSelected: boolean) => void;
  isAllSelected: boolean;
}

const KycBadge: React.FC<{ status: User['kycStatus'] }> = ({ status }) => {
    const colorClasses = {
        none: 'bg-gray-700 text-gray-200',
        pending: 'bg-yellow-800 text-yellow-200',
        verified: 'bg-blue-800 text-blue-200',
        rejected: 'bg-red-800 text-red-200',
    };
    return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${colorClasses[status]}`}>
            {status}
        </span>
    );
}

const ChurnRiskScore: React.FC<{ score: number }> = ({ score }) => {
    const getColor = () => {
        if (score > 75) return 'text-red-400';
        if (score > 40) return 'text-yellow-400';
        return 'text-green-400';
    };
    return <span className={`font-semibold ${getColor()}`}>{score}%</span>;
}

const HighRiskFlag: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
        <title>High Risk User</title>
        <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 01-1-1V6z" clipRule="evenodd" />
    </svg>
)

export const UserTable: React.FC<UserTableProps> = ({ users, onStatusChange, onKycChange, selectedUserIds, onSelectionChange, onSelectAllChange, isAllSelected }) => {
  const { hasPermission } = useAuth();
  
  return (
    <Card>
      <CardContent className="!p-0">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-dark-border">
            <thead className="bg-gray-800">
                <tr>
                <th scope="col" className="px-6 py-3">
                    <label htmlFor="select-all-users" className="sr-only">Select all users</label>
                    <input
                        id="select-all-users"
                        type="checkbox"
                        className="h-4 w-4 text-brand-primary bg-dark-card border-dark-border rounded focus:ring-brand-primary"
                        checked={isAllSelected}
                        onChange={(e) => onSelectAllChange(e.target.checked)}
                    />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                    User
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                    Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                    KYC Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                    Churn Risk
                </th>
                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                    Tags
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                    Joined
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                    Status Actions
                </th>
                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                    KYC Action
                </th>
                </tr>
            </thead>
            <tbody className="bg-dark-card divide-y divide-dark-border">
                {users.length === 0 ? (
                    <tr>
                        <td colSpan={9} className="text-center py-10 text-dark-text-secondary">
                            No users found matching your criteria.
                        </td>
                    </tr>
                ) : users.map((user) => (
                <tr key={user.id} className={selectedUserIds.includes(user.id) ? 'bg-gray-800' : ''}>
                    <td className="px-6 py-4">
                        <label htmlFor={`select-user-${user.id}`} className="sr-only">Select user {user.username}</label>
                         <input
                            id={`select-user-${user.id}`}
                            type="checkbox"
                            className="h-4 w-4 text-brand-primary bg-dark-card border-dark-border rounded focus:ring-brand-primary"
                            checked={selectedUserIds.includes(user.id)}
                            onChange={(e) => onSelectionChange(user.id, e.target.checked)}
                            disabled={user.role === 'admin'}
                            title={user.role === 'admin' ? "Cannot select admin for bulk actions" : ""}
                        />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                            {user.isHighRisk && <HighRiskFlag />}
                            <div>
                                <Link to={`/admin/user/${user.id}`} className="text-sm font-medium text-brand-secondary hover:text-brand-primary hover:underline">
                                    {user.username}
                                </Link>
                                <div className="text-sm text-dark-text-secondary">{user.email}</div>
                            </div>
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={user.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <KycBadge status={user.kycStatus} />
                    </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {user.churnPredictionScore !== undefined ? <ChurnRiskScore score={user.churnPredictionScore} /> : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text-secondary">
                       <div className="flex flex-wrap gap-1 max-w-xs">
                         {user.tags.length > 0 ? user.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 text-xs font-bold rounded-full bg-brand-primary text-white">
                                {tag}
                            </span>
                         )) : (
                            <span className="text-xs">No tags assigned.</span>
                         )}
                       </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text-secondary">
                        {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <label className="sr-only" htmlFor={`status-action-${user.id}`}>Update Status</label>
                        <select
                            id={`status-action-${user.id}`}
                            value={user.status}
                            onChange={(e) => onStatusChange(user.id, e.target.value as User['status'])}
                            className="block w-full pl-3 pr-10 py-1 text-base border-dark-border focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm rounded-md bg-gray-800 text-dark-text disabled:opacity-50"
                            disabled={user.role === 'admin' || !hasPermission('can_manage_users') || user.status === 'anonymized'}
                            title={user.role === 'admin' ? "Cannot change admin status" : "Change user status"}
                        >
                            <option value="active">Active</option>
                            <option value="suspended" disabled={!hasPermission('can_suspend_users')}>Suspended</option>
                            <option value="banned" disabled={!hasPermission('can_ban_users')}>Banned</option>
                        </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <label className="sr-only" htmlFor={`kyc-action-${user.id}`}>Update KYC Status</label>
                        <select
                            id={`kyc-action-${user.id}`}
                            value={user.kycStatus}
                            onChange={(e) => onKycChange(user.id, e.target.value as any)}
                            className="block w-full pl-3 pr-10 py-1 text-base border-dark-border focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm rounded-md bg-gray-800 text-dark-text disabled:opacity-50"
                            title="Change KYC status"
                            disabled={!hasPermission('can_edit_user_details')}
                        >
                            <option value="none">None</option>
                            <option value="pending">Pending</option>
                            <option value="verified">Verified</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      </CardContent>
    </Card>
  );
};