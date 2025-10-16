import React, { useState, useEffect, useCallback } from 'react';
import { Task, User } from '../../types';
import * as api from '../../services/mockApiService';
import { useAuth } from '../../hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { Alert } from '../ui/Alert';
import { Input } from '../ui/Input';

interface TaskManagerProps {
    userId?: string; // If provided, shows tasks for a specific user
    allAdmins?: User[];
}

const TaskStatusBadge: React.FC<{ status: Task['status'] }> = ({ status }) => {
    const colors = {
        'To Do': 'bg-gray-600 text-gray-100',
        'In Progress': 'bg-blue-600 text-blue-100',
        'Done': 'bg-green-600 text-green-100',
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[status]}`}>{status}</span>
}

export const TaskManager: React.FC<TaskManagerProps> = ({ userId }) => {
    const { user: currentUser } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    const fetchTasks = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = userId ? await api.getTasksForUser(userId) : await api.getAllTasks();
            // In a real app, you might filter by assignedToAdminId, but for mock we show all
            setTasks(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch tasks.');
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);
    
    const handleStatusChange = async (taskId: string, status: Task['status']) => {
        try {
            await api.updateTask(taskId, { status });
            fetchTasks(); // Refresh list
        } catch(err: any) {
            setError(err.message || "Failed to update task status.")
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="mb-4 md:mb-0">
                    <CardTitle>{userId ? 'User-Related Tasks' : 'My Tasks'}</CardTitle>
                    {!userId && <p className="mt-1 text-sm text-dark-text-secondary">Tasks assigned to you or your team.</p>}
                </div>
                 <Button onClick={() => alert('Feature coming soon!')} className="w-full md:w-auto">
                    Create New Task
                </Button>
            </CardHeader>
            <CardContent>
                {error && <Alert message={error} type="error" />}
                {isLoading ? (
                    <div className="flex justify-center py-16"><Spinner /></div>
                ) : tasks.length === 0 ? (
                    <p className="text-dark-text-secondary text-center py-16">
                        No tasks found.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-dark-border">
                            <thead className="bg-gray-800">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Title</th>
                                    {!userId && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Related User</th>}
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Assigned To</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Due Date</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-dark-card divide-y divide-dark-border">
                                {tasks.map(task => (
                                    <tr key={task.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark-text">{task.title}</td>
                                        {!userId && <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text-secondary">{task.relatedUserUsername || 'N/A'}</td>}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text-secondary">{task.assignedToAdminUsername}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text-secondary">{new Date(task.dueDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select 
                                                value={task.status} 
                                                onChange={(e) => handleStatusChange(task.id, e.target.value as Task['status'])}
                                                className="block w-full pl-3 pr-10 py-1 text-base border-dark-border focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm rounded-md bg-gray-800 text-dark-text"
                                            >
                                                <option>To Do</option>
                                                <option>In Progress</option>
                                                <option>Done</option>
                                            </select>
                                        </td>
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