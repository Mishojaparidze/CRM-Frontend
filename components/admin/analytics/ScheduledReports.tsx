import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Button';

export const ScheduledReports: React.FC = () => {
    const mockReports = [
        "Weekly User Growth",
        "Daily High-Risk Activity",
        "Monthly GGR Summary",
        "KYC Pending Report"
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Scheduled Reports</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-3">
                    {mockReports.map(report => (
                        <li key={report} className="flex justify-between items-center text-sm">
                            <span className="text-dark-text-secondary">{report}</span>
                            <button className="text-xs text-brand-secondary hover:underline">Configure</button>
                        </li>
                    ))}
                </ul>
                 <Button variant="secondary" className="mt-4" onClick={() => alert('Feature coming soon!')}>
                    New Scheduled Report
                </Button>
            </CardContent>
        </Card>
    );
};