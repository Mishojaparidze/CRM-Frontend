
import React, { useState } from 'react';
import { User } from '../../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Alert } from '../../ui/Alert';

interface DataExportProps {
    users: User[];
}

export const DataExport: React.FC<DataExportProps> = ({ users }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleExport = () => {
        setIsLoading(true);
        setMessage('');

        // Simulate network delay for export generation
        setTimeout(() => {
            // In a real app, this would generate and download a file.
            // For this demo, we'll just show a success message.
            console.log("Simulating CSV export for", users.length, "users.");
            console.log(users);
            setMessage(`Successfully generated a simulated CSV export for ${users.length} users. Check the browser console.`);
            setIsLoading(false);
        }, 1500);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Data Export</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-dark-text-secondary mb-4">
                    Export a list of all current users to a CSV file.
                </p>
                {message && <Alert message={message} type="success" />}
                <Button 
                    onClick={handleExport}
                    isLoading={isLoading}
                    disabled={users.length === 0}
                >
                    Export Users to CSV
                </Button>
            </CardContent>
        </Card>
    );
};