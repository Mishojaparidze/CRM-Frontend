import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

export const GamingActivityFeed: React.FC = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Gaming Activity</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-dark-text-secondary text-center py-10">
                    Gaming activity feed is not yet implemented.
                </p>
            </CardContent>
        </Card>
    );
};
