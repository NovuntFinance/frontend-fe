/**
 * Sentry Test Page
 * Test error tracking and performance monitoring
 */

'use client';

import { useState } from 'react';
import * as Sentry from '@sentry/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SentryTestPage() {
    const [lastError, setLastError] = useState<string>('');

    // Test 1: Capture exception
    const testException = () => {
        try {
            throw new Error('Test error from Sentry verification page!');
        } catch (error) {
            Sentry.captureException(error);
            setLastError('Exception sent to Sentry ✅');
            console.log('✅ Exception sent to Sentry');
        }
    };

    // Test 2: Capture message
    const testMessage = () => {
        Sentry.captureMessage('Test message from Novunt Frontend', 'info');
        setLastError('Message sent to Sentry ✅');
        console.log('✅ Message sent to Sentry');
    };

    // Test 3: Test with user context
    const testWithUser = () => {
        Sentry.setUser({
            id: 'test-user-123',
            email: 'test@novunt.com',
            username: 'test-user',
        });

        Sentry.captureMessage('Test with user context', 'info');
        setLastError('Message with user context sent ✅');
        console.log('✅ Message with user context sent');
    };

    // Test 4: Test breadcrumbs
    const testBreadcrumbs = () => {
        Sentry.addBreadcrumb({
            category: 'test',
            message: 'User clicked test button',
            level: 'info',
        });

        Sentry.addBreadcrumb({
            category: 'test',
            message: 'About to throw error',
            level: 'warning',
        });

        try {
            throw new Error('Error with breadcrumbs');
        } catch (error) {
            Sentry.captureException(error);
            setLastError('Error with breadcrumbs sent ✅');
            console.log('✅ Error with breadcrumbs sent');
        }
    };

    // Test 5: Performance monitoring
    const testPerformance = () => {
        // Use modern Sentry span API
        Sentry.startSpan(
            {
                name: 'Test Performance Operation',
                op: 'test.performance',
            },
            async () => {
                // Simulate some work
                await new Promise(resolve => setTimeout(resolve, 500));

                setLastError('Performance trace sent ✅');
                console.log('✅ Performance trace sent');
            }
        );
    };

    return (
        <div className="container mx-auto py-10">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-3xl">🔍 Sentry Verification</CardTitle>
                    <CardDescription>
                        Test error tracking and performance monitoring
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Status */}
                    <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm font-medium mb-2">Status</p>
                        {lastError ? (
                            <p className="text-sm text-green-600 dark:text-green-400">{lastError}</p>
                        ) : (
                            <p className="text-sm text-muted-foreground">Click a button to test Sentry</p>
                        )}
                    </div>

                    {/* Test Buttons */}
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm font-medium mb-2">Test 1: Basic Exception</p>
                            <Button onClick={testException} className="w-full">
                                Throw Test Error
                            </Button>
                        </div>

                        <div>
                            <p className="text-sm font-medium mb-2">Test 2: Capture Message</p>
                            <Button onClick={testMessage} variant="outline" className="w-full">
                                Send Test Message
                            </Button>
                        </div>

                        <div>
                            <p className="text-sm font-medium mb-2">Test 3: User Context</p>
                            <Button onClick={testWithUser} variant="outline" className="w-full">
                                Test with User Info
                            </Button>
                        </div>

                        <div>
                            <p className="text-sm font-medium mb-2">Test 4: Breadcrumbs</p>
                            <Button onClick={testBreadcrumbs} variant="outline" className="w-full">
                                Test Error with Breadcrumbs
                            </Button>
                        </div>

                        <div>
                            <p className="text-sm font-medium mb-2">Test 5: Performance</p>
                            <Button onClick={testPerformance} variant="outline" className="w-full">
                                Test Performance Trace
                            </Button>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-sm font-medium mb-2">📋 Instructions</p>
                        <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
                            <li>Click any test button above</li>
                            <li>Open your Sentry dashboard</li>
                            <li>Check the &quot;Issues&quot; tab for errors</li>
                            <li>Check the &quot;Performance&quot; tab for traces</li>
                            <li>Events should appear within 10-30 seconds</li>
                        </ol>
                    </div>

                    {/* Dashboard Link */}
                    <div className="text-center">
                        <a
                            href="https://o4510407588315136.sentry.io/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                        >
                            Open Sentry Dashboard →
                        </a>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
