# Migration Examples
## Real-World Component Migrations

This document shows before/after examples of migrating components to use new patterns.

---

## Example 1: Stakes Page ✅ Migrated

### Before
```tsx
if (isLoading) {
  return (
    <div className="space-y-6">
      <ShimmerCard className="h-64" />
      <div className="grid gap-4 md:grid-cols-2">
        <ShimmerCard className="h-48" />
        <ShimmerCard className="h-48" />
      </div>
    </div>
  );
}

if (error) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-md text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
        <h3>Failed to Load Stakes</h3>
        <p>{error.message}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    </div>
  );
}
```

### After ✅
```tsx
import { LoadingStates } from '@/components/ui/loading-states';
import { UserFriendlyError } from '@/components/errors/UserFriendlyError';
import { EmptyStates } from '@/components/EmptyStates';

if (isLoading) {
  return (
    <div className="space-y-6">
      <LoadingStates.Card height="h-64" />
      <LoadingStates.Grid items={2} columns={2} />
    </div>
  );
}

if (error) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <UserFriendlyError
        error={error}
        onRetry={() => window.location.reload()}
        variant="card"
        className="max-w-md"
      />
    </div>
  );
}

// Empty state
{!hasStakes && (
  <EmptyStates.EmptyStakes
    onCreateStake={() => openModal('create-stake')}
  />
)}
```

**Benefits**:
- ✅ Consistent loading UX
- ✅ Better error messages
- ✅ Reusable empty state
- ✅ Less code
- ✅ Better accessibility

---

## Example 2: Form Migration

### Before
```tsx
<div>
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    {...register('email')}
    type="email"
  />
  {errors.email && (
    <span className="text-red-500">{errors.email.message}</span>
  )}
</div>
```

### After ✅
```tsx
import { FormField } from '@/components/forms/FormField';

<FormField
  name="email"
  label="Email Address"
  type="email"
  required
  placeholder="Enter your email"
  description="We'll never share your email"
/>
```

**Benefits**:
- ✅ 70% less code
- ✅ Built-in validation display
- ✅ Accessibility built-in
- ✅ Consistent styling
- ✅ Type-safe

---

## Example 3: Toast Migration

### Before
```tsx
import { toast as sonnerToast } from 'sonner';

sonnerToast.success('Deposit successful!');
```

### After ✅
```tsx
import { toast } from '@/components/ui/enhanced-toast';

toast.success('Deposit successful!', {
  description: 'Your $100 deposit has been processed',
  action: {
    label: 'View Transaction',
    onClick: () => router.push('/transactions'),
  },
});
```

**Benefits**:
- ✅ More informative
- ✅ Actionable
- ✅ Better UX
- ✅ Consistent styling

---

## Example 4: Animation Migration

### Before
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, ease: 'easeOut' }}
>
  Content
</motion.div>
```

### After ✅
```tsx
import { slideUp } from '@/design-system/animations';

<motion.div {...slideUp(0.2)}>
  Content
</motion.div>
```

**Benefits**:
- ✅ Consistent timing
- ✅ Respects reduced motion
- ✅ Less code
- ✅ Type-safe

---

## Example 5: Responsive Migration

### Before
```tsx
const isMobile = window.innerWidth < 768;
const columns = isMobile ? 1 : window.innerWidth < 1024 ? 2 : 3;
```

### After ✅
```tsx
import { useResponsive } from '@/hooks/useResponsive';
import { useResponsiveGrid } from '@/hooks/useResponsive';

const { isMobile, isDesktop } = useResponsive();
const columns = useResponsiveGrid(1, 2, 3);
```

**Benefits**:
- ✅ SSR-safe
- ✅ Consistent breakpoints
- ✅ Type-safe
- ✅ Easier to maintain

---

## Migration Checklist Per Component

When migrating a component:

- [ ] Update imports
- [ ] Replace loading states → `LoadingStates`
- [ ] Replace error handling → `UserFriendlyError`
- [ ] Replace forms → `FormField`
- [ ] Replace toasts → Enhanced toast
- [ ] Replace animations → Animation system
- [ ] Add responsive utilities if needed
- [ ] Add empty states if needed
- [ ] Test on mobile
- [ ] Test keyboard navigation
- [ ] Verify accessibility

---

## Quick Migration Script

For bulk migrations, you can use find/replace:

1. **Loading States**:
   - Find: `<ShimmerCard`
   - Replace: `<LoadingStates.Card`

2. **Toast**:
   - Find: `toast.success(`
   - Replace: `toast.success(` (then add options)

3. **Error Handling**:
   - Find: `if (error) { return <div>Error`
   - Replace: `if (error) { return <UserFriendlyError`

---

*See `src/components/examples/MigratedComponentExample.tsx` for a complete example.*

