import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Alert } from './ui/Alert';

interface LoginFormProps {
    onForgotPassword: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      // Use a generic error message to prevent user enumeration
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <Alert message={error} type="error" />
      <Input
        id="email"
        label="Email address"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <div>
        <Input
            id="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
        />
        <div className="text-right mt-2">
            <button
                type="button"
                onClick={onForgotPassword}
                className="text-sm font-medium text-brand-secondary hover:text-brand-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-card focus:ring-brand-primary rounded-md"
            >
                Forgot Password?
            </button>
        </div>
      </div>
      <div>
        <Button type="submit" isLoading={isLoading}>
          Sign in
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;