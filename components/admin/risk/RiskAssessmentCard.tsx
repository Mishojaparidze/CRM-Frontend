import React, { useState, useEffect, useCallback } from 'react';
import { RiskAssessment, RiskLevel, User } from '../../../types';
import * as api from '../../../services/mockApiService';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Spinner } from '../../ui/Spinner';
import { Alert } from '../../ui/Alert';

interface RiskAssessmentCardProps {
    userId: string;
    userStatus: User['status'];
}

const getRiskLevelStyle = (level: RiskLevel): { text: string; bg: string; } => {
    switch (level) {
        case 'Low': return { text: 'text-green-400', bg: 'bg-green-900/50' };
        case 'Medium': return { text: 'text-yellow-400', bg: 'bg-yellow-900/50' };
        case 'High': return { text: 'text-orange-400', bg: 'bg-orange-900/50' };
        case 'Critical': return { text: 'text-red-500', bg: 'bg-red-900/50' };
        default: return { text: 'text-gray-400', bg: 'bg-gray-800' };
    }
};

export const RiskAssessmentCard: React.FC<RiskAssessmentCardProps> = ({ userId, userStatus }) => {
    const [assessment, setAssessment] = useState<RiskAssessment | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchAssessment = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await api.getRiskAssessmentForUser(userId);
            setAssessment(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch risk assessment.');
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchAssessment();
    }, [fetchAssessment]);

    if (isLoading) {
        return <Card><CardContent className="flex justify-center py-8"><Spinner /></CardContent></Card>;
    }
    
    if (error) {
        return <Card><CardContent><Alert message={error} type="error" /></CardContent></Card>;
    }

    if (!assessment) {
        return null;
    }

    const riskStyle = getRiskLevelStyle(assessment.level);
    const isActionDisabled = userStatus === 'banned' || userStatus === 'suspended';

    return (
        <Card>
            <CardHeader>
                <CardTitle>Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className={`text-center p-4 rounded-lg ${riskStyle.bg}`}>
                    <div className={`text-5xl font-bold ${riskStyle.text}`}>{assessment.score} <span className="text-3xl text-dark-text-secondary">/ 100</span></div>
                    <div className={`text-lg font-semibold mt-1 ${riskStyle.text}`}>{assessment.level} Risk</div>
                </div>

                <div>
                    <h4 className="font-semibold text-dark-text text-sm mb-2">Contributing Risk Factors:</h4>
                    {assessment.factors.length > 0 ? (
                        <ul className="space-y-2">
                            {assessment.factors.map(factor => (
                                <li key={factor.id} className="flex items-start text-sm text-dark-text-secondary">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 mt-0.5 text-yellow-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <span>{factor.description}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-dark-text-secondary text-center py-2">No specific risk factors detected.</p>
                    )}
                </div>

                <div className="pt-4 border-t border-dark-border space-y-2">
                    <Button 
                        variant="secondary" 
                        onClick={() => alert(`Task created to review user ${userId}.`)}
                        disabled={isActionDisabled}
                    >
                        Flag for Review
                    </Button>
                    <Button 
                        variant="danger"
                        onClick={() => alert(`AML check initiated for user ${userId}.`)}
                        disabled={isActionDisabled}
                    >
                        Initiate AML Check
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};