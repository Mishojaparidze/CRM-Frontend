import React from 'react';
import { User } from '../../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';

interface AccountBalanceCardProps {
    user: User;
}

const AccountBalanceCard: React.FC<AccountBalanceCardProps> = ({ user }) => {
    const totalBalance = (user.balance || 0) + (user.bonusBalance || 0);
    const wageringProgress = user.wageringRequirement && user.wageringRequirement.target > 0
        ? (user.wageringRequirement.progress / user.wageringRequirement.target) * 100
        : 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Account Balance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <p className="text-sm text-dark-text-secondary">Total Balance</p>
                    <p className="text-3xl font-bold text-white">${totalBalance.toFixed(2)}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-dark-border">
                    <div>
                        <p className="text-xs text-dark-text-secondary">Cash Balance</p>
                        <p className="text-lg font-semibold text-green-400">${(user.balance || 0).toFixed(2)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-dark-text-secondary">Bonus Balance</p>
                        <p className="text-lg font-semibold text-blue-400">${(user.bonusBalance || 0).toFixed(2)}</p>
                    </div>
                </div>

                {user.wageringRequirement && user.wageringRequirement.target > 0 && (
                    <div className="pt-4 border-t border-dark-border">
                        <h4 className="text-sm font-medium text-dark-text mb-2">Wagering Requirement</h4>
                        <div className="flex justify-between text-xs text-dark-text-secondary mb-1">
                            <span>${user.wageringRequirement.progress.toFixed(2)}</span>
                            <span>${user.wageringRequirement.target.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                            <div className="bg-brand-primary h-2.5 rounded-full" style={{ width: `${wageringProgress}%` }}></div>
                        </div>
                        <p className="text-center text-xs text-dark-text-secondary mt-1">{wageringProgress.toFixed(1)}% Complete</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default AccountBalanceCard;
