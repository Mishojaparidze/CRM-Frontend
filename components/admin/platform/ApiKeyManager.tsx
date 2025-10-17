import React, { useState, useEffect, useCallback } from 'react';
import { ApiKey } from '../../../types';
import * as api from '../../../services/mockApiService';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Alert } from '../../ui/Alert';
import { Spinner } from '../../ui/Spinner';

const NewApiKeyModal: React.FC<{ apiKey: ApiKey; onClose: () => void; }> = ({ apiKey, onClose }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(apiKey.key);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="newApiKeyTitle">
            <div className="bg-dark-card rounded-lg shadow-xl w-full max-w-lg">
                <CardHeader>
                    <CardTitle id="newApiKeyTitle">API Key Generated Successfully</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert message="Please copy your new API key now. You won’t be able to see it again!" type="error" />
                    <p className="text-sm text-dark-text-secondary">
                        This key provides access to your account. Keep it secret and store it securely.
                    </p>
                    <div className="bg-gray-900 p-3 rounded-md flex items-center justify-between">
                        <code className="text-green-400 font-mono break-all">{apiKey.key}</code>
                        <Button onClick={handleCopy} className="w-auto ml-4">
                            {copied ? 'Copied!' : 'Copy'}
                        </Button>
                    </div>
                </CardContent>
                <div className="bg-gray-800 px-6 py-4 flex justify-end rounded-b-lg">
                    <Button onClick={onClose} className="w-auto">Done</Button>
                </div>
            </div>
        </div>
    );
};

export const ApiKeyManager: React.FC = () => {
    const [keys, setKeys] = useState<ApiKey[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [newKeyDescription, setNewKeyDescription] = useState('');
    const [newlyGeneratedKey, setNewlyGeneratedKey] = useState<ApiKey | null>(null);

    const fetchKeys = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await api.getApiKeys();
            setKeys(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch API keys.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchKeys();
    }, [fetchKeys]);

    const handleCreateKey = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newKeyDescription.trim()) {
            setError('Please provide a description for the new API key.');
            return;
        }
        setIsCreating(true);
        setError('');
        setMessage('');
        try {
            const response = await api.createApiKey(newKeyDescription);
            setNewlyGeneratedKey(response.data);
            setNewKeyDescription('');
            fetchKeys(); // Refresh the list in the background
        } catch (err: any) {
            setError(err.message || 'Failed to create API key.');
        } finally {
            setIsCreating(false);
        }
    };
    
    const handleRevokeKey = async (keyId: string) => {
        if (!window.confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) return;
        
        setError('');
        setMessage('');
        try {
            const response = await api.revokeApiKey(keyId);
            setMessage(response.message);
            fetchKeys();
        } catch (err: any) {
            setError(err.message || 'Failed to revoke API key.');
        }
    };
    
    const maskKey = (key: string) => `${key.slice(0, 11)}...${key.slice(-4)}`;

    return (
        <>
            {newlyGeneratedKey && <NewApiKeyModal apiKey={newlyGeneratedKey} onClose={() => setNewlyGeneratedKey(null)} />}
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Create New API Key</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateKey} className="flex items-end gap-4">
                            <div className="flex-grow">
                                <Input 
                                    id="key-description"
                                    label="Description"
                                    placeholder="e.g., Data Warehouse Sync"
                                    value={newKeyDescription}
                                    onChange={(e) => setNewKeyDescription(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" isLoading={isCreating} className="w-auto">
                                Generate Key
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Active API Keys</CardTitle>
                        <p className="text-sm text-dark-text-secondary mt-1">Manage API keys for external services and integrations.</p>
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
                                            <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase">Description</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase">Key</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase">Created</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase">Last Used</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-dark-text-secondary uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-dark-card divide-y divide-dark-border">
                                        {keys.length === 0 ? (
                                            <tr><td colSpan={5} className="text-center py-10 text-dark-text-secondary">No API keys have been created yet.</td></tr>
                                        ) : keys.map(key => (
                                            <tr key={key.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark-text">{key.description}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text-secondary font-mono">{maskKey(key.key)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text-secondary">{new Date(key.createdAt).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text-secondary">
                                                    {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : 'Never'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <Button variant="danger" className="w-auto" onClick={() => handleRevokeKey(key.id)}>Revoke</Button>
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