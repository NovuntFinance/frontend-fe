/**
 * Example: Migrated Component Using All New Patterns
 * This demonstrates how to use all the new patterns together
 *
 * Use this as a reference when migrating components
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// New patterns imports
import { LoadingStates } from '@/components/ui/loading-states';
import { UserFriendlyError } from '@/components/errors/UserFriendlyError';
import { FormField } from '@/components/forms/FormField';
import { toast } from '@/components/ui/enhanced-toast';
import { EmptyStates } from '@/components/EmptyStates';
import { useResponsive, useResponsiveGrid } from '@/hooks/useResponsive';
import { Responsive, MobileOnly, DesktopOnly } from '@/utils/responsive';
import { fadeIn, slideUp, hoverAnimation } from '@/design-system/animations';
import { renderListState } from '@/utils/empty-state-helper';

// Example schema
const exampleSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
});

type ExampleFormData = z.infer<typeof exampleSchema>;

/**
 * Example Component Using All New Patterns
 */
export function MigratedComponentExample() {
  const router = useRouter();
  const { isMobile, isDesktop, breakpoint } = useResponsive();
  const columns = useResponsiveGrid(1, 2, 3);

  // Form setup
  const form = useForm<ExampleFormData>({
    resolver: zodResolver(exampleSchema),
  });

  // Data fetching
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['example-data'],
    queryFn: async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
      ];
    },
  });

  const onSubmit = async (formData: ExampleFormData) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Success toast with action
      toast.success('Form submitted successfully!', {
        description: 'Your data has been saved',
        action: {
          label: 'View Details',
          onClick: () => router.push('/details'),
        },
      });
    } catch (err) {
      // Error toast
      toast.error('Failed to submit form', {
        description: 'Please try again',
        action: {
          label: 'Retry',
          onClick: () => form.handleSubmit(onSubmit)(),
        },
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingStates.Card height="h-64" />
        <LoadingStates.Grid items={6} columns={columns} />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <UserFriendlyError
        error={error}
        onRetry={() => refetch()}
        variant="card"
      />
    );
  }

  return (
    <motion.div {...fadeIn(0.2)} className="space-y-6">
      {/* Responsive Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <motion.h1 {...slideUp(0.1)} className="text-2xl font-bold">
          Example Component
        </motion.h1>

        <Responsive breakpoint="mobile">
          <p className="text-muted-foreground text-sm">Mobile view</p>
        </Responsive>

        <DesktopOnly>
          <p className="text-muted-foreground text-sm">Desktop view</p>
        </DesktopOnly>
      </div>

      {/* Form Example */}
      <motion.div {...slideUp(0.2)}>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              name="name"
              label="Name"
              type="text"
              required
              placeholder="Enter your name"
            />

            <FormField
              name="email"
              label="Email"
              type="email"
              required
              placeholder="Enter your email"
              description="We'll never share your email"
            />

            <motion.button
              {...(hoverAnimation() as any)}
              type="submit"
              className="bg-primary text-primary-foreground rounded-lg px-4 py-2"
            >
              Submit
            </motion.button>
          </form>
        </FormProvider>
      </motion.div>

      {/* List Example with Empty State Helper */}
      <motion.div {...slideUp(0.3)}>
        {renderListState({
          items: data,
          isLoading: false,
          error: null,
          emptyState: (
            <EmptyStates.EmptyState
              title="No items found"
              description="Get started by adding your first item"
            />
          ),
          renderItem: (item) => (
            <div key={item.id} className="rounded-lg border p-4">
              {item.name}
            </div>
          ),
        })}
      </motion.div>

      {/* Responsive Grid Example */}
      <motion.div
        {...slideUp(0.4)}
        className={`grid gap-4 grid-cols-${columns}`}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            {...hoverAnimation()}
            className="rounded-lg border p-4"
          >
            Item {i + 1}
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
