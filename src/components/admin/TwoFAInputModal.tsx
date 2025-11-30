'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface TwoFAInputModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (code: string) => void;
  title?: string;
  description?: string;
}

export function TwoFAInputModal({
  open,
  onClose,
  onConfirm,
  title = 'Two-Factor Authentication',
  description = 'Enter the 6-digit code from your authenticator app',
}: TwoFAInputModalProps) {
  const [code, setCode] = useState('');

  // Reset code when modal opens/closes
  useEffect(() => {
    if (open) {
      setCode('');
    }
  }, [open]);

  const handleSubmit = () => {
    if (code.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    onConfirm(code);
    setCode('');
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && code.length === 6) {
      handleSubmit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            type="text"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            className="text-center text-2xl tracking-widest"
            autoFocus
            onKeyDown={handleKeyDown}
          />
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={code.length !== 6}
              className="flex-1"
            >
              Confirm
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
