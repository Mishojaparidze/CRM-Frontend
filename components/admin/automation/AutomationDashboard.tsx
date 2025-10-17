import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { WorkflowManager } from './WorkflowManager';

const AutomationDashboard: React.FC = () => {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-white mb-1">Automation Hub</h2>
                <p className="text-dark-text-secondary">Create and manage automated workflows and triggers.</p>
            </div>
            <WorkflowManager />
            <Card>
                <CardHeader>
                    <CardTitle>Trigger Library</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-dark-text-secondary text-center py-10">
                        Trigger library component coming soon.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};

export default AutomationDashboard;