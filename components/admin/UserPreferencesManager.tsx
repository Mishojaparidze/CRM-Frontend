
import React, { useState } from 'react';
import { User, UserPreferences } from '../../types';
import * as api from '../../services/mockApiService';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { ToggleSwitch } from '../ui/ToggleSwitch';

interface UserPreferencesManagerProps {
    user: User;
    onUpdate: (user: User) => void;
}

export const UserPreferencesManager: React.FC<UserPreferencesManagerProps> = ({ user, onUpdate }) => {
    const [formData, setFormData] = useState<UserPreferences>(user.preferences);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleToggleChange = (name: keyof UserPreferences, checked: boolean) => {
        setFormData(prev => ({ ...prev, [name]: checked }));
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');
        try {
            const response = await api.updateUserProfile(user.id, { preferences: formData });
            onUpdate(response.data);
            setMessage('Preferences updated successfully.');
        } catch (err: any) {
            setError(err.message || 'Failed to update preferences.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>User Preferences</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Alert message={error} type="error" />
                    <Alert message={message} type="success" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="language" className="block text-sm font-medium text-dark-text-secondary">Language</label>
                            <select id="language" name="language" value={formData.language} onChange={handleInputChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-dark-border focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm rounded-md bg-dark-card text-dark-text">
                                <option value="en">English</option>
                                <option value="es">Español</option>
                                <option value="fr">Français</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="theme" className="block text-sm font-medium text-dark-text-secondary">Theme</label>
                            <select id="theme" name="theme" value={formData.theme} onChange={handleInputChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-dark-border focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm rounded-md bg-dark-card text-dark-text">
                                <option value="dark">Dark</option>
                                <option value="light">Light</option>
                            </select>
                        </div>
                    </div>
                    <div className="pt-6 border-t border-dark-border">
                         <h4 className="text-md font-medium text-dark-text mb-4">Notifications</h4>
                         <div className="space-y-4">
                            <ToggleSwitch id="admin-notificationEmail" label="Email Notifications" checked={formData.notificationEmail} onChange={(c) => handleToggleChange('notificationEmail', c)} />
                            <ToggleSwitch id="admin-notificationSms" label="SMS Notifications" checked={formData.notificationSms} onChange={(c) => handleToggleChange('notificationSms', c)} />
                            <ToggleSwitch id="admin-notificationPush" label="Push Notifications" checked={formData.notificationPush} onChange={(c) => handleToggleChange('notificationPush', c)} />
                         </div>
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" isLoading={isLoading} className="w-auto">
                            Save Preferences
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};