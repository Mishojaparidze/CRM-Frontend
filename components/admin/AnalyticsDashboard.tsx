
import React, { useState, useEffect, useMemo } from 'react';
import { User, GamingActivity } from '../../types';
// FIX: Use relative path for mockApiService
import * as api from '../../services/mockApiService';
import { Spinner } from '../ui/Spinner';
import { Alert } from '../ui/Alert';
import { KpiCard } from './analytics/KpiCard';
import { ActivityWall } from './analytics/ActivityWall';
import { ScheduledReports } from './analytics/ScheduledReports';
import { CohortAnalysis } from './analytics/CohortAnalysis';
import { FunnelAnalysis } from './analytics/FunnelAnalysis';
import { DataExport } from './analytics/DataExport';

const AnalyticsDashboard: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [activities, setActivities] = useState<GamingActivity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError('');
            try {
                const [usersResponse, activitiesResponse] = await Promise.all([
                    api.getAllUsers(),
                    api.getAllGamingActivities(),
                ]);
                setUsers(usersResponse.data.filter(u => u.role === 'user')); // Only analyze players
                setActivities(activitiesResponse.data);
            } catch (err: any) {
                setError(err.message || 'Failed to load analytics data.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const kpiData = useMemo(() => {
        if (!users.length) return { mau: 0, newSignups: 0, totalGgr: 0, kycConversion: '0%' };

        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const mau = users.filter(u => new Date(u.lastLoginAt) > thirtyDaysAgo).length;

        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const newSignups = users.filter(u => new Date(u.createdAt) > startOfMonth).length;

        const totalGgr = users.reduce((acc, user) => acc + user.ggr, 0);

        const verifiedKyc = users.filter(u => u.kycStatus === 'verified').length;
        const kycConversion = users.length > 0 ? ((verifiedKyc / users.length) * 100).toFixed(1) + '%' : '0%';
        
        return { mau, newSignups, totalGgr, kycConversion };
    }, [users]);
    
    if (isLoading) {
        return <div className="flex justify-center py-16"><Spinner /></div>;
    }
    if (error) {
        return <Alert message={error} type="error" />;
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-white mb-4">Key Performance Indicators</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <KpiCard title="Monthly Active Users" value={kpiData.mau.toLocaleString()} />
                    <KpiCard title="New Sign-ups (This Month)" value={kpiData.newSignups.toLocaleString()} />
                    <KpiCard title="Total GGR" value={`$${kpiData.totalGgr.toLocaleString()}`} />
                    <KpiCard title="KYC Conversion Rate" value={kpiData.kycConversion} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <CohortAnalysis users={users} />
                    <FunnelAnalysis users={users} />
                </div>
                <div className="lg:col-span-1 space-y-8">
                    <ActivityWall activities={activities} users={users} />
                    <ScheduledReports />
                    <DataExport users={users} />
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;