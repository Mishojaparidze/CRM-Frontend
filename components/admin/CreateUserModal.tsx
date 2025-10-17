import React, { useState } from 'react';
import * as api from '../../services/mockApiService';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';

interface CreateUserModalProps {
    onClose: () => void;
    onUserCreated: () => void;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({ onClose, onUserCreated }) => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!email.trim() || !username.trim() || !password.trim()) {
            setError('All fields are required.');
            return;
        }
        setIsLoading(true);
        try {
            await api.createUserByAdmin(email, username, password);
            onUserCreated();
        } catch (err: any) {
            setError(err.message || 'Failed to create user.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-dark-card rounded-lg shadow-xl w-full max-w-md">
                <form onSubmit={handleSubmit}>
                    <CardHeader className="flex justify-between items-center">
                        <CardTitle>Create New User</CardTitle>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert message={error} type="error" />
                        <Input id="create-email" label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                        <Input id="create-username" label="Username" type="text" value={username} onChange={e => setUsername(e.target.value)} required />
                        <Input id="create-password" label="Initial Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                    </CardContent>
                    <div className="bg-gray-800 px-6 py-4 flex justify-end gap-2 rounded-b-lg">
                        <Button type="button" variant="secondary" onClick={onClose} className="w-auto">Cancel</Button>
                        <Button type="submit" isLoading={isLoading} className="w-auto">Create User</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
