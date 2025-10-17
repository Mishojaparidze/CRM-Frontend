import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface BulkActionsBarProps {
    selectedCount: number;
    onClearSelection: () => void;
    onBulkAction: (action: 'suspend' | 'activate' | 'add_tag', payload?: { tag?: string }) => void;
}

export const BulkActionsBar: React.FC<BulkActionsBarProps> = ({ selectedCount, onClearSelection, onBulkAction }) => {
    const [showTagInput, setShowTagInput] = useState(false);
    const [tag, setTag] = useState('');

    const handleAddTag = () => {
        if (tag.trim()) {
            onBulkAction('add_tag', { tag: tag.trim() });
            setTag('');
            setShowTagInput(false);
        }
    };

    return (
        <div className="bg-dark-card border border-dark-border rounded-lg p-4 mb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex-shrink-0">
                <span className="font-semibold text-dark-text">{selectedCount}</span>
                <span className="text-dark-text-secondary"> user{selectedCount > 1 ? 's' : ''} selected</span>
            </div>
            {showTagInput ? (
                 <div className="flex items-center gap-2">
                    <Input id="bulk-tag" label="Tag to add" value={tag} onChange={(e) => setTag(e.target.value)} placeholder="e.g. Follow-Up" />
                    <Button onClick={handleAddTag} className="w-auto">Apply Tag</Button>
                    <Button variant="secondary" onClick={() => setShowTagInput(false)} className="w-auto">Cancel</Button>
                </div>
            ) : (
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="secondary" onClick={() => onBulkAction('activate')} className="w-auto">Activate</Button>
                    <Button variant="secondary" onClick={() => onBulkAction('suspend')} className="w-auto">Suspend</Button>
                    <Button variant="secondary" onClick={() => setShowTagInput(true)} className="w-auto">Add Tag</Button>
                </div>
            )}
            <button onClick={onClearSelection} className="text-sm text-brand-secondary hover:underline">Clear selection</button>
        </div>
    );
};
