import React, { useState, useEffect, useCallback } from 'react';
import { WorkflowRule } from '../../../types';
import * as api from '../../../services/mockApiService';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Spinner } from '../../ui/Spinner';
import { Alert } from '../../ui/Alert';
import { ToggleSwitch } from '../../ui/ToggleSwitch';

export const WorkflowManager: React.FC = () => {
    const [workflows, setWorkflows] = useState<WorkflowRule[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchWorkflows = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await api.getAllWorkflowRules();
            setWorkflows(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch workflows.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWorkflows();
    }, [fetchWorkflows]);

    const handleToggle = async (ruleId: string, isEnabled: boolean) => {
        const originalWorkflows = [...workflows];
        // Optimistic update
        setWorkflows(prev => prev.map(w => w.id === ruleId ? { ...w, isEnabled } : w));
        
        try {
            await api.updateWorkflowRule(ruleId, { isEnabled });
        } catch(err: any) {
            setError(err.message || 'Failed to update workflow status.');
            setWorkflows(originalWorkflows); // Revert on error
        }
    };

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
                {isLoading ? (
                    <div className="flex justify-center py-16"><Spinner /></div>
                ) : error ? (
                    <Alert message={error} type="error" />
                ) : workflows.length === 0 ? (
                    <p className="text-dark-text-secondary text-center py-16">
                        No workflows created yet.
                    </p>
                ) : (
                    <div className="space-y-4">
                        {workflows.map(workflow => (
                            <div key={workflow.id} className="bg-gray-800 p-4 rounded-lg flex items-center justify-between">
                                <div className="flex-1">
                                    <h4 className="font-semibold text-dark-text">{workflow.name}</h4>
                                    <p className="text-sm text-dark-text-secondary mt-1">{workflow.description}</p>
                                    <div className="flex items-center space-x-2 mt-2 text-xs font-mono">
                                        <span className="bg-blue-900 text-blue-300 px-2 py-1 rounded">IF: {workflow.trigger}</span>
                                        <span>&rarr;</span>
                                        <span className="bg-green-900 text-green-300 px-2 py-1 rounded">THEN: {workflow.action}</span>
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <ToggleSwitch 
                                        id={`workflow-${workflow.id}`}
                                        label={workflow.isEnabled ? 'Enabled' : 'Disabled'}
                                        checked={workflow.isEnabled}
                                        onChange={(checked) => handleToggle(workflow.id, checked)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};