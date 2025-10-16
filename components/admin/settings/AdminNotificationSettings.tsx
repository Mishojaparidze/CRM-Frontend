import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import * as api from '../../../services/mockApiService';
import { NotificationType } from '../../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { ToggleSwitch } from '../../ui/ToggleSwitch';
import { Button } from '../../ui/Button';
import { Alert } from '../../ui/Alert';

const NOTIFICATION_CONFIG: { id: NotificationType; label: string; description: string }[] = [
    { id: 'new_vip', label: 'New VIP User', description: 'Get notified when a user is promoted to VIP status.' },
    { id: 'large_deposit', label: 'Large Deposit', description: 'Get notified for deposits over a specified threshold.' },
    { id: 'high_risk_flag', label: 'High-Risk User Flagged', description: 'Get notified when a user is automatically flagged as high-risk.' },
    { id: 'new_support_ticket', label: 'New Support Ticket', description: 'Get notified when a new support ticket is created.' },
];

export const AdminNotificationSettings: React.FC = () => {
    const { user, updateUser } = useAuth();
    const [settings, setSettings] = useState(user?.notificationSettings || {});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    if (!user) return null;

    const handleToggle = (id: NotificationType, type: 'email' | 'inApp', checked: boolean) => {
        setSettings(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                [type]: checked,
            }
        }));
    };

    const handleSave = async () => {
        setIsLoading(true);
        setError('');
        setMessage('');
        try {
            const response = await api.updateUserProfile(user.id, { notificationSettings: settings });
            updateUser({ notificationSettings: response.data.notificationSettings });
            setMessage('Notification settings saved successfully.');
        } catch (err: any) {
            setError(err.message || 'Failed to save settings.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <p className="text-sm text-dark-text-secondary mt-1">Choose which events you want to be notified about.</p>
            </CardHeader>
            <CardContent>
                <Alert message={error} type="error" />
                <Alert message={message} type="success" />
                <div className="divide-y divide-dark-border">
                    {NOTIFICATION_CONFIG.map(({ id, label, description }) => (
                        <div key={id} className="py-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                            <div className="md:col-span-1">
                                <h4 className="font-medium text-dark-text">{label}</h4>
                                <p className="text-xs text-dark-text-secondary">{description}</p>
                            </div>
                            <div className="md:col-span-2 grid grid-cols-2 gap-4">
                                <ToggleSwitch
                                    id={`email-${id}`}
                                    label="Email"
                                    checked={settings[id]?.email || false}
                                    onChange={(checked) => handleToggle(id, 'email', checked)}
                                />
                                <ToggleSwitch
                                    id={`inapp-${id}`}
                                    label="In-App"
                                    checked={settings[id]?.inApp || false}
                                    onChange={(checked) => handleToggle(id, 'inApp', checked)}
                                />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-end pt-6 mt-6 border-t border-dark-border">
                    <Button onClick={handleSave} isLoading={isLoading} className="w-auto">
                        Save Settings
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};