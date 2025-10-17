import React, { useState, useEffect } from 'react';
import { Promotion, PromotionType } from '../../../types';
import * as api from '../../../services/mockApiService';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { Alert } from '../../ui/Alert';

interface PromotionEditModalProps {
    promotionToEdit?: Promotion;
    onClose: () => void;
    onSave: () => void;
}

export const PromotionEditModal: React.FC<PromotionEditModalProps> = ({ promotionToEdit, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        type: 'Deposit Match' as PromotionType,
        startDate: '',
        endDate: '',
        bonusCode: '',
        minDeposit: '',
        // Status is derived, not set directly
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const isEditing = !!promotionToEdit;
    
    const toInputDate = (iso: string) => iso ? iso.split('T')[0] : '';

    useEffect(() => {
        if (isEditing) {
            setFormData({
                name: promotionToEdit.name,
                description: promotionToEdit.description,
                type: promotionToEdit.type,
                startDate: toInputDate(promotionToEdit.startDate),
                endDate: toInputDate(promotionToEdit.endDate),
                bonusCode: promotionToEdit.bonusCode || '',
                minDeposit: promotionToEdit.minDeposit?.toString() || '',
            });
        }
    }, [promotionToEdit, isEditing]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!formData.name || !formData.description || !formData.startDate || !formData.endDate) {
            setError('Name, Description, Start Date, and End Date are required.');
            return;
        }

        const now = new Date();
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        end.setHours(23, 59, 59, 999); // End of day

        let status: Promotion['status'] = 'Scheduled';
        if (now >= start && now <= end) {
            status = 'Active';
        } else if (now > end) {
            status = 'Expired';
        }

        const payload = {
            ...formData,
            status,
            startDate: start.toISOString(),
            endDate: end.toISOString(),
            bonusCode: formData.bonusCode || undefined,
            minDeposit: formData.minDeposit ? parseFloat(formData.minDeposit) : undefined,
        };
        
        setIsLoading(true);
        try {
            if (isEditing) {
                await api.updatePromotion(promotionToEdit.id, payload);
            } else {
                await api.createPromotion(payload);
            }
            onSave();
        } catch (err: any) {
            setError(err.message || 'Failed to save promotion.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-dark-card rounded-lg shadow-xl w-full max-w-2xl max-h-full overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <CardHeader className="flex justify-between items-center sticky top-0 bg-dark-card z-10">
                        <CardTitle>{isEditing ? 'Edit Promotion' : 'Create New Promotion'}</CardTitle>
                         <button type="button" onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert message={error} type="error" />
                        <Input id="name" name="name" label="Promotion Name" value={formData.name} onChange={handleChange} required />
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-dark-text-secondary">Description</label>
                            <textarea id="description" name="description" rows={3} value={formData.description} onChange={handleChange} className="mt-1 block w-full bg-dark-card border-dark-border rounded-md shadow-sm" required />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="type" className="block text-sm font-medium text-dark-text-secondary">Type</label>
                                <select id="type" name="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full bg-dark-card border-dark-border rounded-md shadow-sm py-2 px-3">
                                    <option>Deposit Match</option>
                                    <option>Free Spins Offer</option>
                                    <option>Cashback Offer</option>
                                </select>
                            </div>
                            <Input id="bonusCode" name="bonusCode" label="Bonus Code (Optional)" value={formData.bonusCode} onChange={handleChange} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <Input id="startDate" name="startDate" label="Start Date" type="date" value={formData.startDate} onChange={handleChange} required />
                             <Input id="endDate" name="endDate" label="End Date" type="date" value={formData.endDate} onChange={handleChange} required />
                             <Input id="minDeposit" name="minDeposit" label="Min. Deposit (Optional)" type="number" step="0.01" value={formData.minDeposit} onChange={handleChange} />
                        </div>
                    </CardContent>
                    <div className="bg-gray-800 px-6 py-4 flex justify-end gap-2 rounded-b-lg sticky bottom-0 z-10">
                        <Button type="button" variant="secondary" onClick={onClose} className="w-auto">Cancel</Button>
                        <Button type="submit" isLoading={isLoading} className="w-auto">Save Promotion</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
