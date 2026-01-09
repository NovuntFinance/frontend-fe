# Frontend Implementation: Three-Pool Daily Declaration System

**Date**: January 9, 2026  
**Priority**: 🟡 **MEDIUM** - Blocked by Backend Implementation  
**Status**: ⏳ **WAITING FOR BACKEND** - Frontend changes documented, ready to implement

---

## 📋 Executive Summary

Once the backend integrates Pool Declaration (dollar amounts) with Daily Profit (ROS percentage) ([BACKEND_THREE_POOL_DAILY_DECLARATION_SPECIFICATION.md](./BACKEND_THREE_POOL_DAILY_DECLARATION_SPECIFICATION.md)), the frontend needs to be updated to:

1. Display two dollar amount inputs (Premium Pool, Performance Pool) and one percentage input (ROS)
2. Show pool amounts and ROS percentage in the calendar view
3. Display pool amounts and ROS percentage in the declared profits list
4. Update types and API calls

**Key Insight:** Premium and Performance pools use **DOLLAR AMOUNTS** (not percentages), while only ROS uses a percentage.

---

## 🎯 What Needs to Change

### Current UI (Single Percentage):

```
┌─────────────────────────────────────┐
│  Declare Daily Profit               │
├─────────────────────────────────────┤
│  Date: 2026-01-09                   │
│                                     │
│  Profit Percentage: [0.55] %        │  ← Single ROS input
│                                     │
│  Description: [..................]  │
│                                     │
│  [Cancel]  [Declare Profit]         │
└─────────────────────────────────────┘
```

### Required UI (Two Dollar Amounts + One Percentage):

```
┌─────────────────────────────────────┐
│  Declare Daily Profit               │
├─────────────────────────────────────┤
│  Date: 2026-01-09                   │
│                                     │
│  Premium Pool:      [$10,000]       │  ← Dollar input
│  Performance Pool:  [$5,000]        │  ← Dollar input
│  ROS Percentage:    [0.55] %        │  ← Percentage input
│  ─────────────────────────────      │
│  Total Pool Amount: $15,000         │  ← Sum of pools
│                                     │
│  Description: [..................]  │
│                                     │
│  [Cancel]  [Declare Profit]         │
└─────────────────────────────────────┘
```

---

## 📁 Files to Update

### 1. TypeScript Types

**File:** `src/types/dailyProfit.ts`

**Current:**

```typescript
export interface DailyProfit {
  id: string;
  date: string;
  profitPercentage: number; // Single percentage
  description?: string;
  // ... other fields
}

export interface DeclareProfitRequest {
  date: string;
  profitPercentage: number; // Single percentage
  description?: string;
  twoFACode: string;
}
```

**NEW (Add two dollar fields + one percentage field):**

```typescript
export interface DailyProfit {
  id: string;
  date: string;

  // NEW: Two dollar amounts + one percentage
  premiumPoolAmount: number; // Dollar amount (e.g., 10000)
  performancePoolAmount: number; // Dollar amount (e.g., 5000)
  rosPercentage: number; // Percentage 0-100 (e.g., 0.55)

  // DEPRECATED: Keep for backward compatibility
  profitPercentage: number; // Same as rosPercentage

  description?: string;
  isActive: boolean;
  isDistributed: boolean;
  distributedAt?: string;
  distributedBy?: {
    _id: string;
    email: string;
    username: string;
  };
  declaredBy: {
    _id: string;
    email: string;
    username: string;
  };
  declaredAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface TodayProfit {
  date: string;
  premiumPoolAmount: number;
  performancePoolAmount: number;
  rosPercentage: number;
  profitPercentage: number; // Same as rosPercentage
  isDistributed: boolean;
}

export interface DeclareProfitRequest {
  date: string;
  premiumPoolAmount: number;
  performancePoolAmount: number;
  rosPercentage: number;
  description?: string;
  twoFACode: string;
}

export interface UpdateProfitRequest {
  premiumPoolAmount?: number;
  performancePoolAmount?: number;
  rosPercentage?: number;
  description?: string;
  twoFACode: string;
}
```

---

### 2. Declare Profit Modal

**File:** `src/components/admin/dailyProfit/DeclareProfitModal.tsx`

**Changes:**

1. **Update Form Schema:**

```typescript
const declareProfitSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  premiumPoolAmount: z.number().min(0, 'Amount must be at least 0'),
  performancePoolAmount: z.number().min(0, 'Amount must be at least 0'),
  rosPercentage: z
    .number()
    .min(0, 'Percentage must be at least 0')
    .max(100, 'Percentage cannot exceed 100'),
  description: z.string().optional(),
});
```

2. **Update Form Inputs (Replace single percentage with two amounts + one percentage):**

```tsx
{
  /* Premium Pool Amount (DOLLARS) */
}
<div className="space-y-2">
  <Label htmlFor="premiumPoolAmount">Premium Pool Amount ($)</Label>
  <Input
    id="premiumPoolAmount"
    type="number"
    step="1"
    min="0"
    placeholder="10000"
    {...register('premiumPoolAmount', { valueAsNumber: true })}
    className="w-full"
  />
  {errors.premiumPoolAmount && (
    <p className="text-sm text-red-500">{errors.premiumPoolAmount.message}</p>
  )}
</div>;

{
  /* Performance Pool Amount (DOLLARS) */
}
<div className="space-y-2">
  <Label htmlFor="performancePoolAmount">Performance Pool Amount ($)</Label>
  <Input
    id="performancePoolAmount"
    type="number"
    step="1"
    min="0"
    placeholder="5000"
    {...register('performancePoolAmount', { valueAsNumber: true })}
    className="w-full"
  />
  {errors.performancePoolAmount && (
    <p className="text-sm text-red-500">
      {errors.performancePoolAmount.message}
    </p>
  )}
</div>;

{
  /* ROS Percentage */
}
<div className="space-y-2">
  <Label htmlFor="rosPercentage">ROS Percentage (%)</Label>
  <Input
    id="rosPercentage"
    type="number"
    step="0.01"
    min="0"
    max="100"
    placeholder="0.55"
    {...register('rosPercentage', { valueAsNumber: true })}
    className="w-full"
  />
  {errors.rosPercentage && (
    <p className="text-sm text-red-500">{errors.rosPercentage.message}</p>
  )}
</div>;

{
  /* Total Pool Amount Display */
}
<div className="bg-muted/50 rounded-lg border p-3">
  <div className="flex items-center justify-between">
    <span className="text-sm font-medium">Total Pool Amount:</span>
    <span className="text-lg font-bold">
      $
      {(
        (watch('premiumPoolAmount') || 0) +
        (watch('performancePoolAmount') || 0)
      ).toLocaleString()}
    </span>
  </div>
</div>;
```

3. **Update Submit Function:**

```typescript
const onSubmit = async (data: DeclareProfitFormData) => {
  // ... 2FA prompt logic ...

  if (editingProfit && !editingProfit.isDistributed) {
    // Update existing
    await updateMutation.mutateAsync({
      date: data.date,
      premiumPoolPercentage: data.premiumPoolPercentage,
      performancePoolPercentage: data.performancePoolPercentage,
      rosPercentage: data.rosPercentage,
      description: data.description,
      twoFACode: twoFACode,
    });
  } else {
    // Create new
    await declareMutation.mutateAsync({
      date: data.date,
      premiumPoolPercentage: data.premiumPoolPercentage,
      performancePoolPercentage: data.performancePoolPercentage,
      rosPercentage: data.rosPercentage,
      description: data.description,
      twoFACode: twoFACode,
    });
  }
};
```

---

### 3. Bulk Declare Modal

**File:** `src/components/admin/dailyProfit/BulkDeclareModal.tsx`

**Changes:**

1. **Update Form Schema:**

```typescript
const bulkDeclareSchema = z.object({
  startDate: z.string().min(1, 'Start date is required'),
  days: z.number().min(1).max(30),
  premiumPoolPercentage: z.number().min(0).max(100),
  performancePoolPercentage: z.number().min(0).max(100),
  rosPercentage: z.number().min(0).max(100),
  description: z.string().optional(),
});
```

2. **Update Form Inputs (Replace single input with three):**

```tsx
{
  /* Three percentage inputs similar to DeclareProfitModal */
}
```

3. **Update Submit Function to Generate Array:**

```typescript
const onSubmit = async (data: BulkDeclareFormData) => {
  const declarations = Array.from({ length: data.days }, (_, i) => ({
    date: format(addDays(new Date(data.startDate), i), 'yyyy-MM-dd'),
    premiumPoolPercentage: data.premiumPoolPercentage,
    performancePoolPercentage: data.performancePoolPercentage,
    rosPercentage: data.rosPercentage,
    description: data.description,
  }));

  // ... rest of submit logic
};
```

---

### 4. Daily Profit Calendar

**File:** `src/components/admin/dailyProfit/DailyProfitCalendar.tsx`

**Changes:**

Update calendar day cell to show all three percentages:

```tsx
{
  day.profit && (
    <div className="space-y-0.5 text-xs">
      <div className="flex items-center gap-1">
        <span className="text-purple-600">P:</span>
        <span className="font-bold">
          {day.profit.premiumPoolPercentage.toFixed(1)}%
        </span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-blue-600">Pf:</span>
        <span className="font-bold">
          {day.profit.performancePoolPercentage.toFixed(1)}%
        </span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-emerald-600">R:</span>
        <span className="font-bold">
          {day.profit.rosPercentage.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}
```

**Visual Example:**

```
┌──────────────┐
│     9        │
│ P:  20.0%    │  ← Premium
│ Pf: 15.0%    │  ← Performance
│ R:  15.0%    │  ← ROS
│ [Distributed]│
└──────────────┘
```

---

### 5. Declared Profits List

**File:** `src/components/admin/dailyProfit/DeclaredProfitsList.tsx`

**Changes:**

Update table to show three separate columns:

```tsx
<TableHead>
  <TableRow>
    <TableHead>Date</TableHead>
    <TableHead>Premium %</TableHead>      {/* NEW */}
    <TableHead>Performance %</TableHead>  {/* NEW */}
    <TableHead>ROS %</TableHead>          {/* NEW */}
    <TableHead>Total %</TableHead>        {/* NEW */}
    <TableHead>Status</TableHead>
    <TableHead>Declared By</TableHead>
    <TableHead>Actions</TableHead>
  </TableRow>
</TableHead>

<TableBody>
  {profits.map((profit) => (
    <TableRow key={profit.id}>
      <TableCell>{formatDate(profit.date)}</TableCell>
      <TableCell className="font-mono">
        {profit.premiumPoolPercentage.toFixed(2)}%
      </TableCell>
      <TableCell className="font-mono">
        {profit.performancePoolPercentage.toFixed(2)}%
      </TableCell>
      <TableCell className="font-mono">
        {profit.rosPercentage.toFixed(2)}%
      </TableCell>
      <TableCell className="font-mono font-bold">
        {(
          profit.premiumPoolPercentage +
          profit.performancePoolPercentage +
          profit.rosPercentage
        ).toFixed(2)}%
      </TableCell>
      {/* ... rest of row ... */}
    </TableRow>
  ))}
</TableBody>
```

---

### 6. Today's Profit Card (User Dashboard)

**File:** `src/components/dashboard/TodayROSCard.tsx`

**Changes:**

Update to display all three percentages:

```tsx
export function TodayROSCard() {
  const { data, isLoading, isError } = useTodayProfit();

  if (!data) {
    return <NoDataCard />;
  }

  const {
    premiumPoolPercentage,
    performancePoolPercentage,
    rosPercentage,
    profitPercentage, // Total
    date,
    isDistributed,
  } = data;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Profit</CardTitle>
        <CardDescription>{formatDate(date)}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Percentage (Main) */}
        <div className="text-center">
          <div className="text-5xl font-bold text-purple-600">
            {profitPercentage.toFixed(2)}%
          </div>
          <p className="text-muted-foreground text-sm">Total Profit</p>
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
            <div className="text-2xl font-bold text-purple-600">
              {premiumPoolPercentage.toFixed(1)}%
            </div>
            <p className="text-muted-foreground text-xs">Premium Pool</p>
          </div>

          <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
            <div className="text-2xl font-bold text-blue-600">
              {performancePoolPercentage.toFixed(1)}%
            </div>
            <p className="text-muted-foreground text-xs">Performance Pool</p>
          </div>

          <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/20">
            <div className="text-2xl font-bold text-emerald-600">
              {rosPercentage.toFixed(1)}%
            </div>
            <p className="text-muted-foreground text-xs">ROS</p>
          </div>
        </div>

        {/* Distribution Status */}
        <Badge variant={isDistributed ? 'default' : 'secondary'}>
          {isDistributed ? 'Distributed' : 'Pending'}
        </Badge>
      </CardContent>
    </Card>
  );
}
```

---

### 7. Daily ROS Performance Chart

**File:** `src/components/dashboard/DailyROSPerformance.tsx`

**Changes:**

Update chart tooltip to show all three percentages:

```tsx
// In the tooltip/hover display
<div className="space-y-1">
  <div className="flex items-center justify-between">
    <span className="text-muted-foreground">Premium Pool:</span>
    <span className="font-mono font-semibold text-purple-600">
      {item.premiumPoolPercentage.toFixed(2)}%
    </span>
  </div>
  <div className="flex items-center justify-between">
    <span className="text-muted-foreground">Performance Pool:</span>
    <span className="font-mono font-semibold text-blue-600">
      {item.performancePoolPercentage.toFixed(2)}%
    </span>
  </div>
  <div className="flex items-center justify-between">
    <span className="text-muted-foreground">ROS:</span>
    <span className="font-mono font-semibold text-emerald-600">
      {item.rosPercentage.toFixed(2)}%
    </span>
  </div>
  <div className="border-t pt-1">
    <div className="flex items-center justify-between">
      <span className="font-semibold">Total:</span>
      <span className="font-mono font-bold">
        {item.profitPercentage.toFixed(2)}%
      </span>
    </div>
  </div>
</div>
```

---

## 🎨 UI Design Considerations

### Color Coding:

- **Premium Pool:** Purple (`text-purple-600`, `bg-purple-50`)
- **Performance Pool:** Blue (`text-blue-600`, `bg-blue-50`)
- **ROS:** Emerald (`text-emerald-600`, `bg-emerald-50`)

### Responsive Design:

- On mobile: Stack three percentages vertically
- On desktop: Show three percentages side-by-side

### Accessibility:

- Clear labels for each percentage type
- Screen reader friendly
- Proper ARIA labels

---

## ✅ Implementation Checklist

### Phase 1: Types & Services (No UI Changes)

- [ ] Update `src/types/dailyProfit.ts` with three percentage fields
- [ ] Update `src/services/dailyProfitService.ts` (no changes needed - API calls should work)
- [ ] Update `src/lib/queries.ts` (no changes needed - types will update automatically)
- [ ] Update `src/lib/mutations.ts` (no changes needed - types will update automatically)

### Phase 2: Admin Components

- [ ] Update `DeclareProfitModal.tsx` - Three input fields
- [ ] Update `BulkDeclareModal.tsx` - Three input fields
- [ ] Update `DailyProfitCalendar.tsx` - Display three percentages per day
- [ ] Update `DeclaredProfitsList.tsx` - Table columns for three percentages
- [ ] Update `DistributionStatus.tsx` - Show three percentage breakdown

### Phase 3: User Components

- [ ] Update `TodayROSCard.tsx` - Display three percentages
- [ ] Update `DailyROSPerformance.tsx` - Tooltip with three percentages

### Phase 4: Testing

- [ ] Test declaration with three percentages
- [ ] Test bulk declaration
- [ ] Test calendar display
- [ ] Test user dashboard display
- [ ] Test responsive design
- [ ] Test backward compatibility (old data with single percentage)

### Phase 5: Documentation

- [ ] Update component documentation
- [ ] Update API documentation
- [ ] Create migration guide

---

## 🚧 Backward Compatibility

### Handling Old Data:

If backend returns old data with only `profitPercentage`:

```typescript
// Fallback logic in components
const premiumPoolPercentage = profit.premiumPoolPercentage ?? 0;
const performancePoolPercentage = profit.performancePoolPercentage ?? 0;
const rosPercentage = profit.rosPercentage ?? profit.profitPercentage ?? 0;
```

### Gradual Migration:

1. Deploy backend with three-percentage support
2. Deploy frontend with three-percentage UI
3. Admin declares new profits with three percentages
4. Old profits still display (with zero for premium/performance)

---

## 📊 Timeline Estimate

### Backend First (2-3 days):

- Schema changes
- API updates
- Distribution logic
- Testing

### Frontend After Backend (1-2 days):

- Type updates: 1 hour
- Modal updates: 2-3 hours
- Calendar updates: 2 hours
- List updates: 1 hour
- Dashboard updates: 2-3 hours
- Testing: 2-3 hours

**Total:** 3-5 days (backend and frontend combined)

---

## 🎯 Success Criteria

1. ✅ Admin can declare three separate percentages
2. ✅ Calendar shows all three percentages clearly
3. ✅ Users see breakdown of three percentages on dashboard
4. ✅ Distribution works correctly for all three pools
5. ✅ Historical data displays correctly
6. ✅ Responsive design works on all devices
7. ✅ No TypeScript errors

---

## 📞 Next Steps

1. **Wait for Backend:** Frontend team waits for backend to implement [BACKEND_THREE_POOL_DAILY_DECLARATION_SPECIFICATION.md](./BACKEND_THREE_POOL_DAILY_DECLARATION_SPECIFICATION.md)
2. **Backend Testing:** Backend team tests new endpoints and provides API documentation
3. **Frontend Implementation:** Once backend is ready, frontend team implements changes in this document
4. **Integration Testing:** Both teams test together
5. **Deployment:** Deploy to staging → production

---

**Note:** This document is ready to be used as soon as the backend implementation is complete. All changes are planned and documented here.
