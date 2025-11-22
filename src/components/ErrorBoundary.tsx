/**
 * Global Error Boundary Component
 * Catches React errors and provides fallback UI
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { logger } from '@/lib/logger';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: (error: Error, resetError: () => void) => ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

/**
 * Global Error Boundary
 * Wraps the application to catch and handle React errors
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        // Log error
        logger.error('Error Boundary caught an error', error, {
            componentStack: errorInfo.componentStack,
        });

        // Update state
        this.setState({ errorInfo });

        // Call custom error handler if provided
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }

        // In production, send to error tracking service
        if (process.env.NODE_ENV === 'production') {
            // Error automatically sent to Sentry (configured in sentry.client.config.ts)
            // Additional custom tracking can be added here
            // Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
        }
    }

    resetError = (): void => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    render(): ReactNode {
        if (this.state.hasError && this.state.error) {
            // Use custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback(this.state.error, this.resetError);
            }

            // Default fallback UI
            return <DefaultErrorFallback error={this.state.error} resetError={this.resetError} />;
        }

        return this.props.children;
    }
}

/**
 * Default Error Fallback UI
 */
function DefaultErrorFallback({
    error,
    resetError,
}: {
    error: Error;
    resetError: () => void;
}) {
    const handleGoHome = () => {
        resetError();
        window.location.href = '/dashboard';
    };

    const handleReload = () => {
        resetError();
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full border-destructive/50">
                <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 rounded-full bg-destructive/10">
                            <AlertTriangle className="h-8 w-8 text-destructive" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl">Something went wrong</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                                We&apos;re sorry, but something unexpected happened
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Error message */}
                    <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                        <p className="font-semibold text-sm mb-2">Error Details:</p>
                        <p className="text-sm text-muted-foreground font-mono break-all">
                            {error.message}
                        </p>
                    </div>

                    {/* Development-only error stack */}
                    {process.env.NODE_ENV === 'development' && error.stack && (
                        <details className="text-xs">
                            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                                Stack Trace (Development Only)
                            </summary>
                            <pre className="mt-2 p-3 bg-muted rounded overflow-auto text-xs">
                                {error.stack}
                            </pre>
                        </details>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button onClick={handleReload} className="flex-1" variant="default">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Reload Page
                        </Button>
                        <Button onClick={handleGoHome} className="flex-1" variant="outline">
                            <Home className="mr-2 h-4 w-4" />
                            Go to Dashboard
                        </Button>
                    </div>

                    {/* Help text */}
                    <div className="text-sm text-muted-foreground space-y-2">
                        <p className="font-semibold">What you can try:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Reload the page</li>
                            <li>Clear your browser cache and cookies</li>
                            <li>Try again in a few minutes</li>
                            <li>Contact support if the issue persists</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

/**
 * Route Error Boundary
 * Smaller error boundary for specific routes/sections
 */
export function RouteErrorBoundary({ children }: { children: ReactNode }) {
    return (
        <ErrorBoundary
            fallback={(error, resetError) => (
                <div className="p-6">
                    <Card className="border-destructive/50">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="p-2 rounded-lg bg-destructive/10 shrink-0">
                                    <AlertTriangle className="h-5 w-5 text-destructive" />
                                </div>
                                <div className="flex-1 space-y-3">
                                    <div>
                                        <h3 className="text-sm font-semibold text-destructive mb-1">
                                            Unable to Load Section
                                        </h3>
                                        <p className="text-sm text-muted-foreground">{error.message}</p>
                                    </div>
                                    <Button onClick={resetError} variant="outline" size="sm">
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        Try Again
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        >
            {children}
        </ErrorBoundary>
    );
}

export default ErrorBoundary;
