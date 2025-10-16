import React, { useState } from 'react';
import { IPWhitelistManager } from './IPWhitelistManager';
import { ABTestingManager } from './ABTestingManager';
import { useAuth } from '../../../hooks/useAuth';
import { IntegrationsManager } from './IntegrationsManager';
import { ApiKeyManager } from './ApiKeyManager';

type PlatformTab = 'ip_whitelist' | 'ab_testing' | 'integrations' | 'api_keys';

const PlatformSettingsDashboard: React.FC = () => {
    const { hasPermission } = useAuth();
    const [activeTab, setActiveTab] = useState<PlatformTab>('ip_whitelist');

    const renderContent = () => {
        switch (activeTab) {
            case 'ip_whitelist':
                return <IPWhitelistManager />;
            case 'ab_testing':
                return hasPermission('can_manage_ab_tests') ? <ABTestingManager /> : null;
            case 'integrations':
                return <IntegrationsManager />;
            case 'api_keys':
                return hasPermission('can_manage_api_keys') ? <ApiKeyManager /> : null;
            default:
                return null;
        }
    };

    const TabButton: React.FC<{ tabId: PlatformTab, label: string }> = ({ tabId, label }) => (
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
                 <h2 className="text-2xl font-bold text-white mb-1">Platform Management</h2>
                <p className="text-dark-text-secondary">Manage global settings for the entire platform.</p>
            </div>
            <div className="flex items-center space-x-2 border-b border-dark-border pb-2 overflow-x-auto">
                <TabButton tabId="ip_whitelist" label="IP Whitelist" />
                {hasPermission('can_manage_api_keys') && <TabButton tabId="api_keys" label="API Keys" />}
                {hasPermission('can_manage_ab_tests') && <TabButton tabId="ab_testing" label="A/B Testing" />}
                <TabButton tabId="integrations" label="Integrations" />
            </div>
            <div>
                {renderContent()}
            </div>
        </div>
    );
};

export default PlatformSettingsDashboard;