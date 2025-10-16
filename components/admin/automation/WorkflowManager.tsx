
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Button';

export const WorkflowManager: React.FC = () => {
    return (
        <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="mb-4 md:mb-0">
                    <CardTitle>Workflow Management</CardTitle>
                    <p className="mt-1 text-sm text-dark-text-secondary">Automate actions based on user behavior.</p>
                </div>
                <Button onClick={() => alert('Workflow editor coming soon!')} className="w-full md:w-auto">
                    Create New Workflow
                </Button>
            </CardHeader>
            <CardContent>
                <p className="text-dark-text-secondary text-center py-16">
                    No workflows created yet.
                </p>
            </CardContent>
        </Card>
    );
};
