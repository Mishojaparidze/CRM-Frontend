
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import * as api from '../services/mockApiService';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Alert } from './ui/Alert';

const ChangePassword = () => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const validatePassword = (pass: string) => {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return re.test(pass);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (!validatePassword(newPassword)) {
        setError('New password must be at least 8 characters long, contain an uppercase letter, a lowercase letter, a number, and a special character.')
        return;
    }
    if (!user) {
        setError('You must be logged in to change your password.');
        return;
    }

    setIsLoading(true);
    try {
      const response = await api.changePassword(user.id, currentPassword, newPassword);
      setMessage(response.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to change password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit}>
            <Alert message={error} type="error" />
            <Alert message={message} type="success" />
            <Input
                id="current-password"
                label="Current Password"
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <Input
                id="new-password"
                label="New Password"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
            />
            <Input
                id="confirm-new-password"
                label="Confirm New Password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <div>
                <Button type="submit" isLoading={isLoading} variant="secondary">
                    Update Password
                </Button>
            </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ChangePassword;