
import React, { useState, useEffect, useCallback, useRef } from 'react';
// FIX: Use relative path for mockApiService
import * as api from '../../services/mockApiService';
import { UserDocument } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { Spinner } from '../ui/Spinner';

interface DocumentManagerProps {
    userId: string;
}

const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({ userId }) => {
    const [documents, setDocuments] = useState<UserDocument[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchDocuments = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.getUserDocuments(userId);
            setDocuments(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to load documents.');
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Please select a file to upload.');
            return;
        }
        setIsUploading(true);
        setError('');
        setMessage('');
        try {
            await api.addUserDocument(userId, selectedFile);
            setMessage('Document uploaded successfully.');
            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            fetchDocuments();
        } catch (err: any) {
            setError(err.message || 'Failed to upload document.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (docId: string) => {
        if (!window.confirm('Are you sure you want to delete this document?')) return;
        
        setError('');
        setMessage('');
        try {
            await api.deleteUserDocument(docId);
            setMessage('Document deleted successfully.');
            fetchDocuments();
        } catch (err: any) {
            setError(err.message || 'Failed to delete document.');
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Document Management</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="p-4 bg-gray-800 rounded-lg mb-6 space-y-4">
                    <h4 className="font-semibold text-white">Upload New Document</h4>
                    <Alert message={error} type="error" />
                    <Alert message={message} type="success" />
                    <div className="flex items-center space-x-4">
                        <input
                            ref={fileInputRef}
                            type="file"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-dark-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-primary file:text-white hover:file:bg-brand-secondary"
                        />
                        <Button onClick={handleUpload} isLoading={isUploading} className="w-auto flex-shrink-0">
                            Upload
                        </Button>
                    </div>
                </div>

                <h4 className="font-semibold text-white mb-4">Uploaded Documents</h4>
                {isLoading ? (
                    <div className="flex justify-center"><Spinner/></div>
                ) : documents.length === 0 ? (
                    <p className="text-dark-text-secondary text-center py-10">No documents have been uploaded for this user.</p>
                ) : (
                    <ul className="divide-y divide-dark-border">
                        {documents.map(doc => (
                            <li key={doc.id} className="py-3 flex items-center justify-between">
                                <div className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-dark-text-secondary mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    <div>
                                        <p className="text-sm font-medium text-dark-text">{doc.fileName}</p>
                                        <p className="text-xs text-dark-text-secondary">
                                            {formatBytes(doc.fileSize)} - Uploaded by {doc.uploadedBy} on {new Date(doc.uploadedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <Button variant="danger" className="w-auto px-3 py-1" onClick={() => handleDelete(doc.id)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </Button>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
};