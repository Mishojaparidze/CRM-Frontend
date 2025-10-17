import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Alert } from './ui/Alert';
import * as api from '../services/mockApiService';
import { User, UserPreferences } from '../types';
import { UserTagsManager } from './admin/UserTagsManager';

interface UserProfileProps {
    user?: User | null;
    isAdminView?: boolean;
    onUpdate?: (user: User) => void;
}

interface InfoRowProps {
  label: string;
  value: React.ReactNode;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => {
    return (
        <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4">
          <dt className="text-sm font-medium text-dark-text-secondary">{label}</dt>
          <dd className="mt-1 text-sm text-dark-text sm:mt-0 sm:col-span-2">{value}</dd>
        </div>
    );
}


const UserProfile: React.FC<UserProfileProps> = ({ user: initialUser, isAdminView = false, onUpdate }) => {
  const { user: authUser, updateUser } = useAuth();
  const user = isAdminView ? initialUser : authUser;

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    username: user?.username || '',
    preferences: user?.preferences || {
        language: 'en',
        timezone: 'UTC',
        notificationEmail: true,
        notificationSms: false,
        notificationPush: true,
        theme: 'dark'
    },
    ltv: user?.ltv || 0,
    ggr: user?.ggr || 0,
    avgBetSize: user?.avgBetSize || 0,
    customFields: user?.customFields || {}
  });

  useEffect(() => {
    if (user && !isEditing) {
      setFormData({
          username: user.username,
          preferences: user.preferences,
          ltv: user.ltv,
          ggr: user.ggr,
          avgBetSize: user.avgBetSize,
          customFields: user.customFields || {}
      });
    }
  }, [user, isEditing]);


  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const updatedData = await api.updateUserProfile(user.id, formData);
      if (isAdminView && onUpdate) {
        onUpdate(updatedData.data);
      } else if (!isAdminView) {
        updateUser(updatedData.data as Partial<User>);
      }
      setMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'username') {
        setFormData(prev => ({...prev, username: value}));
    } else if (['ltv', 'ggr', 'avgBetSize'].includes(name)) {
        setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
        setFormData(prev => ({
            ...prev,
            preferences: { ...prev.preferences, [name]: value }
        }));
    }
  };

  const handleCustomFieldChange = (key: string, value: string | number) => {
      setFormData(prev => ({
          ...prev,
          customFields: { ...prev.customFields, [key]: value }
      }));
  };

  const handleToggleChange = (name: keyof UserPreferences, checked: boolean) => {
    setFormData(prev => ({
        ...prev,
        preferences: { ...prev.preferences, [name]: checked }
    }));
  };

  if (!user) {
    return <Card><CardContent>User not found.</CardContent></Card>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Profile</CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <form className="space-y-6" onSubmit={handleUpdateProfile}>
            <Alert message={message} type="success" />
            <Alert message={error} type="error" />
            
            <div>
              <Input
                id="username-update"
                label="Username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleInputChange}
              />
            </div>
            
            {isAdminView && (
              <div className="pt-4 border-t border-dark-border">
                  <h4 className="text-md font-medium text-dark-text mb-4">Player Financials</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input id="ltv" name="ltv" label="Lifetime Value ($)" type="number" step="0.01" value={formData.ltv} onChange={handleInputChange} />
                      <Input id="ggr" name="ggr" label="Gross Gaming Revenue ($)" type="number" step="0.01" value={formData.ggr} onChange={handleInputChange} />
                      <Input id="avgBetSize" name="avgBetSize" label="Avg. Bet Size ($)" type="number" step="0.01" value={formData.avgBetSize} onChange={handleInputChange} />
                  </div>
              </div>
            )}
      
            {isAdminView && formData.customFields && Object.keys(formData.customFields).length > 0 && (
               <div className="pt-4 border-t border-dark-border">
                  <h4 className="text-md font-medium text-dark-text mb-4">Custom Fields</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(formData.customFields).map(([key, value]) => (
                          <Input 
                              key={key} 
                              id={`custom-${key}`} 
                              name={key} 
                              label={key} 
                              type={typeof value === 'number' ? 'number' : 'text'}
                              value={value} 
                              onChange={(e) => handleCustomFieldChange(key, e.target.value)}
                          />
                      ))}
                  </div>
              </div>
            )}
      
            <div className="pt-4 border-t border-dark-border">
              <h4 className="text-md font-medium text-dark-text mb-4">Preferences</h4>
              <div className="space-y-4">
                  <div>
                      <label htmlFor="language" className="block text-sm font-medium text-dark-text-secondary">Language</label>
                      <select id="language" name="language" value={formData.preferences.language} onChange={handleInputChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-dark-border focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm rounded-md bg-dark-card text-dark-text">
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                      </select>
                  </div>
                  <div>
                      <label htmlFor="theme" className="block text-sm font-medium text-dark-text-secondary">Theme</label>
                      <select id="theme" name="theme" value={formData.preferences.theme} onChange={handleInputChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-dark-border focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm rounded-md bg-dark-card text-dark-text">
                        <option value="dark">Dark</option>
                        <option value="light">Light</option>
                      </select>
                  </div>
                  {/* The ToggleSwitch was not used here, so it was removed from imports */}
              </div>
            </div>
      
            <div className="flex space-x-2 pt-4">
              <Button type="submit" isLoading={isLoading}>Save Changes</Button>
              <Button type="button" variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
            </div>
          </form>
        ) : (
          <>
            <dl>
              <InfoRow label="User ID" value={<span className="font-mono text-xs">{user.id}</span>} />
              <InfoRow label="Email" value={user.email} />
              <InfoRow label="Username" value={user.username} />
              <InfoRow label="Status" value={<span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'active' ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'}`}>{user.status}</span>} />
              <InfoRow label="KYC Status" value={<span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.kycStatus === 'verified' ? 'bg-blue-800 text-blue-200' : 'bg-yellow-800 text-yellow-200'}`}>{user.kycStatus}</span>} />
              <InfoRow label="Joined" value={new Date(user.createdAt).toLocaleDateString()} />
              <InfoRow label="Last Login" value={new Date(user.lastLoginAt).toLocaleString()} />
            </dl>
    
            <div className="mt-6 pt-6 border-t border-dark-border">
              <h4 className="text-md font-medium text-dark-text mb-2">Financials</h4>
              <dl>
                <InfoRow label="Lifetime Value" value={`$${user.ltv.toFixed(2)}`} />
                <InfoRow label="Gross Gaming Revenue" value={`$${user.ggr.toFixed(2)}`} />
                <InfoRow label="Avg. Bet Size" value={`$${user.avgBetSize.toFixed(2)}`} />
              </dl>
            </div>
    
            <div className="mt-6 pt-6 border-t border-dark-border">
              <h4 className="text-md font-medium text-dark-text mb-2">Preferences</h4>
              <dl>
                <InfoRow label="Language" value={user.preferences.language.toUpperCase()} />
                <InfoRow label="Theme" value={user.preferences.theme.charAt(0).toUpperCase() + user.preferences.theme.slice(1)} />
                <InfoRow label="Email Notifications" value={user.preferences.notificationEmail ? 'Enabled' : 'Disabled'} />
                <InfoRow label="SMS Notifications" value={user.preferences.notificationSms ? 'Enabled' : 'Disabled'} />
                <InfoRow label="Push Notifications" value={user.preferences.notificationPush ? 'Enabled' : 'Disabled'} />
              </dl>
            </div>
    
            {isAdminView && user.customFields && Object.keys(user.customFields).length > 0 && (
                 <div className="mt-6 pt-6 border-t border-dark-border">
                    <h4 className="text-md font-medium text-dark-text mb-2">Custom Fields</h4>
                    <dl>
                        {Object.entries(user.customFields).map(([key, value]) => (
                            <InfoRow key={key} label={key} value={value as React.ReactNode} />
                        ))}
                    </dl>
                </div>
            )}
    
            {isAdminView && onUpdate && (
              <UserTagsManager user={user} onUpdate={onUpdate} />
            )}
    
            <div className="mt-6 pt-6 border-t border-dark-border">
                <Button variant="secondary" onClick={() => setIsEditing(true)}>Edit Profile</Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default UserProfile;