
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Alert } from './ui/Alert';
// FIX: Use relative path for mockApiService
import * as api from '../services/mockApiService';

interface ForgotPasswordModalProps {
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const validateEmail = (email: string) => {
    // Simple regex for email validation
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.requestPasswordReset(email);
      setMessage(response.message);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 transition-opacity duration-300 ease-in-out" aria-modal="true" role="dialog">
      <div className="bg-dark-card rounded-lg shadow-xl w-full max-w-md m-4 transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-fade-in-scale">
        <form onSubmit={handleSubmit}>
          <CardHeader className="flex justify-between items-center">
            <CardTitle>Reset Your Password</CardTitle>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && <Alert message={error} type="error" />}
            {message && <Alert message={message} type="success" />}
            
            {!message && (
                <>
                    <p className="text-sm text-dark-text-secondary">
                        Enter your email address and we will send you a link to reset your password. The link will be printed in the browser console for this demo.
                    </p>
                    <Input
                        id="forgot-email"
                        label="Email address"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </>
            )}

          </CardContent>
          <div className="bg-gray-800 px-6 py-4 flex justify-end space-x-2 rounded-b-lg">
            {!message ? (
                <Button type="submit" isLoading={isLoading} className="w-auto">
                    Send Reset Link
                </Button>
            ) : (
                <Button type="button" variant="secondary" onClick={onClose} className="w-auto">
                    Close
                </Button>
            )}
          </div>
        </form>
         <style>{`
          @keyframes fade-in-scale {
            0% { transform: scale(0.95); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
          .animate-fade-in-scale {
            animation: fade-in-scale 0.2s forwards;
          }
        `}</style>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;