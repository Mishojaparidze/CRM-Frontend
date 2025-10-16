import React, { useState, useEffect, useCallback } from 'react';
import { Integration } from '../../../types';
import * as api from '../../../services/mockApiService';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { Spinner } from '../../ui/Spinner';
import { Alert } from '../../ui/Alert';
import { ToggleSwitch } from '../../ui/ToggleSwitch';

export const IntegrationsManager: React.FC = () => {
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchIntegrations = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await api.getIntegrations();
            setIntegrations(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch integrations.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchIntegrations();
    }, [fetchIntegrations]);
    
    const handleToggle = async (id: Integration['id'], isConnected: boolean) => {
        // Optimistic update
        setIntegrations(prev => prev.map(i => i.id === id ? { ...i, isConnected } : i));

        try {
            await api.updateIntegration(id, isConnected);
        } catch (err: any) {
            setError(err.message || 'Failed to update integration status.');
            // Revert on failure
            setIntegrations(prev => prev.map(i => i.id === id ? { ...i, isConnected: !isConnected } : i));
        }
    };

    if (isLoading) {
        return <div className="flex justify-center py-16"><Spinner /></div>
    }

    return (
        <div>
            {error && <Alert message={error} type="error" />}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {integrations.map(integration => (
                    <Card key={integration.id}>
                        <CardContent className="flex items-center justify-between">
                            <div className="flex items-center">
                                <img src={integration.iconUrl} alt={`${integration.name} logo`} className="w-12 h-12 mr-4 bg-white p-1 rounded-md" />
                                <div>
                                    <h4 className="font-semibold text-white">{integration.name}</h4>
                                    <p className="text-sm text-dark-text-secondary">{integration.description}</p>
                                </div>
                            </div>
                            <ToggleSwitch
                                id={`integration-${integration.id}`}
                                label={integration.isConnected ? 'Connected' : 'Disconnected'}
                                checked={integration.isConnected}
                                onChange={(checked) => handleToggle(integration.id, checked)}
                            />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};