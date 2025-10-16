import React, { useState, useEffect, useCallback } from 'react';
import { IPWhitelistEntry } from '../../../types';
import * as api from '../../../services/mockApiService';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Alert } from '../../ui/Alert';
import { Spinner } from '../../ui/Spinner';

export const IPWhitelistManager: React.FC = () => {
    const [ips, setIps] = useState<IPWhitelistEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const [newIp, setNewIp] = useState('');
    const [newDesc, setNewDesc] = useState('');

    const fetchIPs = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await api.getWhitelistedIPs();
            setIps(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch IP whitelist.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchIPs();
    }, [fetchIPs]);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newIp.trim() || !newDesc.trim()) {
            setError('Both IP Address and Description are required.');
            return;
        }
        setIsSubmitting(true);
        setError('');
        setMessage('');
        try {
            await api.addWhitelistedIP(newIp, newDesc);
            setMessage('IP address added successfully.');
            setNewIp('');
            setNewDesc('');
            fetchIPs();
        } catch (err: any) {
            setError(err.message || 'Failed to add IP address.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleRemove = async (id: string) => {
        if (!window.confirm('Are you sure you want to remove this IP address from the whitelist?')) return;
        setError('');
        setMessage('');
        try {
            await api.removeWhitelistedIP(id);
            setMessage('IP address removed successfully.');
            fetchIPs();
        } catch (err: any) {
            setError(err.message || 'Failed to remove IP address.');
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Admin Panel IP Whitelist</CardTitle>
                <p className="text-sm text-dark-text-secondary mt-1">Only requests from these IP addresses will be allowed to access the admin panel.</p>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleAdd} className="p-4 bg-gray-800 rounded-lg mb-6 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div className="md:col-span-2">
                        <Input id="new-ip" label="IP Address" value={newIp} onChange={e => setNewIp(e.target.value)} required />
                    </div>
                    <div className="md:col-span-2">
                        <Input id="new-desc" label="Description" value={newDesc} onChange={e => setNewDesc(e.target.value)} required />
                    </div>
                    <Button type="submit" isLoading={isSubmitting} className="w-full">Add IP</Button>
                </form>

                <Alert message={error} type="error" />
                <Alert message={message} type="success" />

                {isLoading ? (
                    <div className="flex justify-center py-8"><Spinner /></div>
                ) : (
                    <ul className="divide-y divide-dark-border">
                        {ips.map(ip => (
                            <li key={ip.id} className="py-3 flex justify-between items-center">
                                <div>
                                    <p className="font-mono text-brand-secondary">{ip.ipAddress}</p>
                                    <p className="text-sm text-dark-text-secondary">{ip.description}</p>
                                </div>
                                <Button variant="danger" className="w-auto px-3 py-1" onClick={() => handleRemove(ip.id)}>Remove</Button>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
};