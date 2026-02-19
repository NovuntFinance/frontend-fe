'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useForm, type SubmitHandler, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { formatDistanceToNow } from 'date-fns';
import { Copy, Loader2, QrCode } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useInitiateDeposit } from '@/lib/mutations';
import type { InitiateDepositResponse } from '@/types/wallet';
import { cn, formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

const depositSchema = z.object({
  amount: z.coerce.number().min(10, 'Minimum deposit is 10 USDT'),
});

type DepositFormValues = z.infer<typeof depositSchema>;

interface DepositDialogProps {
  trigger: ReactNode;
  className?: string;
}

export function DepositDialog({ trigger, className }: DepositDialogProps) {
  const [open, setOpen] = useState(false);
  const [depositDetails, setDepositDetails] =
    useState<InitiateDepositResponse | null>(null);
  const initiateDeposit = useInitiateDeposit();

  const form = useForm<DepositFormValues>({
    resolver: zodResolver(depositSchema) as Resolver<DepositFormValues>,
    defaultValues: { amount: 100 },
  });

  useEffect(() => {
    if (!open) {
      setDepositDetails(null);
      form.reset();
    }
  }, [open, form]);

  const expiresLabel = useMemo(() => {
    if (!depositDetails?.expiresAt) return null;
    try {
      return formatDistanceToNow(new Date(depositDetails.expiresAt), {
        addSuffix: true,
      });
    } catch {
      return null;
    }
  }, [depositDetails?.expiresAt]);

  const onSubmit: SubmitHandler<DepositFormValues> = async (values) => {
    try {
      const result = await initiateDeposit.mutateAsync({
        amount: values.amount,
        currency: 'USDT',
      });
      setDepositDetails(result);
    } catch (error) {
      // `useInitiateDeposit` already handles toast notifications
      console.error('Deposit initialization failed', error);
    }
  };

  const handleCopy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`, {
        description: 'Paste it into your preferred wallet to continue.',
      });
    } catch {
      toast.error('Unable to copy', {
        description: 'Please copy the value manually.',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className={cn('sm:max-w-xl', className)}>
        <DialogHeader>
          <DialogTitle>Deposit USDT</DialogTitle>
          <DialogDescription>
            Generate a unique deposit address to top up your funded wallet.
          </DialogDescription>
        </DialogHeader>

        {!depositDetails && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (USDT)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={10}
                        step="1"
                        placeholder="Enter deposit amount"
                        disabled={initiateDeposit.isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={initiateDeposit.isPending}
              >
                {initiateDeposit.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Generate Deposit Address
              </Button>

              <p className="text-muted-foreground text-center text-xs">
                You&apos;ll receive a unique USDT (BEP20) address. Send the
                exact amount within one hour to avoid expiration.
              </p>
            </form>
          </Form>
        )}

        {depositDetails && (
          <div className="space-y-5">
            <div className="bg-muted/40 rounded-lg border p-4">
              <p className="text-muted-foreground text-sm">Amount</p>
              <p className="text-2xl font-semibold">
                {formatCurrency(depositDetails.amount, 'USDT')}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                Network: BEP20 (Binance Smart Chain)
              </p>
              {expiresLabel && (
                <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                  Expires {expiresLabel}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Deposit Address</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(depositDetails.address, 'Address')}
                >
                  <Copy className="mr-2 h-4 w-4" /> Copy
                </Button>
              </div>
              <code className="bg-muted block rounded-md px-3 py-2 text-sm break-words">
                {depositDetails.address}
              </code>
            </div>

            {depositDetails.qrCode && (
              <div className="space-y-2 text-center">
                <p className="flex items-center justify-center gap-2 text-sm font-medium">
                  <QrCode className="h-4 w-4" /> Scan QR Code
                </p>
                <div className="mx-auto inline-flex rounded-lg border bg-white p-3 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={depositDetails.qrCode}
                    alt="USDT deposit QR code"
                    className="h-40 w-40 object-contain"
                  />
                </div>
              </div>
            )}

            <div className="rounded-lg border border-amber-200/70 bg-amber-50/60 p-4 text-sm leading-relaxed dark:border-amber-500/40 dark:bg-amber-500/10">
              <ul className="space-y-2">
                <li>
                  • Only send USDT on the BEP20 (Binance Smart Chain) network to
                  this address.
                </li>
                <li>
                  • Deposits are credited automatically after blockchain
                  confirmation.
                </li>
                <li>
                  • Sending a different token or amount may result in loss of
                  funds.
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-between gap-2">
              <Button
                variant="outline"
                onClick={() => setDepositDetails(null)}
                className="flex-1"
              >
                Start New Deposit
              </Button>
              <Button className="flex-1" onClick={() => setOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
