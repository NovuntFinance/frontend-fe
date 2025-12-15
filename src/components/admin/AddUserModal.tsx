'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateUser } from '@/lib/mutations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fname: z.string().min(1, 'First name is required'),
  lname: z.string().min(1, 'Last name is required'),
  phoneNumber: z.string().optional(),
  countryCode: z.string().optional(),
  referralCode: z.string().optional(),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

interface AddUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddUserModal({ open, onOpenChange }: AddUserModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const createUserMutation = useCreateUser();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
  });

  const onSubmit = async (data: CreateUserFormData) => {
    setIsLoading(true);
    try {
      await createUserMutation.mutateAsync(data);
      reset();
      onOpenChange(false);
    } catch (error) {
      // Error is handled by mutation
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new user account. The user will receive an email to verify
            their account.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fname">First Name *</Label>
              <Input
                id="fname"
                {...register('fname')}
                placeholder="John"
                disabled={isLoading}
              />
              {errors.fname && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.fname.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="lname">Last Name *</Label>
              <Input
                id="lname"
                {...register('lname')}
                placeholder="Doe"
                disabled={isLoading}
              />
              {errors.lname && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.lname.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="user@example.com"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              {...register('username')}
              placeholder="johndoe"
              disabled={isLoading}
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-500">
                {errors.username.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              {...register('password')}
              placeholder="Minimum 8 characters"
              disabled={isLoading}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="countryCode">Country Code</Label>
              <Input
                id="countryCode"
                {...register('countryCode')}
                placeholder="+1"
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                {...register('phoneNumber')}
                placeholder="1234567890"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="referralCode">Referral Code (Optional)</Label>
            <Input
              id="referralCode"
              {...register('referralCode')}
              placeholder="ABC123"
              disabled={isLoading}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
