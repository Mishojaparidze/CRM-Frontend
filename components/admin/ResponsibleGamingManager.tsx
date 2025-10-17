
import React, { useState } from 'react';
import { User, RGLimits } from '../../types';
import * as api from '../../services/mockApiService';
import { useAuth } from '../../hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { Input } from '../ui/Input';

interface ResponsibleGamingManagerProps {
    user: User;
    onUpdate: (user: User) => void;
}

export const ResponsibleGamingManager: React.FC<ResponsibleGamingManagerProps> = ({ user, onUpdate }) => {
    const { hasPermission } = useAuth();
    const [formData, setFormData] = useState<RGLimits>(user.responsibleGaming);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const canEdit = hasPermission('can_manage_rg_limits');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // Allow empty string to clear the value, otherwise convert to number
        const numValue = value === '' ? null : Number(value);
        setFormData(prev => ({ ...prev, [name]: numValue }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canEdit) return;

        setIsLoading(true);
        setError('');
        setMessage('');
        try {
            const response = await api.updateUserProfile(user.id, { responsibleGaming: formData });
            onUpdate(response.data);
            setMessage('Responsible gaming limits updated successfully.');
        } catch (err: any) {
            setError(err.message || 'Failed to update limits.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Responsible Gaming Limits</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Alert message={error} type="error" />
                    <Alert message={message} type="success" />
                    <p className="text-sm text-dark-text-secondary">
                        {canEdit 
                            ? "Set or view the player's self-imposed limits. Leave fields blank to remove a limit."
                            : "Viewing player's self-imposed limits. You do not have permission to edit them."
                        }
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Input
                            id="depositLimit"
                            name="depositLimit"
                            label="Weekly Deposit Limit ($)"
                            type="number"
                            placeholder="No Limit"
                            value={formData.depositLimit ?? ''}
                            onChange={handleInputChange}
                            disabled={!canEdit}
                        />
                        <Input
                            id="lossLimit"
                            name="lossLimit"
                            label="Weekly Loss Limit ($)"
                            type="number"
                            placeholder="No Limit"
                            value={formData.lossLimit ?? ''}
                            onChange={handleInputChange}
                            disabled={!canEdit}
                        />
                        <Input
                            id="sessionTimeLimit"
                            name="sessionTimeLimit"
                            label="Session Time Limit (minutes)"
                            type="number"
                            placeholder="No Limit"
                            value={formData.sessionTimeLimit ?? ''}
                            onChange={handleInputChange}
                            disabled={!canEdit}
                        />
                    </div>
                    {canEdit && (
                        <div className="flex justify-end pt-4 border-t border-dark-border">
                            <Button type="submit" isLoading={isLoading} className="w-auto">
                                Save Limits
                            </Button>
                        </div>
                    )}
                </form>
            </CardContent>
        </Card>
    );
};