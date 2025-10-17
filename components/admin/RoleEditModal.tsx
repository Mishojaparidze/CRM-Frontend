
import React, { useState, useEffect } from 'react';
import { AdminRole, Permission } from '../../types';
import * as api from '../../services/mockApiService';
import { ALL_PERMISSIONS } from '../../services/mockApiService';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';

interface RoleEditModalProps {
    roleToEdit?: AdminRole;
    onClose: () => void;
    onSave: () => void;
}

export const RoleEditModal: React.FC<RoleEditModalProps> = ({ roleToEdit, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [permissions, setPermissions] = useState<Set<Permission>>(new Set());
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const isEditing = !!roleToEdit;

    useEffect(() => {
        if (isEditing) {
            setName(roleToEdit.name);
            setDescription(roleToEdit.description);
            setPermissions(new Set(roleToEdit.permissions));
        }
    }, [roleToEdit, isEditing]);

    const handlePermissionChange = (permission: Permission, isChecked: boolean) => {
        setPermissions(prev => {
            const newPermissions = new Set(prev);
            if (isChecked) {
                newPermissions.add(permission);
            } else {
                newPermissions.delete(permission);
            }
            return newPermissions;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('Role name is required.');
            return;
        }

        setIsLoading(true);
        try {
            if (isEditing) {
                await api.updateAdminRole(roleToEdit.id, {
                    name,
                    description,
                    permissions: Array.from(permissions),
                });
            } else {
                await api.createAdminRole(name, description, Array.from(permissions));
            }
            onSave();
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4" aria-modal="true" role="dialog">
            <div className="bg-dark-card rounded-lg shadow-xl w-full max-w-2xl max-h-full overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <CardHeader className="flex justify-between items-center sticky top-0 bg-dark-card z-10">
                        <CardTitle>{isEditing ? 'Edit Role' : 'Create New Role'}</CardTitle>
                         <button type="button" onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </CardHeader>
                    <CardContent className="space-y-6">
                         {error && <Alert message={error} type="error" />}
                         <Input
                            id="role-name"
                            label="Role Name"
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                         />
                         <div>
                            <label htmlFor="role-description" className="block text-sm font-medium text-dark-text-secondary">Description</label>
                            <textarea
                                id="role-description"
                                rows={3}
                                className="mt-1 appearance-none block w-full px-3 py-2 border border-dark-border rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm bg-gray-800 text-dark-text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                         </div>

                         <div className="space-y-2">
                            <h4 className="text-md font-medium text-dark-text">Permissions</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border border-dark-border rounded-md">
                                {ALL_PERMISSIONS.map(permission => (
                                    <label key={permission} className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 text-brand-primary bg-dark-card border-dark-border rounded focus:ring-brand-primary"
                                            checked={permissions.has(permission)}
                                            onChange={(e) => handlePermissionChange(permission, e.target.checked)}
                                        />
                                        <span className="text-sm text-dark-text-secondary">{permission.replace(/_/g, ' ').replace('can ', '')}</span>
                                    </label>
                                ))}
                            </div>
                         </div>
                    </CardContent>
                    <div className="bg-gray-800 px-6 py-4 flex justify-end space-x-2 rounded-b-lg sticky bottom-0 z-10">
                        <Button type="button" variant="secondary" onClick={onClose} className="w-auto">Cancel</Button>
                        <Button type="submit" isLoading={isLoading} className="w-auto">Save Role</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};