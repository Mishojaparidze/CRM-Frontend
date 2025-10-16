
import React, { useState, useEffect, useCallback } from 'react';
import { Note, User } from '../../types';
// FIX: Use relative path for mockApiService
import * as api from '../../services/mockApiService';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { Spinner } from '../ui/Spinner';
// FIX: Use relative path for useAuth
import { useAuth } from '../../hooks/useAuth';
import { GoogleGenAI } from '@google/genai';

interface CustomerNotesProps {
    user: User;
    onUpdate: (user: User) => void;
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const CustomerNotes: React.FC<CustomerNotesProps> = ({ user, onUpdate }) => {
    const { user: adminUser, hasPermission } = useAuth();
    const [notes, setNotes] = useState<Note[]>([]);
    const [newNoteContent, setNewNoteContent] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
    

    const fetchNotes = useCallback(async () => {
        if (!user.id) return;
        setIsLoading(true);
        setError('');
        try {
            const response = await api.getCustomerNotes(user.id);
            setNotes(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch notes.');
        } finally {
            setIsLoading(false);
        }
    }, [user.id]);

    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    const handleAddNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNoteContent.trim()) return;

        setIsSubmitting(true);
        setError('');
        setMessage('');
        try {
            await api.addCustomerNote(user.id, newNoteContent);
            setNewNoteContent('');
            setSuggestedTags([]);
            setMessage('Note added successfully.');
            fetchNotes();
        } catch (err: any) {
            setError(err.message || 'Failed to add note.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteNote = async (noteId: string) => {
        if (!window.confirm('Are you sure you want to delete this note?')) return;
        
        const originalNotes = [...notes];
        setNotes(notes.filter(n => n.id !== noteId));
        setError('');
        setMessage('');
        try {
            await api.deleteCustomerNote(noteId);
            setMessage('Note deleted successfully.');
        } catch (err: any) {
            setError(err.message || 'Failed to delete note.');
            setNotes(originalNotes);
        }
    };

    const handleSuggestTags = async () => {
        if (!newNoteContent.trim()) {
            setError('Please enter a note before suggesting tags.');
            return;
        }
        setIsSuggesting(true);
        setError('');
        setSuggestedTags([]);

        const prompt = `Analyze this customer support note for a casino CRM and suggest up to 3 relevant tags from the following list: [WithdrawalIssue, BonusRequest, KYC_Question, RG_Concern, TechnicalProblem, HighValue, Complaint, Feedback]. Respond only with a comma-separated list of the suggested tags. Note: "${newNoteContent}"`;

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            const tags = response.text.split(',').map(tag => tag.trim()).filter(Boolean);
            setSuggestedTags(tags);
        } catch (err: any) {
            setError('Failed to get suggestions from AI. ' + (err.message || ''));
        } finally {
            setIsSuggesting(false);
        }
    };

    const handleApplyTag = async (tag: string) => {
        if (!hasPermission('can_edit_user_details')) {
            setError('You do not have permission to edit user tags.');
            return;
        }

        const currentTags = user.tags || [];
        if (currentTags.includes(tag)) {
            setSuggestedTags(prev => prev.filter(t => t !== tag));
            return;
        }

        const newTags = [...currentTags, tag];
        try {
            const response = await api.updateUserProfile(user.id, { tags: newTags });
            onUpdate(response.data);
            setSuggestedTags(prev => prev.filter(t => t !== tag));
            setMessage(`Tag "${tag}" applied successfully.`);
        } catch (err: any) {
            setError(err.message || 'Failed to apply tag.');
        }
    };

    const canManageNotes = hasPermission('can_manage_notes');

    return (
        <Card>
            <CardHeader>
                <CardTitle>Customer Notes</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleAddNote} className="mb-6 space-y-4">
                    <Alert message={error} type="error" />
                    <Alert message={message} type="success" />
                    <div>
                        <label htmlFor="new-note" className="block text-sm font-medium text-dark-text-secondary">
                            Add a new note
                        </label>
                        <textarea
                            id="new-note"
                            rows={4}
                            className="mt-1 appearance-none block w-full px-3 py-2 border border-dark-border rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm bg-dark-card text-dark-text"
                            value={newNoteContent}
                            onChange={(e) => setNewNoteContent(e.target.value)}
                            placeholder={`Leave a note for user... (as ${adminUser?.username})`}
                            disabled={!canManageNotes}
                        />
                    </div>
                    {suggestedTags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm text-dark-text-secondary">Suggested:</span>
                            {suggestedTags.map(tag => (
                                <button key={tag} type="button" onClick={() => handleApplyTag(tag)} className="px-3 py-1 text-xs font-medium rounded-full bg-brand-secondary text-white hover:bg-brand-primary disabled:opacity-50" disabled={!hasPermission('can_edit_user_details')}>
                                    + {tag}
                                </button>
                            ))}
                        </div>
                    )}
                    <div className="flex justify-between items-center">
                        <Button type="button" variant="secondary" isLoading={isSuggesting} onClick={handleSuggestTags} className="w-auto" disabled={!canManageNotes}>
                            Suggest Tags
                        </Button>
                        <Button type="submit" isLoading={isSubmitting} className="w-auto" disabled={!canManageNotes}>
                            Add Note
                        </Button>
                    </div>
                </form>
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="flex justify-center py-8"><Spinner /></div>
                    ) : notes.length === 0 ? (
                        <p className="text-center text-dark-text-secondary py-8">No notes found for this user.</p>
                    ) : (
                        notes.map(note => (
                            <div key={note.id} className="p-4 bg-gray-800 rounded-lg relative">
                                <p className="text-dark-text whitespace-pre-wrap">{note.content}</p>
                                <p className="text-xs text-dark-text-secondary mt-2">
                                    By <span className="font-semibold">{note.adminUsername}</span> on {new Date(note.createdAt).toLocaleString()}
                                </p>
                                {canManageNotes && (
                                    <button
                                        onClick={() => handleDeleteNote(note.id)}
                                        className="absolute top-2 right-2 text-gray-500 hover:text-red-500 transition-colors"
                                        aria-label="Delete note"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
};