
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
// FIX: Use relative path for mockApiService
import * as api from '../services/mockApiService';
// FIX: Use relative path for types
import { User } from '../types';
import { Spinner } from './ui/Spinner';
import { StatusBadge } from './admin/StatusBadge';

const SEARCH_RESULT_LIMIT = 10;

const KycBadge: React.FC<{ status: User['kycStatus'] }> = ({ status }) => {
    const colorClasses = {
        none: 'bg-gray-700 text-gray-200',
        pending: 'bg-yellow-800 text-yellow-200',
        verified: 'bg-blue-800 text-blue-200',
        rejected: 'bg-red-800 text-red-200',
    };
    return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${colorClasses[status]}`}>
            {status}
        </span>
    );
};


export const GlobalSearch: React.FC = () => {
    const [query, setQuery] = useState('');
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const navigate = useNavigate();
    const searchContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchAllUsers = async () => {
            try {
                // Only fetch users for the search once
                const response = await api.getAllUsers();
                setAllUsers(response.data);
            } catch (error) {
                console.error("Failed to fetch users for search:", error);
            }
        };
        fetchAllUsers();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setIsFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    const filteredUsers = useMemo(() => {
        if (!query) {
            return [];
        }
        return allUsers.filter(user =>
            user.username.toLowerCase().includes(query.toLowerCase()) ||
            user.email.toLowerCase().includes(query.toLowerCase())
        ).slice(0, SEARCH_RESULT_LIMIT);
    }, [query, allUsers]);

    const handleSelectUser = (userId: string) => {
        setQuery('');
        setIsFocused(false);
        navigate(`/admin/user/${userId}`);
    };

    const showResults = isFocused && query.length > 0;

    return (
        <div className="relative w-full max-w-xs md:max-w-md" ref={searchContainerRef}>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    placeholder="Search users by name or email..."
                    className="block w-full pl-10 pr-3 py-2 border border-dark-border rounded-md leading-5 bg-dark-card text-dark-text placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                />
            </div>

            {showResults && (
                <div className="absolute z-10 mt-1 w-full bg-dark-card border border-dark-border rounded-md shadow-lg max-h-80 overflow-auto">
                    <ul className="py-1">
                        {isLoading ? (
                            <li className="flex justify-center items-center p-4">
                                <Spinner />
                            </li>
                        ) : filteredUsers.length > 0 ? (
                            filteredUsers.map(user => (
                                <li
                                    key={user.id}
                                    onClick={() => handleSelectUser(user.id)}
                                    className="px-4 py-3 text-sm text-dark-text hover:bg-gray-800 cursor-pointer"
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">{user.username}</p>
                                            <p className="text-xs text-dark-text-secondary">{user.email}</p>
                                        </div>
                                        <div className="flex items-center space-x-2 flex-shrink-0">
                                            <StatusBadge status={user.status} />
                                            <KycBadge status={user.kycStatus} />
                                        </div>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <li className="px-4 py-2 text-sm text-dark-text-secondary text-center">
                                No users found.
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};