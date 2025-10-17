import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Alert } from './ui/Alert';

const RegisterForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const validatePassword = (pass: string) => {
      const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      return re.test(pass);
  }

  const validateUsername = (name: string) => {
    const re = /^[a-zA-Z0-9_]{3,50}$/;
    return re.test(name);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!validatePassword(password)) {
        setError('Password must be at least 8 characters long, contain an uppercase letter, a lowercase letter, a number, and a special character.')
        return;
    }
    if (!validateUsername(username)) {
        setError('Username must be 3-50 characters long and can only contain letters, numbers, and underscores.');
        return;
    }

    setIsLoading(true);
    try {
      await register(email, username, fullName, password);
    } catch (err: any) {
      setError(err.message || 'Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <Alert message={error} type="error" />
      <Input
        id="email-register"
        label="Email address"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
       <Input
        id="fullname-register"
        label="Full Name"
        type="text"
        required
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
      />
      <Input
        id="username-register"
        label="Username"
        type="text"
        required
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <Input
        id="password-register"
        label="Password"
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Input
        id="confirm-password-register"
        label="Confirm Password"
        type="password"
        required
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <div>
        <Button type="submit" isLoading={isLoading}>
          Create account
        </Button>
      </div>
    </form>
  );
};

export default RegisterForm;