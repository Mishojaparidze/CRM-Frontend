import React, { Component, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  // FIX: Replaced state class property with constructor initialization
  // for better compatibility with some tooling which might have been
  // causing the error about 'props' not existing.
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // In a real app, you would log this to a service like Sentry, LogRocket, etc.
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
            <Card className="max-w-lg w-full">
                <CardHeader>
                    <CardTitle className="text-red-400">Something went wrong.</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-dark-text-secondary mb-4">
                        An unexpected error has occurred. Please try refreshing the page.
                    </p>
                    {this.state.error && (
                        <details className="mt-4 p-2 bg-gray-800 rounded">
                            <summary className="cursor-pointer text-sm font-medium text-dark-text">Error Details</summary>
                            <pre className="mt-2 text-xs text-red-300 whitespace-pre-wrap">
                                {this.state.error.toString()}
                            </pre>
                        </details>
                    )}
                </CardContent>
            </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
