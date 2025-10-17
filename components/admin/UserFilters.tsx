import React from 'react';
import { LoyaltyTier } from '../../types';
import { Card, CardContent } from '../ui/Card';

type QuickFilterType = 'none' | 'new_players' | 'at_risk' | 'whales' | 'inactive';

interface UserFiltersProps {
  filters: {
    query: string;
    status: string;
    kycStatus: string;
    loyaltyTierId: string;
  };
  onFilterChange: (filters: UserFiltersProps['filters']) => void;
  loyaltyTiers: LoyaltyTier[];
  activeQuickFilter: QuickFilterType;
  onQuickFilterChange: (filter: QuickFilterType) => void;
}

const QuickFilterButton: React.FC<{
  label: string;
  filter: QuickFilterType;
  activeFilter: QuickFilterType;
  onClick: (filter: QuickFilterType) => void;
}> = ({ label, filter, activeFilter, onClick }) => (
    <button
        onClick={() => onClick(filter)}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            activeFilter === filter
                ? 'bg-brand-primary text-white'
                : 'bg-gray-700 text-dark-text-secondary hover:bg-gray-600'
        }`}
    >
        {label}
    </button>
);


export const UserFilters: React.FC<UserFiltersProps> = ({ filters, onFilterChange, loyaltyTiers, activeQuickFilter, onQuickFilterChange }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  return (
    <Card className="bg-gray-800">
      <CardContent className="!p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <label htmlFor="query" className="sr-only">Search</label>
            <input
              type="text"
              id="query"
              name="query"
              value={filters.query}
              onChange={handleInputChange}
              className="appearance-none block w-full px-3 py-2 border border-dark-border rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm bg-dark-card text-dark-text"
              placeholder="Search by name, email, ID..."
              disabled={activeQuickFilter !== 'none'}
            />
          </div>
          <div>
            <label htmlFor="status" className="sr-only">Status</label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleInputChange}
              className="block w-full pl-3 pr-10 py-2 text-base border-dark-border focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm rounded-md bg-dark-card text-dark-text"
              disabled={activeQuickFilter !== 'none'}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="banned">Banned</option>
              <option value="anonymized">Anonymized</option>
            </select>
          </div>
          <div>
            <label htmlFor="kycStatus" className="sr-only">KYC Status</label>
            <select
              id="kycStatus"
              name="kycStatus"
              value={filters.kycStatus}
              onChange={handleInputChange}
              className="block w-full pl-3 pr-10 py-2 text-base border-dark-border focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm rounded-md bg-dark-card text-dark-text"
              disabled={activeQuickFilter !== 'none'}
            >
              <option value="all">All KYC Statuses</option>
              <option value="none">None</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
           <div>
            <label htmlFor="loyaltyTierId" className="sr-only">Loyalty Tier</label>
            <select
              id="loyaltyTierId"
              name="loyaltyTierId"
              value={filters.loyaltyTierId}
              onChange={handleInputChange}
              className="block w-full pl-3 pr-10 py-2 text-base border-dark-border focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm rounded-md bg-dark-card text-dark-text"
              disabled={activeQuickFilter !== 'none'}
            >
              <option value="all">All Tiers</option>
              {loyaltyTiers.map(tier => (
                <option key={tier.id} value={tier.id}>{tier.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-dark-border">
            <span className="text-sm font-medium text-dark-text-secondary mr-2">Quick Filters:</span>
            <QuickFilterButton label="New Players (7d)" filter="new_players" activeFilter={activeQuickFilter} onClick={onQuickFilterChange} />
            <QuickFilterButton label="At-Risk (Churn > 75)" filter="at_risk" activeFilter={activeQuickFilter} onClick={onQuickFilterChange} />
            <QuickFilterButton label="Whales (LTV > $5k)" filter="whales" activeFilter={activeQuickFilter} onClick={onQuickFilterChange} />
            <QuickFilterButton label="Inactive (30d+)" filter="inactive" activeFilter={activeQuickFilter} onClick={onQuickFilterChange} />
        </div>
      </CardContent>
    </Card>
  );
};