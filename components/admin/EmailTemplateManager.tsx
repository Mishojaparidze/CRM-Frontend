
import React, { useState, useEffect, useCallback } from 'react';
import { EmailTemplate } from '../../types';
import * as api from '../../services/mockApiService';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { Alert } from '../ui/Alert';
import { EmailTemplateEditModal } from './EmailTemplateEditModal';

export const EmailTemplateManager: React.FC = () => {
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | undefined>(undefined);

    const fetchTemplates = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await api.getEmailTemplates();
            setTemplates(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch email templates.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);
    
    const handleCreate = () => {
        setSelectedTemplate(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (template: EmailTemplate) => {
        setSelectedTemplate(template);
        setIsModalOpen(true);
    };

    const handleDelete = async (templateId: string) => {
        if (!window.confirm('Are you sure you want to delete this template?')) return;

        setError('');
        setMessage('');
        try {
            const response = await api.deleteEmailTemplate(templateId);
            setMessage(response.message);
            fetchTemplates();
        } catch (err: any) {
            setError(err.message || 'Failed to delete template.');
        }
    };

    const onModalSave = () => {
        setIsModalOpen(false);
        setMessage('Template saved successfully.');
        fetchTemplates();
    };

    return (
        <>
            {isModalOpen && (
                <EmailTemplateEditModal 
                    onClose={() => setIsModalOpen(false)}
                    onSave={onModalSave}
                    templateToEdit={selectedTemplate}
                />
            )}
            <Card>
                <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="mb-4 md:mb-0">
                        <CardTitle>Email Template Library</CardTitle>
                        <p className="mt-1 text-sm text-dark-text-secondary">Manage reusable email templates.</p>
                    </div>
                    <Button onClick={handleCreate} className="w-full md:w-auto">
                        Create New Template
                    </Button>
                </CardHeader>
                <CardContent>
                    <Alert message={error} type="error" />
                    <Alert message={message} type="success" />
                    {isLoading ? (
                        <div className="flex justify-center py-16"><Spinner /></div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-dark-border">
                                <thead className="bg-gray-800">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Template Name</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Subject</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Last Updated</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-dark-card divide-y divide-dark-border">
                                    {templates.map(template => (
                                        <tr key={template.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark-text">{template.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text-secondary max-w-md truncate">{template.subject}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text-secondary">{new Date(template.updatedAt).toLocaleString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                                <button onClick={() => handleEdit(template)} className="text-brand-secondary hover:text-brand-primary">Edit</button>
                                                <button onClick={() => handleDelete(template.id)} className="text-red-500 hover:text-red-400">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </>
    );
};