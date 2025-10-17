
import React, { useState, useEffect, useCallback } from 'react';
import { Wallet } from '../types';
import * as api from '../services/mockApiService';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Alert } from './ui/Alert';
import { Spinner } from './ui/Spinner';

interface WalletManagerProps {
    userId: string;
    isAdminView?: boolean;
}

const WalletManager: React.FC<WalletManagerProps> = ({ userId, isAdminView = false }) => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [newCurrency, setNewCurrency] = useState<Wallet['currency']>('BTC');
  const [newAddress, setNewAddress] = useState('');

  const fetchWallets = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const response = await api.getUserWallets(userId);
      setWallets(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch wallets.');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  const handleAddWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !newCurrency || !newAddress) return;
    
    setIsSubmitting(true);
    setError('');
    setMessage('');
    
    try {
      await api.addWallet(userId, newCurrency, newAddress);
      setMessage('Wallet added successfully!');
      setNewCurrency('BTC');
      setNewAddress('');
      fetchWallets(); // Refetch wallets
    } catch (err: any) {
      setError(err.message || 'Failed to add wallet.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveWallet = async (walletId: string) => {
    if (!userId) return;
    
    const originalWallets = [...wallets];
    setWallets(wallets.filter(w => w.id !== walletId));
    setError('');
    setMessage('');
    
    try {
      await api.removeWallet(userId, walletId);
      setMessage('Wallet removed successfully.');
    } catch (err: any) {
      setError(err.message || 'Failed to remove wallet.');
      setWallets(originalWallets);
    }
  };

  const CurrencyIcon = ({ currency }: { currency: string }) => {
    const iconPath = currency === 'BTC' 
      ? "M17.933 2.012l-6.864 2.668-1.503 5.834 6.864-2.668-1.503 5.834 5.36-2.08-1.504 5.834 2.87-1.114.752-2.918-10.428 4.046.752 2.918-3.622 1.405-1.504-5.834 3.622-1.405.752 2.918 6.864-2.668-1.504-5.834-6.864 2.668.752 2.918-5.36 2.08L7.43 3.42 4.56 4.534l.75 2.918L2.5 8.857 4 14.69l3.622-1.405-.752-2.918L10.5 7.7L9 13.534l5.36-2.08.752 2.918 2.87-1.114-1.504-5.834-2.87 1.114L15.067 2.7l3.622-1.405-1.504 5.834-2.87-1.114.75-2.918z"
      : "M12 1.75l-6.25 10.5L12 17l6.25-4.75L12 1.75zM5.75 13l6.25 3.5 6.25-3.5L12 21.25 5.75 13z";
    return (
      <svg className="w-6 h-6 mr-3 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
        <path d={iconPath}></path>
      </svg>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wallet Management</CardTitle>
      </CardHeader>
      <CardContent>
        {!isAdminView && (
            <form onSubmit={handleAddWallet} className="mb-8 p-4 bg-gray-800 rounded-md space-y-4">
                <h4 className="font-semibold text-white">Add New Wallet</h4>
                <Alert message={error} type="error" />
                <Alert message={message} type="success" />
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="md:col-span-1">
                    <label htmlFor="currency" className="block text-sm font-medium text-dark-text-secondary">Currency</label>
                    <select id="currency" value={newCurrency} onChange={(e) => setNewCurrency(e.target.value as Wallet['currency'])} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-dark-border focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm rounded-md bg-dark-card text-dark-text">
                      <option>BTC</option>
                      <option>ETH</option>
                      <option>USDT</option>
                    </select>
                  </div>
                  <div className="md:col-span-3">
                    <Input id="address" label="Wallet Address" type="text" required value={newAddress} onChange={(e) => setNewAddress(e.target.value)} />
                  </div>
                  <div className="md:col-span-1 self-end">
                    <Button type="submit" isLoading={isSubmitting}>Add</Button>
                  </div>
                </div>
            </form>
        )}

        <h4 className="font-semibold text-white mb-4">Linked Wallets</h4>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Spinner />
          </div>
        ) : wallets.length === 0 ? (
          <p className="text-dark-text-secondary text-center py-10">No wallets linked yet.</p>
        ) : (
          <ul className="divide-y divide-dark-border">
            {wallets.map((wallet) => (
              <li key={wallet.id} className="py-4 flex items-center justify-between">
                <div className="flex items-center">
                  <CurrencyIcon currency={wallet.currency} />
                  <div>
                    <p className="text-sm font-medium text-dark-text">{wallet.currency} Wallet</p>
                    <p className="text-xs text-dark-text-secondary font-mono truncate max-w-xs md:max-w-md">{wallet.address}</p>
                    {wallet.isVerified && <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-800 text-green-200">Verified</span>}
                  </div>
                </div>
                {!isAdminView && (
                    <Button variant="danger" className="w-auto px-3 py-1" onClick={() => handleRemoveWallet(wallet.id)}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default WalletManager;