# New Frontend Task: Registration Bonus Gradual Payout Integration

## Date: November 18, 2025

---

## 🎯 Overview

The backend team has implemented a **Registration Bonus Gradual Payout System** that we didn't previously know about. This is a NEW feature that needs frontend integration.

### What Changed in Backend?

**Before:**
- $100 bonus → Created a $100 bonus stake immediately

**After:**
- $100 bonus → Pays out gradually with each weekly ROS distribution
- Example: If platform declares 5% ROS this week, user gets $5 from bonus (5% of $100)
- Bonus depletes over time until fully paid out

---

## 📋 Frontend Tasks Required

### 1. Update BonusActivatedCard Component ✅ (Partially Done)

**Current Status:** We show bonus amount but not tracking/depletion

**Required Updates:**

```typescript
// src/components/registration-bonus/BonusActivatedCard.tsx

interface BonusData {
  bonusAmount: number;
  bonusPaidOut: number;        // NEW - Add this
  remainingBonus: number;      // NEW - Add this
  status: string;
  activatedAt?: string;        // NEW - Add this
  completedAt?: string;        // NEW - Add this
}

// Add progress tracking display
<div className="bonus-progress">
  <div className="progress-stats">
    <div>
      <label>Total Bonus</label>
      <span>${bonusData.bonusAmount.toFixed(2)}</span>
    </div>
    <div>
      <label>Paid Out So Far</label>
      <span className="text-emerald-600">${bonusData.bonusPaidOut.toFixed(2)}</span>
    </div>
    <div>
      <label>Remaining</label>
      <span>${bonusData.remainingBonus.toFixed(2)}</span>
    </div>
  </div>
  
  {/* Progress bar */}
  <div className="h-2 bg-gray-200 rounded-full">
    <div 
      className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"
      style={{ width: `${(bonusData.bonusPaidOut / bonusData.bonusAmount) * 100}%` }}
    />
  </div>
  
  <p className="text-sm text-gray-600">
    {((bonusData.bonusPaidOut / bonusData.bonusAmount) * 100).toFixed(1)}% received
  </p>
</div>
```

### 2. Create BonusPayoutHistory Component (NEW)

**Location:** `src/components/registration-bonus/BonusPayoutHistory.tsx`

```typescript
'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BonusPayout {
  _id: string;
  week: number;
  payoutDate: string;
  declaredROSPercentage: number;
  bonusAmountPaid: number;
  remainingAfterPayout: number;
  status: 'completed' | 'pending' | 'failed';
}

interface PayoutHistoryResponse {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  payouts: BonusPayout[];
}

export function BonusPayoutHistory() {
  const [history, setHistory] = useState<PayoutHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchHistory();
  }, [page]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/v1/registration-bonus/payout-history?page=${page}&limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setHistory(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch payout history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!history || history.payouts.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-600">No bonus payouts yet. Complete your first stake to activate!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          Bonus Payout History
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Weekly bonus distributions based on ROS declarations
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {history.payouts.map((payout, index) => (
            <motion.div
              key={payout._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Week {payout.week}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {new Date(payout.payoutDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {payout.declaredROSPercentage.toFixed(2)}% ROS
                  </span>
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  +${payout.bonusAmountPaid.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">
                  Remaining: ${payout.remainingAfterPayout.toFixed(2)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pagination */}
        {history.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {history.totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(history.totalPages, p + 1))}
              disabled={page === history.totalPages}
              className="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

### 3. Update TypeScript Interfaces

**Location:** `src/types/registrationBonus.ts`

```typescript
// Add new fields to existing BonusData interface
export interface BonusData {
  bonusAmount: number;
  bonusPaidOut: number;        // NEW
  remainingBonus: number;      // NEW
  status: 'pending' | 'requirements_met' | 'bonus_active' | 'expired' | 'completed';
  activatedAt?: string;        // NEW
  completedAt?: string;        // NEW
  expiresAt: string;
  requirementsMet: boolean;
  firstStakeAmount?: number;
  createdAt: string;
  weeklyPayoutCount?: number;  // NEW
  lastPayoutDate?: string;     // NEW
  nextPayoutDate?: string;     // NEW
}

// NEW interface for payout history
export interface BonusPayout {
  _id: string;
  userId: string;
  registrationBonusId: string;
  week: number;
  payoutDate: string;
  declaredROSPercentage: number;
  bonusAmountPaid: number;
  remainingAfterPayout: number;
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
}

export interface BonusPayoutHistoryResponse {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  payouts: BonusPayout[];
}
```

### 4. Update API Queries

**Location:** `src/lib/queries/registrationBonusQueries.ts`

Add new query for payout history:

```typescript
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { BonusPayoutHistoryResponse } from '@/types/registrationBonus';

export const bonusQueryKeys = {
  status: ['registration-bonus', 'status'] as const,
  payoutHistory: (page: number) => ['registration-bonus', 'payout-history', page] as const,
};

export function useBonusPayoutHistory(page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: bonusQueryKeys.payoutHistory(page),
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: BonusPayoutHistoryResponse }>(
        `/registration-bonus/payout-history?page=${page}&limit=${limit}`
      );
      return response.data;
    },
    staleTime: 60 * 1000, // 1 minute
  });
}
```

### 5. Add to Dashboard Page

**Location:** `src/app/(dashboard)/dashboard/bonus/page.tsx` (create if doesn't exist)

```typescript
'use client';

import React from 'react';
import { BonusActivatedCard } from '@/components/registration-bonus/BonusActivatedCard';
import { BonusPayoutHistory } from '@/components/registration-bonus/BonusPayoutHistory';
import { useRegistrationBonusStatus } from '@/lib/queries/registrationBonusQueries';

export default function BonusPage() {
  const { data: bonusData, isLoading } = useRegistrationBonusStatus();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Registration Bonus</h1>
      
      {bonusData?.bonus && (
        <>
          <BonusActivatedCard bonusData={bonusData.bonus} />
          
          {bonusData.bonus.status === 'bonus_active' && (
            <BonusPayoutHistory />
          )}
        </>
      )}
    </div>
  );
}
```

---

## 🎨 UI/UX Enhancements

### Bonus Status Badge

Add visual indicators for bonus status:

```typescript
function getBonusStatusBadge(status: string) {
  const badges = {
    'pending': { color: 'gray', text: 'Pending', icon: '⏳' },
    'requirements_met': { color: 'yellow', text: 'Ready to Activate', icon: '✨' },
    'bonus_active': { color: 'green', text: 'Active', icon: '✅' },
    'completed': { color: 'blue', text: 'Completed', icon: '🎉' },
    'expired': { color: 'red', text: 'Expired', icon: '❌' },
  };
  
  const badge = badges[status] || badges.pending;
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${badge.color}-100 text-${badge.color}-700`}>
      {badge.icon} {badge.text}
    </span>
  );
}
```

### Progress Animation

```typescript
<motion.div
  initial={{ width: 0 }}
  animate={{ width: `${progressPercentage}%` }}
  transition={{ duration: 1, ease: 'easeOut' }}
  className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"
/>
```

---

## 📊 Backend API Reference (From Backend Docs)

### Enhanced Bonus Status Endpoint

```
GET /api/v1/registration-bonus/status
```

**New Response Fields:**
```json
{
  "success": true,
  "bonus": {
    "bonusAmount": 100.00,
    "bonusPaidOut": 15.50,        // ← NEW
    "remainingBonus": 84.50,      // ← NEW
    "status": "bonus_active",
    "activatedAt": "2025-11-10T00:00:00Z",  // ← NEW
    "completedAt": null,          // ← NEW
    "weeklyPayoutCount": 3,       // ← NEW
    "lastPayoutDate": "2025-11-18T00:00:00Z",  // ← NEW
    "nextPayoutDate": "2025-11-25T00:00:00Z"   // ← NEW
  }
}
```

### New Payout History Endpoint

```
GET /api/v1/registration-bonus/payout-history?page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalItems": 25,
    "totalPages": 3,
    "currentPage": 1,
    "payouts": [
      {
        "_id": "673b4f2e...",
        "week": 3,
        "payoutDate": "2025-11-18T00:00:00.000Z",
        "declaredROSPercentage": 5.5,
        "bonusAmountPaid": 5.50,
        "remainingAfterPayout": 84.50,
        "status": "completed"
      }
    ]
  }
}
```

---

## ✅ Implementation Checklist

### Phase 1: Update Existing Components
- [ ] Update `BonusActivatedCard` to show progress tracking
- [ ] Update TypeScript interfaces in `registrationBonus.ts`
- [ ] Update `useRegistrationBonusStatus` query to handle new fields

### Phase 2: Create New Components
- [ ] Create `BonusPayoutHistory.tsx` component
- [ ] Create `useBonusPayoutHistory` query hook
- [ ] Create bonus dashboard page (optional)

### Phase 3: Testing
- [ ] Test bonus status with new fields
- [ ] Test payout history pagination
- [ ] Test progress bar calculations
- [ ] Test with completed bonuses
- [ ] Test with active bonuses

### Phase 4: UI Polish
- [ ] Add animations to progress bars
- [ ] Add status badges
- [ ] Add loading states
- [ ] Add empty states
- [ ] Add error handling

---

## 🚀 Priority

**Priority:** MEDIUM-HIGH

- Not blocking deployment (existing bonus still works)
- Improves user experience significantly
- Shows transparency in bonus distribution
- Backend is already deployed and waiting

---

## 📝 Summary

The backend has implemented a sophisticated gradual payout system for registration bonuses. We need to:

1. ✅ **Quick Win**: Update `BonusActivatedCard` to show progress (1-2 hours)
2. ⭐ **Main Task**: Create `BonusPayoutHistory` component (2-3 hours)
3. ✅ **Integration**: Wire up new API endpoints (1 hour)
4. ✅ **Polish**: Add animations and status badges (1-2 hours)

**Total Estimated Time:** 5-8 hours

**Benefit:** Better user transparency, improved engagement, professional bonus tracking system
