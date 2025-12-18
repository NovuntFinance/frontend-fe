/**
 * Onboarding Flow for New Users
 * Guides users through initial setup and key features
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  CheckCircle2,
  User,
  Wallet,
  TrendingUp,
  Award,
  ArrowRight,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action?: {
    label: string;
    href: string;
  };
  completed: boolean;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  // Check which steps are completed
  useEffect(() => {
    const completed = new Set<string>();

    // Step 1: Profile completion
    if (user?.firstName && user?.lastName && user?.phoneNumber) {
      completed.add('profile');
    }

    // Step 2: First deposit (check if user has made any deposit)
    // This would need to check wallet balance or transaction history
    // For now, we'll mark as incomplete if balance is 0
    if (user && (user as any).walletBalance > 0) {
      completed.add('deposit');
    }

    // Step 3: First stake (check if user has created any stake)
    // This would need to check stakes count
    // For now, we'll leave as incomplete

    // Step 4: Explore features - always available
    completed.add('explore');

    setCompletedSteps(completed);
  }, [user]);

  const steps: OnboardingStep[] = [
    {
      id: 'profile',
      title: 'Complete Your Profile',
      description: 'Add your personal information to get started',
      icon: User,
      action: {
        label: 'Complete Profile',
        href: '/dashboard',
      },
      completed: completedSteps.has('profile'),
    },
    {
      id: 'deposit',
      title: 'Make Your First Deposit',
      description: 'Add funds to your wallet to start staking',
      icon: Wallet,
      action: {
        label: 'Deposit Funds',
        href: '/dashboard/wallets',
      },
      completed: completedSteps.has('deposit'),
    },
    {
      id: 'stake',
      title: 'Create Your First Stake',
      description: 'Set a goal and start earning returns',
      icon: TrendingUp,
      action: {
        label: 'Create Stake',
        href: '/dashboard/stakes/new',
      },
      completed: false, // Would check from API
    },
    {
      id: 'explore',
      title: 'Explore Features',
      description: 'Discover achievements, pools, and team features',
      icon: Award,
      action: {
        label: 'Explore Dashboard',
        href: '/dashboard',
      },
      completed: completedSteps.has('explore'),
    },
  ];

  const handleSkip = () => {
    localStorage.setItem('novunt-onboarding-completed', 'true');
    router.push('/dashboard');
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem('novunt-onboarding-completed', 'true');
    router.push('/dashboard');
  };

  const handleAction = (href: string) => {
    router.push(href);
  };

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-background p-4 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-950">
      <Card className="w-full max-w-2xl border-white/20 bg-white/10 p-8 backdrop-blur-2xl dark:border-white/10 dark:bg-white/8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome to Novunt!</h1>
            <p className="mt-2 text-muted-foreground">
              Let&apos;s get you started in just a few steps
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSkip}
            aria-label="Skip onboarding"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Current Step Content */}
        <div className="mb-8 text-center">
          <div
            className={cn(
              'mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 transition-all',
              currentStepData.completed
                ? 'border-success bg-success/10'
                : 'border-primary bg-primary/10'
            )}
          >
            {currentStepData.completed ? (
              <CheckCircle2 className="h-10 w-10 text-success" />
            ) : (
              <Icon className="h-10 w-10 text-primary" />
            )}
          </div>

          <h2 className="mb-2 text-2xl font-semibold">{currentStepData.title}</h2>
          <p className="text-muted-foreground">{currentStepData.description}</p>

          {currentStepData.completed && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-success/10 px-4 py-2 text-sm text-success">
              <CheckCircle2 className="h-4 w-4" />
              Completed
            </div>
          )}
        </div>

        {/* Step Indicators */}
        <div className="mb-8 grid grid-cols-4 gap-2">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = step.completed || index < currentStep;

            return (
              <button
                key={step.id}
                onClick={() => setCurrentStep(index)}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-lg border p-3 transition-all',
                  isActive
                    ? 'border-primary bg-primary/10'
                    : isCompleted
                      ? 'border-success/50 bg-success/5'
                      : 'border-muted bg-muted/50',
                  'hover:border-primary/50'
                )}
                aria-label={`Go to step ${index + 1}: ${step.title}`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : (
                  <StepIcon
                    className={cn(
                      'h-5 w-5',
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    )}
                  />
                )}
                <span
                  className={cn(
                    'text-xs',
                    isActive ? 'font-medium text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {step.title.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          {currentStepData.action && (
            <Button
              onClick={() => handleAction(currentStepData.action!.href)}
              className="flex-1"
              size="lg"
            >
              {currentStepData.action.label}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          <Button
            onClick={currentStep === steps.length - 1 ? handleComplete : handleNext}
            variant={currentStepData.action ? 'outline' : 'default'}
            size="lg"
            className={currentStepData.action ? '' : 'flex-1'}
          >
            {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
            {currentStep < steps.length - 1 && (
              <ArrowRight className="ml-2 h-4 w-4" />
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}

