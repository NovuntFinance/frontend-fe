/**
 * Example Component Using New Design Patterns
 * Demonstrates usage of design tokens, loading states, and accessibility
 * 
 * This is a reference implementation - delete after reviewing
 */

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { designTokens, getSpacing, getBorderRadius } from '@/design-system/tokens';
import { LoadingStates } from '@/components/ui/loading-states';
import { useAnnounce, useId } from '@/hooks/useAccessibility';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Example: Component using design tokens
export function ExampleCard() {
  const cardId = useId('example-card');
  const [isLoading, setIsLoading] = useState(false);
  
  // Use accessibility hook for announcements
  useAnnounce(isLoading ? 'Loading data...' : 'Data loaded', 'polite');

  return (
    <Card
      id={cardId}
      className={cn(
        // Using design tokens via Tailwind (matching token values)
        'p-6', // matches spacing.md (1rem)
        'rounded-lg', // matches borderRadius.lg (1.5rem)
        'shadow-md', // matches shadows.md
      )}
      style={{
        // Or use tokens directly if needed
        // padding: getSpacing('lg'),
        // borderRadius: getBorderRadius('lg'),
      }}
      aria-label="Example card demonstrating design tokens"
    >
      <CardHeader>
        <CardTitle>Example Card</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingStates.Inline message="Loading..." />
        ) : (
          <p>Content loaded successfully!</p>
        )}
      </CardContent>
    </Card>
  );
}

// Example: List component with loading state
export function ExampleList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['example-data'],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      return [{ id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }];
    },
  });

  if (isLoading) {
    return <LoadingStates.List lines={3} />;
  }

  if (error) {
    return <div>Error loading data</div>;
  }

  return (
    <ul className="space-y-2">
      {data?.map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}

// Example: Button with loading state
export function ExampleButton() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const buttonId = useId('example-button');

  const handleClick = async () => {
    setIsSubmitting(true);
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
  };

  return (
    <Button
      id={buttonId}
      onClick={handleClick}
      disabled={isSubmitting}
      aria-label="Submit form"
      aria-busy={isSubmitting}
    >
      {isSubmitting ? (
        <>
          <LoadingStates.Button size="sm" />
          <span className="ml-2">Submitting...</span>
        </>
      ) : (
        'Submit'
      )}
    </Button>
  );
}

