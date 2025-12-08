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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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

const optionalTrimmedString = (max: number, message: string) =>
  z
    .string()
    .max(max, message)
    .transform((value) => {
      const trimmed = value.trim();
      return trimmed.length === 0 ? undefined : trimmed;
    })
    .optional();

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Create a New Stake
        </h1>
        <p className="text-muted-foreground">
          Choose the amount you would like to stake from your funded wallet.
          You&apos;ll earn weekly ROS credited to your earnings wallet until you
          double your stake.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Stake Details</CardTitle>
            <CardDescription>
              Complete the form below to launch your next staking cycle.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={handleSubmit} className="space-y-6">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount to Stake (USDT)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          inputMode="numeric"
                          min={stakingConfig.minAmount}
                          step={100}
                          placeholder={`Enter amount in USDT (min $${stakingConfig.minAmount.toLocaleString()})`}
                          disabled={isCreating}
                          value={
                            typeof field.value === 'number' ||
                            typeof field.value === 'string'
                              ? field.value
                              : ''
                          }
                          onChange={(event) =>
                            field.onChange(event.target.value)
                          }
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
                        <FormLabel>Goal Title (optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="E.g. New Laptop Fund"
                            disabled={isCreating}
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
                        <FormLabel>Goal Description (optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            rows={4}
                            placeholder="Describe what this stake will help you achieve"
                            disabled={isCreating}
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

                <div className="border-primary/40 bg-primary/5 flex flex-col gap-3 rounded-lg border border-dashed p-4 text-sm md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="text-primary h-10 w-10" />
                    <div>
                      <p className="font-medium">Security Notice</p>
                      <p className="text-muted-foreground">
                        Funds are locked for the duration of the stake. Early
                        withdrawals may incur penalties.
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-muted-foreground">
                      Powered by Novunt&apos;s staking engine
                    </p>
                    <p className="font-semibold">Target ROS: 100%</p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isCreating}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreating || walletLoading}>
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
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="text-primary h-5 w-5" />
                Funded Wallet
              </CardTitle>
              <CardDescription>
                Available balance you can stake from.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-3xl font-bold">
                {walletLoading ? 'Loading…' : formatCurrency(fundedBalance)}
              </p>
              <p className="text-muted-foreground text-sm">
                Ensure you have enough balance to cover the stake amount.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Projected Returns
              </CardTitle>
              <CardDescription>
                Estimated outcome based on {stakingConfig.goalTargetPercentage}%
                ROS target.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  Weekly ROS (approx)
                </span>
                <span className="font-medium text-green-600">
                  {formatCurrency(projectedDailyROS || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Completion Value</span>
                <span className="font-semibold">
                  {formatCurrency(projectedCompletionValue || 0)}
                </span>
              </div>
              <div className="bg-muted text-muted-foreground rounded-md p-3 text-xs">
                Calculations assume a typical ROS schedule. Actual payout
                frequency is confirmed in the staking agreement.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
