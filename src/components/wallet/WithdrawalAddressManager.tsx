'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  Lock,
  Check,
  Edit,
  Info,
  Shield,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Copy,
  CheckCircle2,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
// Note: we previously used Radix Collapsible here, but for reliability on all devices
// we're now using a simple local `isOpen` state toggle instead.
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
// NOTE: This component is no longer used now that withdrawal address
// security and moratorium features have been removed from the wallet UI.
// It is kept as a no-op placeholder to avoid breaking imports while the
// feature is fully retired from the backend.
export function WithdrawalAddressManager() {
  return null;
}
