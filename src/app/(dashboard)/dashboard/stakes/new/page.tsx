'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { ShieldCheck, TrendingUp, Wallet } from 'lucide-react';
import { NovuntSpinner } from '@/components/ui/novunt-spinner';
import { useCreateStake } from '@/lib/mutations';
import { useWallet } from '@/hooks/useWallet';
import { formatCurrency } from '@/lib/utils';
import { useStakingConfig } from '@/hooks/useStakingConfig';
import {
  NEU_TOKENS,
  neuInset,
  neuRaised,
  neuRadius,
} from '@/components/rank-progress/neumorphicTokens';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';

const optionalTrimmedString = (max: number, message: string) =>
  z
    .string()
    .max(max, message)
    .transform((value) => {
      const trimmed = value.trim();
      return trimmed.length === 0 ? undefined : trimmed;
    })
    .optional();

export default function CreateStakePage() {
  const router = useRouter();
  const { balances, isLoading: walletLoading } = useWallet();
  const { mutateAsync: createStake, isPending: isCreating } = useCreateStake();

  // Get staking config from dynamic config system
  const stakingConfig = useStakingConfig();

  // Create schema with dynamic min/max values
  const createStakeSchema = z.object({
    amount: z.coerce
      .number()
      .positive('Amount must be greater than 0')
      .min(
        stakingConfig.minAmount,
        `Minimum stake amount is $${stakingConfig.minAmount.toLocaleString()}`
      )
      .max(
        stakingConfig.maxAmount,
        `Maximum stake amount is $${stakingConfig.maxAmount.toLocaleString()}`
      ),
    goalTitle: optionalTrimmedString(
      60,
      'Goal title should be 60 characters or less'
    ),
    goalDescription: optionalTrimmedString(
      240,
      'Goal description should be 240 characters or less'
    ),
  });

  type CreateStakeFormSchema = typeof createStakeSchema;
  type CreateStakeFormInputs = z.input<CreateStakeFormSchema>;
  type CreateStakeFormValues = z.output<CreateStakeFormSchema>;

  const form = useForm<CreateStakeFormInputs, unknown, CreateStakeFormValues>({
    resolver: zodResolver(createStakeSchema),
    defaultValues: {
      amount: 10000,
      goalTitle: '',
      goalDescription: '',
    },
  });

  const fundedBalance = balances?.funded?.availableBalance ?? 0;
  const amountInput = form.watch('amount');
  const amount = useMemo(() => Number(amountInput) || 0, [amountInput]);

  // Use dynamic config values for calculations
  const weeklyROIPercentage = stakingConfig.weeklyReturnPercentage / 100;
  const projectedDailyROS = useMemo(
    () => amount * (weeklyROIPercentage / 7),
    [amount, weeklyROIPercentage]
  );
  const projectedCompletionValue = useMemo(
    () => amount * (stakingConfig.goalTargetPercentage / 100),
    [amount, stakingConfig.goalTargetPercentage]
  );

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      await createStake({
        amount: values.amount,
        walletType: 'funded',
        goalTitle: values.goalTitle,
        goalDescription: values.goalDescription,
      });

      router.push('/dashboard/stakes');
    } catch (error) {
      // Errors are handled by the mutation toast, so we only keep the UX responsive here
      console.error(error);
    }
  });

  const neuPanelStyle: React.CSSProperties = {
    background: NEU_TOKENS.bg,
    boxShadow: neuInset,
    border: `1px solid ${NEU_TOKENS.border}`,
    borderRadius: neuRadius.lg,
  };
  const neuRaisedStyle: React.CSSProperties = {
    background: NEU_TOKENS.bg,
    boxShadow: neuRaised,
    border: `1px solid ${NEU_TOKENS.border}`,
    borderRadius: neuRadius.md,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h1
          className="text-3xl font-bold tracking-tight"
          style={{ color: NEU_TOKENS.accent }}
        >
          Create a New Stake
        </h1>
        <p className="text-sm" style={{ color: NEU_TOKENS.white60 }}>
          Choose the amount you would like to stake from your deposit wallet.
          You&apos;ll earn weekly ROS credited to your Earnings Wallet until you
          reach {stakingConfig.goalTargetPercentage}% return.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="rounded-2xl p-6 lg:p-8" style={neuPanelStyle}>
          <h2
            className="text-lg font-bold"
            style={{ color: NEU_TOKENS.white80 }}
          >
            Stake Details
          </h2>
          <p className="mt-1 text-sm" style={{ color: NEU_TOKENS.white60 }}>
            Complete the form below to launch your next staking cycle.
          </p>
          <Form {...form}>
            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: NEU_TOKENS.white60 }}>
                      Amount to Stake (USDT)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="numeric"
                        min={stakingConfig.minAmount}
                        step={100}
                        placeholder={`Enter amount (min $${stakingConfig.minAmount.toLocaleString()})`}
                        disabled={isCreating}
                        className={cn(
                          'border-0 focus-visible:ring-2 focus-visible:ring-offset-0',
                          'placeholder:opacity-60'
                        )}
                        style={{
                          background: NEU_TOKENS.bg,
                          boxShadow: neuInset,
                          border: `1px solid ${NEU_TOKENS.border}`,
                          borderRadius: neuRadius.md,
                          color: NEU_TOKENS.white80,
                        }}
                        value={
                          typeof field.value === 'number' ||
                          typeof field.value === 'string'
                            ? field.value
                            : ''
                        }
                        onChange={(event) => field.onChange(event.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="goalTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ color: NEU_TOKENS.white60 }}>
                        Goal Title (optional)
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="E.g. New Laptop Fund"
                          disabled={isCreating}
                          className="border-0 focus-visible:ring-2 focus-visible:ring-offset-0"
                          style={{
                            background: NEU_TOKENS.bg,
                            boxShadow: neuInset,
                            border: `1px solid ${NEU_TOKENS.border}`,
                            borderRadius: neuRadius.md,
                            color: NEU_TOKENS.white80,
                          }}
                          value={
                            typeof field.value === 'string' ? field.value : ''
                          }
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="goalDescription"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel style={{ color: NEU_TOKENS.white60 }}>
                        Goal Description (optional)
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder="Describe what this stake will help you achieve"
                          disabled={isCreating}
                          className="resize-none border-0 focus-visible:ring-2 focus-visible:ring-offset-0"
                          style={{
                            background: NEU_TOKENS.bg,
                            boxShadow: neuInset,
                            border: `1px solid ${NEU_TOKENS.border}`,
                            borderRadius: neuRadius.md,
                            color: NEU_TOKENS.white80,
                          }}
                          value={
                            typeof field.value === 'string' ? field.value : ''
                          }
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div
                className="flex flex-col gap-3 rounded-xl p-4 text-sm md:flex-row md:items-center md:justify-between"
                style={{
                  ...neuRaisedStyle,
                  borderColor: 'rgba(0, 155, 242, 0.2)',
                }}
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck
                    className="size-8 shrink-0"
                    style={{ color: NEU_TOKENS.accent }}
                  />
                  <div>
                    <p
                      className="font-medium"
                      style={{ color: NEU_TOKENS.white80 }}
                    >
                      Security Notice
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: NEU_TOKENS.white60 }}
                    >
                      Funds are locked until you reach{' '}
                      {stakingConfig.goalTargetPercentage}% return. Early
                      withdrawals may incur penalties.
                    </p>
                  </div>
                </div>
                <div className="text-right text-sm">
                  <p style={{ color: NEU_TOKENS.white60 }}>
                    Target return: {stakingConfig.goalTargetPercentage}%
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isCreating}
                  className="border-0"
                  style={neuRaisedStyle}
                >
                  <span style={{ color: NEU_TOKENS.white60 }}>Cancel</span>
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating || walletLoading}
                  className="border-0 font-bold"
                  style={{
                    ...neuRaisedStyle,
                    color: NEU_TOKENS.accent,
                  }}
                >
                  {isCreating ? (
                    <>
                      <NovuntSpinner size="sm" className="mr-2" />
                      Creating Stake
                    </>
                  ) : (
                    'Create Stake'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl p-6" style={neuPanelStyle}>
            <div className="flex items-center gap-2">
              <Wallet className="size-5" style={{ color: NEU_TOKENS.accent }} />
              <h3
                className="text-base font-bold"
                style={{ color: NEU_TOKENS.white80 }}
              >
                Deposit Wallet
              </h3>
            </div>
            <p className="mt-1 text-sm" style={{ color: NEU_TOKENS.white60 }}>
              Available balance you can stake from.
            </p>
            <p
              className="mt-4 text-2xl font-bold"
              style={{ color: NEU_TOKENS.accent }}
            >
              {walletLoading ? 'Loading…' : formatCurrency(fundedBalance)}
            </p>
            <p className="mt-2 text-xs" style={{ color: NEU_TOKENS.white40 }}>
              Ensure you have enough balance to cover the stake amount.
            </p>
          </div>

          <div className="rounded-2xl p-6" style={neuPanelStyle}>
            <div className="flex items-center gap-2">
              <TrendingUp
                className="size-5"
                style={{ color: NEU_TOKENS.accent }}
              />
              <h3
                className="text-base font-bold"
                style={{ color: NEU_TOKENS.white80 }}
              >
                Projected Returns
              </h3>
            </div>
            <p className="mt-1 text-sm" style={{ color: NEU_TOKENS.white60 }}>
              Estimated outcome based on {stakingConfig.goalTargetPercentage}%
              return target.
            </p>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span style={{ color: NEU_TOKENS.white60 }}>
                  Weekly ROS (approx)
                </span>
                <span
                  className="font-medium"
                  style={{ color: NEU_TOKENS.accent }}
                >
                  {formatCurrency(projectedDailyROS || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span style={{ color: NEU_TOKENS.white60 }}>
                  Completion Value
                </span>
                <span
                  className="font-semibold"
                  style={{ color: NEU_TOKENS.white80 }}
                >
                  {formatCurrency(projectedCompletionValue || 0)}
                </span>
              </div>
              <div
                className="rounded-lg p-3 text-xs"
                style={{ color: NEU_TOKENS.white40, ...neuRaisedStyle }}
              >
                Calculations assume a typical ROS schedule. Actual payout
                frequency is confirmed in the staking agreement.
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
