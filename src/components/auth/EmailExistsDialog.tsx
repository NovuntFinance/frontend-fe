'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mail, ArrowRight, Key } from 'lucide-react';

interface EmailExistsDialogProps {
  open: boolean;
  onClose: () => void;
  email: string;
  canResetPassword: boolean;
  onLogin: () => void;
  onResetPassword: () => void;
}

export function EmailExistsDialog({
  open,
  onClose,
  email,
  canResetPassword,
  onLogin,
  onResetPassword,
}: EmailExistsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <DialogTitle>Account Already Exists</DialogTitle>
          </div>
          <DialogDescription className="space-y-3 text-left">
            <p>
              An account with <strong className="text-foreground">{email}</strong> is already registered.
            </p>
            <p className="text-sm">
              Did you forget that you already have an account? You can log in or reset your password.
            </p>
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto order-last sm:order-first"
          >
            Use Different Email
          </Button>
          
          {canResetPassword && (
            <Button
              variant="secondary"
              onClick={onResetPassword}
              className="w-full sm:w-auto gap-2"
            >
              <Key className="h-4 w-4" />
              Reset Password
            </Button>
          )}
          
          <Button
            onClick={onLogin}
            className="w-full sm:w-auto gap-2"
          >
            <ArrowRight className="h-4 w-4" />
            Log In
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

