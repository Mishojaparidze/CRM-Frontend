import React from 'react';
import { Card, CardContent } from '../ui/Card';

export const UserTableSkeleton: React.FC = () => {
    return (
        <Card>
            <CardContent className="!p-0">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-dark-border">
                        <thead className="bg-gray-800">
                            <tr>
                                {[...Array(9)].map((_, i) => (
                                    <th key={i} scope="col" className="px-6 py-3">
                                        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-dark-card divide-y divide-dark-border">
                            {[...Array(10)].map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-6 py-4">
                                        <div className="h-4 w-4 bg-gray-700 rounded"></div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="h-4 bg-gray-700 rounded w-full"></div>
                                        <div className="h-3 bg-gray-700 rounded w-1/2 mt-2"></div>
                                    </td>
                                    {[...Array(7)].map((_, j) => (
                                        <td key={j} className="px-6 py-4">
                                            <div className="h-6 bg-gray-700 rounded w-full"></div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
};