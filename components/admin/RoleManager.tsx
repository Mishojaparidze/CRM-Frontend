import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AdminRole, User } from '../../types';
import * as api from '../../services/mockApiService';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Spinner } from '../ui/Spinner';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { RoleEditModal } from './RoleEditModal';

const PERMISSION_PREVIEW_LIMIT = 5;

export const RoleManager: React.FC = () => {
    const [admins, setAdmins] = useState<User[]>([]);
    const [roles, setRoles] = useState<AdminRole[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRoleForEdit, setSelectedRoleForEdit] = useState<AdminRole | undefined>(undefined);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const [usersResponse, rolesResponse] = await Promise.all([
                api.getAllUsers(),
                api.getAdminRoles()
            ]);
            setAdmins(usersResponse.data.filter(u => u.role === 'admin'));
            setRoles(rolesResponse.data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch data.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const usersPerRole = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const role of roles) {
            counts[role.id] = admins.filter(admin => admin.adminRoleId === role.id).length;
        }
        return counts;
    }, [admins, roles]);

    const handleRoleChange = async (adminUserId: string, newRoleId: string) => {
        setMessage('');
        setError('');
        try {
            const updatedAdmin = await api.assignAdminRole(adminUserId, newRoleId);
            setAdmins(prevAdmins => 
                prevAdmins.map(admin => 
                    admin.id === adminUserId ? updatedAdmin.data : admin
                )
            );
            setMessage(`Successfully updated role for ${updatedAdmin.data.username}.`);
        } catch (err: any) {
            setError(err.message || 'Failed to assign role.');
        }
    };

    const handleCreateRole = () => {
        setSelectedRoleForEdit(undefined);
        setIsModalOpen(true);
    };

    const handleEditRole = (role: AdminRole) => {
        setSelectedRoleForEdit(role);
        setIsModalOpen(true);
    };

    const handleDeleteRole = async (roleId: string) => {
        const roleName = roles.find(r => r.id === roleId)?.name;
        if (!window.confirm(`Are you sure you want to delete the "${roleName}" role? This cannot be undone.`)) {
            return;
        }
        
        setMessage('');
        setError('');
        try {
            const response = await api.deleteAdminRole(roleId);
            setMessage(response.message);
            fetchData(); // Refresh list
        } catch (err: any) {
            setError(err.message || 'Failed to delete role.');
        }
    };
    
    const onModalSave = () => {
        setIsModalOpen(false);
        fetchData(); // Refresh roles list after save
        setMessage('Role saved successfully.');
    };

    return (
        <>
        {isModalOpen && (
            <RoleEditModal 
                onClose={() => setIsModalOpen(false)}
                onSave={onModalSave}
                roleToEdit={selectedRoleForEdit}
            />
        )}
        <div className="space-y-8">
            <Card>
                <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="mb-4 md:mb-0">
                        <CardTitle>Manage Roles</CardTitle>
                        <p className="mt-1 text-sm text-dark-text-secondary">Create, edit, and delete administrative roles.</p>
                    </div>
                    <Button onClick={handleCreateRole} className="w-full md:w-auto">Create New Role</Button>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-dark-border">
                            <thead className="bg-gray-800">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Role Name</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Description</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Permissions</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Users Assigned</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                             <tbody className="bg-dark-card divide-y divide-dark-border">
                                {roles.map(role => (
                                    <tr key={role.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-dark-text">{role.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-normal text-sm text-dark-text-secondary max-w-sm">{role.description}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text">
                                            <div className="relative group">
                                                <span>{role.permissions.length} permissions</span>
                                                <div className="absolute z-10 bottom-full mb-2 w-64 p-2 bg-gray-900 border border-dark-border text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                                    <ul className="list-disc list-inside space-y-1">
                                                        {role.permissions.slice(0, PERMISSION_PREVIEW_LIMIT).map(p => <li key={p} className="capitalize">{p.replace(/can_|_/g, ' ')}</li>)}
                                                        {role.permissions.length > PERMISSION_PREVIEW_LIMIT && <li>...and {role.permissions.length - PERMISSION_PREVIEW_LIMIT} more</li>}
                                                    </ul>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text">{usersPerRole[role.id] || 0}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            {role.id !== 'role_super_admin' ? (
                                                <>
                                                    <button onClick={() => handleEditRole(role)} className="text-brand-secondary hover:text-brand-primary">Edit</button>
                                                    <button onClick={() => handleDeleteRole(role.id)} className="text-red-500 hover:text-red-400">Delete</button>
                                                </>
                                            ) : (
                                                <span className="text-xs text-dark-text-secondary italic">Cannot be modified</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Assign Roles to Administrators</CardTitle>
                    <p className="mt-1 text-sm text-dark-text-secondary">Assign roles to control access permissions.</p>
                </CardHeader>
                <CardContent>
                    <Alert message={error} type="error" />
                    <Alert message={message} type="success" />
                    {isLoading ? (
                        <div className="flex justify-center py-8"><Spinner /></div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-dark-border">
                                <thead className="bg-gray-800">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Admin User</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Current Role</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Assign New Role</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-dark-card divide-y divide-dark-border">
                                    {admins.map(admin => (
                                        <tr key={admin.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-dark-text">{admin.username}</div>
                                                <div className="text-sm text-dark-text-secondary">{admin.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text">
                                                {roles.find(r => r.id === admin.adminRoleId)?.name || 'Not Assigned'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <select
                                                    value={admin.adminRoleId || ''}
                                                    onChange={(e) => handleRoleChange(admin.id, e.target.value)}
                                                    className="block w-full max-w-xs pl-3 pr-10 py-2 text-base border-dark-border focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm rounded-md bg-gray-800 text-dark-text"
                                                    disabled={admin.adminRoleId === 'role_super_admin'}
                                                    title={admin.adminRoleId === 'role_super_admin' ? 'Super Admin role cannot be changed.' : 'Assign a new role'}
                                                >
                                                    {roles.map(role => (
                                                        <option key={role.id} value={role.id}>{role.name}</option>
                                                    ))}
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
        </>
    );
};