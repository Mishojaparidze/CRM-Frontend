import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import * as api from '../../../services/mockApiService';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Alert } from '../../ui/Alert';
import { Input } from '../../ui/Input';

export const TwoFactorAuthManager: React.FC = () => {
    const { user, updateUser } = useAuth();
    const [isEnabling, setIsEnabling] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    if (!user) return null;

    const handleToggle2FA = async (enable: boolean) => {
        if (!enable) {
            if (!window.confirm("Are you sure you want to disable 2FA? This will reduce your account's security.")) return;
            setIsLoading(true);
        } else {
            setIsEnabling(true);
            return; // Show setup screen, don't call API yet
        }
        
        setError('');
        setMessage('');
        try {
            const response = await api.toggle2FA(user.id, enable);
            updateUser({ has2FA: enable });
            setMessage(response.message);
        } catch (err: any) {
            setError(err.message || 'Failed to update 2FA status.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleVerifyAndEnable = async (e: React.FormEvent) => {
        e.preventDefault();
        // Mock verification
        if (verificationCode !== '123456') {
            setError('Invalid verification code. Please try again.');
            return;
        }
        
        setIsLoading(true);
        setError('');
        setMessage('');
        try {
            const response = await api.toggle2FA(user.id, true);
            updateUser({ has2FA: true });
            setMessage(response.message);
            setIsEnabling(false);
            setVerificationCode('');
        } catch (err: any) {
            setError(err.message || 'Failed to enable 2FA.');
        } finally {
            setIsLoading(false);
        }
    }

    if (isEnabling) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Set Up Two-Factor Authentication</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-dark-text-secondary text-sm">Scan the QR code with your authenticator app (e.g., Google Authenticator) and enter the 6-digit code to complete setup.</p>
                    <div className="flex justify-center p-4 bg-white rounded-lg">
                        {/* Placeholder QR Code */}
                        <svg className="w-40 h-40" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0 0h30v30H0z M70 0h30v30H70z M0 70h30v30H0z M10 10h10v10H10z M80 10h10v10H80z M10 80h10v10H10z M40 0h10v10H40z M60 0v10h-10V0z M0 40h10v10H0z M30 40v10H20V40z M40 20h30v10H40z M20 30h10v10H20z M70 30v10H40V30z M90 40h10v10H90z M70 50h10v20H70z M30 60h10v10H30z M0 60h10v10H0z M50 60h20v10H50z M40 70h10v20H40z M60 70h10v10H60z M70 80h30v10H70z M60 90h10v10H60z M20 70h10v30H20z" fill="#000000"/>
                        </svg>
                    </div>
                     <form onSubmit={handleVerifyAndEnable} className="space-y-4 pt-4 border-t border-dark-border">
                        <Alert message={error} type="error"/>
                        <Input
                            id="2fa-code"
                            label="Verification Code"
                            type="text"
                            required
                            value={verificationCode}
                            onChange={e => setVerificationCode(e.target.value)}
                            placeholder="123456"
                        />
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="secondary" onClick={() => setIsEnabling(false)} className="w-auto">Cancel</Button>
                            <Button type="submit" isLoading={isLoading} className="w-auto">Verify & Enable</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Two-Factor Authentication (2FA)</CardTitle>
            </CardHeader>
            <CardContent>
                <Alert message={error} type="error"/>
                <Alert message={message} type="success"/>
                <div className="flex items-center justify-between">
                    <div>
                        <p className={`font-semibold ${user.has2FA ? 'text-green-400' : 'text-red-400'}`}>
                            2FA is currently {user.has2FA ? 'Enabled' : 'Disabled'}
                        </p>
                        <p className="text-sm text-dark-text-secondary mt-1">
                            {user.has2FA ? 'Your account is protected with an additional layer of security.' : 'Enable 2FA to better protect your account.'}
                        </p>
                    </div>
                    {user.has2FA ? (
                        <Button variant="danger" isLoading={isLoading} onClick={() => handleToggle2FA(false)} className="w-auto">
                            Disable 2FA
                        </Button>
                    ) : (
                        <Button isLoading={isLoading} onClick={() => handleToggle2FA(true)} className="w-auto">
                            Enable 2FA
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};