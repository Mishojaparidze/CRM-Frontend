
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Alert } from './ui/Alert';
import * as api from '../services/mockApiService';

const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = (pass: string) => {
      const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      return re.test(pass);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!validatePassword(newPassword)) {
        setError('Password must be at least 8 characters long, contain an uppercase letter, a lowercase letter, a number, and a special character.')
        return;
    }
    if (!token) {
        setError('No reset token provided. Please use the link from your email.');
        return;
    }

    setIsLoading(true);
    try {
      const response = await api.resetPassword(token, newPassword);
      setMessage(response.message);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <svg className="mx-auto h-12 w-auto text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0-3.313 0-4.97 1.002-6.002C14.004 4 15.657 4 18.963 4h.074c3.306 0 4.96 0 5.961 1.002C26 6.004 26 7.657 26 10.963v2.074c0 3.306 0 4.96-1.002 5.961C23.96 20 22.306 20 18.963 20h-.074c-3.306 0-4.96 0-5.961-1.002C12 17.996 12 16.343 12 13.037V11z M12 11h-1.037c-3.306 0-4.96 0-5.961 1.002C4 13.004 4 14.657 4 17.963v.074c0 3.306 0 4.96 1.002 5.961C6.004 25 7.657 25 10.963 25h2.074c3.306 0 4.96 0 5.961-1.002C20 22.996 20 21.343 20 18.037V17" transform="translate(-3 -3)" />
        </svg>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-dark-text">
          Set a new password
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-dark-card py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {message ? (
                <div className="space-y-6 text-center">
                    <Alert message={message} type="success" />
                    <Button onClick={() => navigate('/auth')}>
                        Return to Sign In
                    </Button>
                </div>
            ) : (
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <Alert message={error} type="error" />
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
                        <Button type="submit" isLoading={isLoading}>
                        Reset Password
                        </Button>
                    </div>
                </form>
            )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;