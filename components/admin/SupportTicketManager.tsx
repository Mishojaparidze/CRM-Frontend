
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SupportTicket, TicketStatus, TicketPriority } from '../../types';
// FIX: Use relative path for mockApiService
import * as api from '../../services/mockApiService';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Spinner } from '../ui/Spinner';
import { Alert } from '../ui/Alert';

const StatusPill: React.FC<{ status: TicketStatus }> = ({ status }) => {
    const colors = {
        Open: 'bg-blue-600 text-blue-100',
        Pending: 'bg-yellow-600 text-yellow-100',
        Resolved: 'bg-green-600 text-green-100',
        Closed: 'bg-gray-600 text-gray-100',
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[status]}`}>{status}</span>;
}

const PriorityFlag: React.FC<{ priority: TicketPriority }> = ({ priority }) => {
    const colors = {
        Low: 'text-gray-400',
        Medium: 'text-blue-400',
        High: 'text-yellow-400',
        Urgent: 'text-red-500',
    };
     return (
        <span className={`flex items-center font-semibold text-sm ${colors[priority]}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 01-1-1V6z" clipRule="evenodd" />
            </svg>
            {priority}
        </span>
    );
}

export const SupportTicketManager: React.FC = () => {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
    const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'all'>('all');
    const navigate = useNavigate();

    const fetchTickets = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await api.getSupportTickets();
            setTickets(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch support tickets.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    const filteredTickets = useMemo(() => {
        return tickets.filter(ticket => {
            const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
            const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
            return matchesStatus && matchesPriority;
        });
    }, [tickets, statusFilter, priorityFilter]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Support Ticket Queue</CardTitle>
            </CardHeader>
            <CardContent>
                {error && <Alert message={error} type="error" />}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-dark-card rounded-lg mb-6">
                    <div>
                        <label htmlFor="status-filter-tickets" className="block text-sm font-medium text-dark-text-secondary">Filter by status</label>
                         <select id="status-filter-tickets" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-dark-border focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm rounded-md bg-gray-800 text-dark-text">
                            <option value="all">All Statuses</option>
                            <option>Open</option>
                            <option>Pending</option>
                            <option>Resolved</option>
                            <option>Closed</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="priority-filter-tickets" className="block text-sm font-medium text-dark-text-secondary">Filter by priority</label>
                         <select id="priority-filter-tickets" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as any)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-dark-border focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm rounded-md bg-gray-800 text-dark-text">
                            <option value="all">All Priorities</option>
                            <option>Low</option>
                            <option>Medium</option>
                            <option>High</option>
                            <option>Urgent</option>
                        </select>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-16"><Spinner /></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-dark-border">
                            <thead className="bg-gray-800">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Ticket</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">User</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Priority</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Last Updated</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Assigned To</th>
                                </tr>
                            </thead>
                            <tbody className="bg-dark-card divide-y divide-dark-border">
                                {filteredTickets.map(ticket => (
                                    <tr key={ticket.id} onClick={() => navigate(`/admin/support/ticket/${ticket.id}`)} className="hover:bg-gray-800 cursor-pointer">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-dark-text truncate max-w-xs">{ticket.subject}</div>
                                            <div className="text-xs text-dark-text-secondary font-mono">#{ticket.id.split('_')[1]}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text-secondary">{ticket.userUsername}</td>
                                        <td className="px-6 py-4 whitespace-nowrap"><StatusPill status={ticket.status} /></td>
                                        <td className="px-6 py-4 whitespace-nowrap"><PriorityFlag priority={ticket.priority} /></td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text-secondary">{new Date(ticket.updatedAt).toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text">{ticket.assignedToAdminUsername || 'Unassigned'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};