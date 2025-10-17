import React, { useState } from 'react';
import { User } from '../../types';
import * as api from '../../services/mockApiService';
import { useAuth } from '../../hooks/useAuth';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';

interface UserTagsManagerProps {
    user: User;
    onUpdate: (user: User) => void;
}

export const UserTagsManager: React.FC<UserTagsManagerProps> = ({ user, onUpdate }) => {
    const { hasPermission } = useAuth();
    const [newTag, setNewTag] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleUpdateTags = async (newTags: string[]) => {
        setIsLoading(true);
        setError('');
        setMessage('');
        try {
            const response = await api.updateUserProfile(user.id, { tags: newTags });
            onUpdate(response.data);
            setMessage('Tags updated successfully.');
        } catch (err: any) {
            setError(err.message || 'Failed to update tags.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddTag = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTag.trim()) return;
        if (user.tags.includes(newTag.trim())) {
            setError('Tag already exists.');
            return;
        }
        const updatedTags = [...user.tags, newTag.trim()];
        handleUpdateTags(updatedTags);
        setNewTag('');
    };

    const handleRemoveTag = (tagToRemove: string) => {
        const updatedTags = user.tags.filter(tag => tag !== tagToRemove);
        handleUpdateTags(updatedTags);
    };

    if (!hasPermission('can_edit_user_details')) {
        return null; // Don't render if user doesn't have permission
    }

    return (
        <div className="mt-6 pt-6 border-t border-dark-border">
            <h4 className="text-md font-medium text-dark-text mb-4">Manage Tags</h4>
            <Alert message={error} type="error" />
            <Alert message={message} type="success" />
            <div className="flex flex-wrap gap-2 items-center mb-4">
                {user.tags.length > 0 ? user.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-brand-primary text-white">
                        {tag}
                        <button onClick={() => handleRemoveTag(tag)} className="ml-2 -mr-1 flex-shrink-0 h-4 w-4 rounded-full inline-flex items-center justify-center text-indigo-200 hover:bg-brand-secondary hover:text-white focus:outline-none focus:bg-brand-secondary focus:text-white">
                            <span className="sr-only">Remove {tag}</span>
                            <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                                <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                            </svg>
                        </button>
                    </span>
                )) : <p className="text-sm text-dark-text-secondary">No tags assigned.</p>}
            </div>
            <form onSubmit={handleAddTag} className="flex items-end gap-2">
                <div className="flex-grow">
                    <Input
                        id="new-tag"
                        label="Add new tag"
                        type="text"
                        placeholder="e.g., VIP"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                    />
                </div>
                <Button type="submit" isLoading={isLoading} className="w-auto self-end">Add Tag</Button>
            </form>
        </div>
    );
};