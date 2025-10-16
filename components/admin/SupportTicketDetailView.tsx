
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SupportTicket, User, TicketReply, TicketStatus, TicketPriority } from '../../types';
// FIX: Use relative path for mockApiService
import * as api from '../../services/mockApiService';
// FIX: Use relative path for useAuth
import { useAuth } from '../../hooks/useAuth';
import Header from '../Header';
import { Spinner } from '../ui/Spinner';
import { Alert } from '../ui/Alert';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';

const TicketStatusPill: React.FC<{ status: TicketStatus }> = ({ status }) => {
    const colors = {
        Open: 'bg-blue-600 text-blue-100',
        Pending: 'bg-yellow-600 text-yellow-100',
        Resolved: 'bg-green-600 text-green-100',
        Closed: 'bg-gray-600 text-gray-100',
    };
    return <span className={`px-3 py-1 text-sm font-semibold rounded-full ${colors[status]}`}>{status}</span>;
}

const ReplyCard: React.FC<{ reply: TicketReply, author: 'admin' | 'user' }> = ({ reply, author }) => {
    const cardClass = reply.isInternalNote 
        ? 'bg-yellow-900 border-yellow-700' 
        : author === 'admin' ? 'bg-gray-800' : 'bg-gray-900';
    
    return (
        <div className={`p-4 rounded-lg border ${cardClass} border-dark-border`}>
            <div className="flex justify-between items-center mb-2">
                <p className="font-semibold text-sm text-dark-text">
                    {reply.isInternalNote && <span className="text-yellow-400 mr-2">[INTERNAL NOTE]</span>}
                    {reply.authorName}
                </p>
                <p className="text-xs text-dark-text-secondary">{new Date(reply.createdAt).toLocaleString()}</p>
            </div>
            <p className="text-dark-text-secondary whitespace-pre-wrap">{reply.content}</p>
        </div>
    )
}

const SupportTicketDetailView: React.FC = () => {
    const { ticketId } = useParams<{ ticketId: string }>();
    const { user: adminUser } = useAuth();
    const [ticket, setTicket] = useState<SupportTicket | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [allAdmins, setAllAdmins] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [replyContent, setReplyContent] = useState('');
    const [isInternalNote, setIsInternalNote] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchTicketData = useCallback(async () => {
        if (!ticketId) return;
        setIsLoading(true);
        setError('');
        try {
            const ticketResponse = await api.getTicketById(ticketId);
            setTicket(ticketResponse.data);

            const userResponse = await api.getUserById(ticketResponse.data.userId);
            setUser(userResponse.data);

            const allUsersResponse = await api.getAllUsers();
            setAllAdmins(allUsersResponse.data.filter(u => u.role === 'admin'));

        } catch (err: any) {
            setError(err.message || 'Failed to load ticket data.');
        } finally {
            setIsLoading(false);
        }
    }, [ticketId]);

    useEffect(() => {
        fetchTicketData();
    }, [fetchTicketData]);
    
    const handleUpdateTicket = async (updates: Partial<SupportTicket>) => {
        if(!ticket) return;
        try {
            const response = await api.updateTicket(ticket.id, updates);
            setTicket(response.data);
        } catch (err: any) {
             setError(err.message || 'Failed to update ticket.');
        }
    };
    
    const handleReplySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ticket || !replyContent.trim()) return;

        setIsSubmitting(true);
        setError('');
        try {
            await api.addTicketReply(ticket.id, replyContent, isInternalNote);
            setReplyContent('');
            setIsInternalNote(false);
            fetchTicketData(); // Refetch to get the new reply
        } catch (err: any) {
            setError(err.message || 'Failed to submit reply.');
        } finally {
            setIsSubmitting(false);
        }
    };


    if (isLoading) {
        return <div className="min-h-screen bg-dark-bg flex items-center justify-center"><Spinner /></div>;
    }

    return (
        <div className="min-h-screen bg-dark-bg">
            <Header />
            <main className="py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {error && <Alert message={error} type="error" />}
                    {ticket && user && (
                        <div>
                            <Link to="/" className="text-sm text-brand-secondary hover:underline mb-4 inline-block">
                                &larr; Back to Admin Dashboard
                            </Link>
                            <div className="bg-dark-card shadow rounded-lg p-6 mb-8">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h1 className="text-2xl font-bold text-white">{ticket.subject}</h1>
                                        <p className="text-sm text-dark-text-secondary mt-1">
                                            Ticket #{ticket.id.split('_')[1]} from <Link to={`/admin/user/${user.id}`} className="text-brand-secondary hover:underline">{user.username}</Link>
                                        </p>
                                    </div>
                                    <TicketStatusPill status={ticket.status} />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-6">
                                    <Card>
                                        <CardHeader><CardTitle>Conversation</CardTitle></CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="p-4 rounded-lg border bg-gray-900 border-dark-border">
                                                <div className="flex justify-between items-center mb-2">
                                                    <p className="font-semibold text-sm text-dark-text">{user.username} (User)</p>
                                                    <p className="text-xs text-dark-text-secondary">{new Date(ticket.createdAt).toLocaleString()}</p>
                                                </div>
                                                <p className="text-dark-text-secondary whitespace-pre-wrap">{ticket.description}</p>
                                            </div>
                                            {ticket.replies?.map(reply => (
                                                <ReplyCard key={reply.id} reply={reply} author={reply.authorId.startsWith('admin') ? 'admin' : 'user'} />
                                            ))}
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader><CardTitle>Add Reply</CardTitle></CardHeader>
                                        <CardContent>
                                            <form onSubmit={handleReplySubmit} className="space-y-4">
                                                <textarea
                                                    rows={6}
                                                    className="w-full bg-dark-card border border-dark-border rounded-md p-2 text-dark-text focus:ring-brand-primary focus:border-brand-primary"
                                                    value={replyContent}
                                                    onChange={(e) => setReplyContent(e.target.value)}
                                                    placeholder="Type your reply here..."
                                                />
                                                <div className="flex justify-between items-center">
                                                    <label className="flex items-center space-x-2 text-sm text-dark-text-secondary">
                                                        <input type="checkbox" checked={isInternalNote} onChange={(e) => setIsInternalNote(e.target.checked)} className="h-4 w-4 text-brand-primary bg-dark-card border-dark-border rounded focus:ring-brand-primary"/>
                                                        <span>Post as internal note</span>
                                                    </label>
                                                    <Button type="submit" isLoading={isSubmitting} className="w-auto">
                                                        {isInternalNote ? 'Add Note' : 'Send Reply'}
                                                    </Button>
                                                </div>
                                            </form>
                                        </CardContent>
                                    </Card>
                                </div>

                                <div className="space-y-6">
                                    <Card>
                                        <CardHeader><CardTitle>Ticket Details</CardTitle></CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <label className="text-sm font-medium text-dark-text-secondary">Status</label>
                                                <select value={ticket.status} onChange={e => handleUpdateTicket({ status: e.target.value as TicketStatus })} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-dark-border focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm rounded-md bg-gray-800 text-dark-text">
                                                    <option>Open</option><option>Pending</option><option>Resolved</option><option>Closed</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-dark-text-secondary">Priority</label>
                                                <select value={ticket.priority} onChange={e => handleUpdateTicket({ priority: e.target.value as TicketPriority })} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-dark-border focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm rounded-md bg-gray-800 text-dark-text">
                                                    <option>Low</option><option>Medium</option><option>High</option><option>Urgent</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-dark-text-secondary">Assignee</label>
                                                <select value={ticket.assignedToAdminId || ''} onChange={e => handleUpdateTicket({ assignedToAdminId: e.target.value, assignedToAdminUsername: allAdmins.find(a => a.id === e.target.value)?.username })} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-dark-border focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm rounded-md bg-gray-800 text-dark-text">
                                                    <option value="">Unassigned</option>
                                                    {allAdmins.map(admin => (
                                                        <option key={admin.id} value={admin.id}>{admin.username}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default SupportTicketDetailView;