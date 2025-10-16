import React, { useState } from 'react';
import { User } from '../../../types';
import * as api from '../../../services/mockApiService';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Alert } from '../../ui/Alert';

interface DataPrivacyManagerProps {
    user: User;
    onAnonymize: () => void;
}

export const DataPrivacyManager: React.FC<DataPrivacyManagerProps> = ({ user, onAnonymize }) => {
    const [isLoadingExport, setIsLoadingExport] = useState(false);
    const [isLoadingAnonymize, setIsLoadingAnonymize] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleExport = async () => {
        if (!window.confirm(`Are you sure you want to export all data for user ${user.username}? This will generate a JSON file.`)) return;
        
        setIsLoadingExport(true);
        setError('');
        setMessage('');
        try {
            const response = await api.exportUserData(user.id);
            // In a real app, you would trigger a download here
            console.log("--- USER DATA EXPORT ---");
            console.log(response.data.userData);
            setMessage(`User data exported successfully. See browser console for the JSON data.`);
        } catch (err: any) {
            setError(err.message || 'Failed to export user data.');
        } finally {
            setIsLoadingExport(false);
        }
    };
    
    const handleAnonymize = async () => {
        if (!window.confirm(`ARE YOU SURE you want to permanently anonymize user ${user.username}? This action cannot be undone.`)) return;

        setIsLoadingAnonymize(true);
        setError('');
        setMessage('');
        try {
            const response = await api.anonymizeUser(user.id);
            setMessage(response.message);
            onAnonymize();
        } catch (err: any) {
            setError(err.message || 'Failed to anonymize user.');
        } finally {
            setIsLoadingAnonymize(false);
        }
    };
    
    const isAnonymized = user.status === 'anonymized';

    return (
        <Card>
            <CardHeader>
                <CardTitle>Data Privacy Tools (GDPR)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <Alert message={error} type="error" />
                <Alert message={message} type="success" />
                
                {isAnonymized && (
                    <Alert message="This user has been anonymized. No further privacy actions can be taken." type="success" />
                )}

                <div className="p-4 bg-gray-800 rounded-lg">
                    <h4 className="font-semibold text-dark-text">Data Portability Request</h4>
                    <p className="text-sm text-dark-text-secondary mt-1 mb-4">Export all of this user's data into a machine-readable JSON format.</p>
                    <Button onClick={handleExport} isLoading={isLoadingExport} disabled={isAnonymized} className="w-auto">
                        Export User Data
                    </Button>
                </div>
                
                <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg">
                    <h4 className="font-semibold text-red-300">Right to be Forgotten Request</h4>
                    <p className="text-sm text-dark-text-secondary mt-1 mb-4">Anonymize this user's personally identifiable information (PII). This action is irreversible.</p>
                    <Button variant="danger" onClick={handleAnonymize} isLoading={isLoadingAnonymize} disabled={isAnonymized} className="w-auto">
                        Anonymize User
                    </Button>
                </div>

            </CardContent>
        </Card>
    );
};