import React, { useState } from 'react';
import { TwoFactorAuthManager } from './TwoFactorAuthManager';
import { AdminNotificationSettings } from './AdminNotificationSettings';

type SettingsTab = 'security' | 'notifications';

const AdminSettingsDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<SettingsTab>('security');

    const renderContent = () => {
        switch (activeTab) {
            case 'security':
                return <TwoFactorAuthManager />;
            case 'notifications':
                return <AdminNotificationSettings />;
            default:
                return null;
        }
    };

    const TabButton: React.FC<{ tabId: SettingsTab, label: string }> = ({ tabId, label }) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`px-4 py-2 font-medium text-sm rounded-md ${activeTab === tabId ? 'bg-brand-primary text-white' : 'text-dark-text-secondary hover:bg-gray-800'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="space-y-6">
            <div>
                 <h2 className="text-2xl font-bold text-white mb-1">My Settings</h2>
                <p className="text-dark-text-secondary">Manage your personal admin account settings.</p>
            </div>
            <div className="flex items-center space-x-2 border-b border-dark-border pb-2">
                <TabButton tabId="security" label="Security" />
                <TabButton tabId="notifications" label="Notifications" />
            </div>
            <div>
                {renderContent()}
            </div>
        </div>
    );
};

export default AdminSettingsDashboard;