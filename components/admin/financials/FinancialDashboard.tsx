import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GamingActivity } from '../../../types';
import * as api from '../../../services/mockApiService';
import { Alert } from '../../ui/Alert';
import { Spinner } from '../../ui/Spinner';
import TransactionTable from './TransactionTable';
import FinancialChart from './FinancialChart';

type FinancialTab = 'deposits' | 'withdrawals';

const FinancialDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<FinancialTab>('deposits');
    const [deposits, setDeposits] = useState<GamingActivity[]>([]);
    const [withdrawals, setWithdrawals] = useState<GamingActivity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchTransactions = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const [depositsResponse, withdrawalsResponse] = await Promise.all([
                api.getFinancialTransactions('deposit'),
                api.getFinancialTransactions('withdrawal'),
            ]);
            setDeposits(depositsResponse.data);
            setWithdrawals(withdrawalsResponse.data);
        } catch (err: any) {
            setError(err.message || 'Failed to load financial data.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const handleTransactionUpdate = () => {
        // Refetch data after an admin action
        fetchTransactions();
    };

    const TabButton: React.FC<{ tabId: FinancialTab, label: string, count: number }> = ({ tabId, label, count }) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`px-4 py-2 font-medium text-sm rounded-md relative ${activeTab === tabId ? 'bg-brand-primary text-white' : 'text-dark-text-secondary hover:bg-gray-800'}`}
        >
            {label}
            {count > 0 && (
                <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">{count}</span>
            )}
        </button>
    );

    const allTransactions = useMemo(() => [...deposits, ...withdrawals], [deposits, withdrawals]);
    const pendingDeposits = useMemo(() => deposits.filter(d => d.status === 'pending').length, [deposits]);
    const pendingWithdrawals = useMemo(() => withdrawals.filter(w => w.status === 'pending').length, [withdrawals]);

    return (
        <div className="space-y-8">
            {isLoading ? (
                <div className="flex justify-center py-16"><Spinner /></div>
            ) : error ? (
                <Alert message={error} type="error" />
            ) : (
                <>
                    <FinancialChart transactions={allTransactions} />
                    <div>
                        <div className="border-b border-dark-border mb-4">
                            <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                                <TabButton tabId="deposits" label="Deposits" count={pendingDeposits} />
                                <TabButton tabId="withdrawals" label="Withdrawals" count={pendingWithdrawals} />
                            </nav>
                        </div>
                        {activeTab === 'deposits' && (
                            <TransactionTable 
                                type="deposit" 
                                transactions={deposits} 
                                onUpdate={handleTransactionUpdate}
                                title="Deposit Queue" 
                            />
                        )}
                        {activeTab === 'withdrawals' && (
                            <TransactionTable 
                                type="withdrawal" 
                                transactions={withdrawals} 
                                onUpdate={handleTransactionUpdate}
                                title="Withdrawal Queue" 
                            />
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default FinancialDashboard;
