
import React, { useState, useEffect } from 'react';
import { EmailTemplate } from '../../types';
import * as api from '../../services/mockApiService';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';

interface EmailTemplateEditModalProps {
    templateToEdit?: EmailTemplate;
    onClose: () => void;
    onSave: () => void;
}

export const EmailTemplateEditModal: React.FC<EmailTemplateEditModalProps> = ({ templateToEdit, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const isEditing = !!templateToEdit;

    useEffect(() => {
        if (isEditing) {
            setName(templateToEdit.name);
            setSubject(templateToEdit.subject);
            setBody(templateToEdit.body);
        }
    }, [templateToEdit, isEditing]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!name.trim() || !subject.trim() || !body.trim()) {
            setError('All fields are required.');
            return;
        }

        setIsLoading(true);
        const templateData = { name, subject, body };
        try {
            if (isEditing) {
                await api.updateEmailTemplate(templateToEdit.id, templateData);
            } else {
                await api.createEmailTemplate(templateData);
            }
            onSave();
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4" aria-modal="true" role="dialog">
            <div className="bg-dark-card rounded-lg shadow-xl w-full max-w-3xl max-h-full overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <CardHeader className="flex justify-between items-center sticky top-0 bg-dark-card z-10">
                        <CardTitle>{isEditing ? 'Edit Email Template' : 'Create New Template'}</CardTitle>
                         <button type="button" onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </CardHeader>
                    <CardContent className="space-y-6">
                         {error && <Alert message={error} type="error" />}
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                id="template-name"
                                label="Template Name (for internal use)"
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <Input
                                id="template-subject"
                                label="Email Subject"
                                type="text"
                                required
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                            />
                         </div>
                         <div>
                            <label htmlFor="template-body" className="block text-sm font-medium text-dark-text-secondary">Email Body</label>
                            <textarea
                                id="template-body"
                                rows={15}
                                className="mt-1 font-mono appearance-none block w-full px-3 py-2 border border-dark-border rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm bg-gray-900 text-dark-text"
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                            />
                             <p className="mt-2 text-xs text-dark-text-secondary">
                                You can use placeholders like <code className="bg-gray-700 p-1 rounded-sm">{`{{username}}`}</code>, <code className="bg-gray-700 p-1 rounded-sm">{`{{reset_link}}`}</code>, etc.
                            </p>
                         </div>
                    </CardContent>
                    <div className="bg-gray-800 px-6 py-4 flex justify-end space-x-2 rounded-b-lg sticky bottom-0 z-10">
                        <Button type="button" variant="secondary" onClick={onClose} className="w-auto">Cancel</Button>
                        <Button type="submit" isLoading={isLoading} className="w-auto">Save Template</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};