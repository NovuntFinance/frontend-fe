# Migration Guide
## Updating Components to Use New Patterns

**Date**: 2025-01-27  
**Status**: In Progress

---

## 🎯 Migration Priorities

### High Priority (Do First)
1. ✅ Forms - Migrate to `FormField` component
2. ✅ Error Handling - Use `UserFriendlyError`
3. ✅ Loading States - Use `LoadingStates` library
4. ✅ Toast Notifications - Use enhanced toast system

### Medium Priority (Do Next)
5. Animations - Use standardized animation system
6. Responsive - Add responsive utilities
7. Empty States - Ensure everywhere

---

## 📝 Migration Patterns

### 1. Form Migration

**Before:**
```tsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

<div>
  <Label>Email</Label>
  <Input {...register('email')} />
  {errors.email && <span>{errors.email.message}</span>}
</div>
```

**After:**
```tsx
import { FormProvider, useForm } from 'react-hook-form';
import { FormField } from '@/components/forms/FormField';
import { loginSchema } from '@/lib/validation';

const form = useForm({
  resolver: zodResolver(loginSchema),
});

<FormProvider {...form}>
  <FormField
    name="email"
    label="Email Address"
    type="email"
    required
    placeholder="Enter your email"
  />
</FormProvider>
```

---

### 2. Error Handling Migration

**Before:**
```tsx
if (error) {
  return <div>Error: {error.message}</div>;
}
```

**After:**
```tsx
import { UserFriendlyError } from '@/components/errors/UserFriendlyError';

if (error) {
  return (
    <UserFriendlyError 
      error={error} 
      onRetry={() => refetch()}
      variant="card"
    />
  );
}
```

---

### 3. Loading State Migration

**Before:**
```tsx
if (isLoading) {
  return <div>Loading...</div>;
}
```

**After:**
```tsx
import { LoadingStates } from '@/components/ui/loading-states';

if (isLoading) {
  return <LoadingStates.Card />;
}
```

---

### 4. Toast Migration

**Before:**
```tsx
import { toast as sonnerToast } from 'sonner';
import { toast } from '@/lib/toast';

toast.success('Success!');
sonnerToast.success('Success!');
```

**After:**
```tsx
import { toast } from '@/components/ui/enhanced-toast';

toast.success('Success!', {
  description: 'Your action completed successfully',
  action: {
    label: 'View Details',
    onClick: () => router.push('/details'),
  },
});
```

---

### 5. Animation Migration

**Before:**
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
```

**After:**
```tsx
import { slideUp } from '@/design-system/animations';

<motion.div {...slideUp(0.2)}>
```

---

### 6. Responsive Migration

**Before:**
```tsx
const isMobile = window.innerWidth < 768;
```

**After:**
```tsx
import { useResponsive } from '@/hooks/useResponsive';
import { Responsive, MobileOnly } from '@/utils/responsive';

const { isMobile, isDesktop } = useResponsive();
const columns = useResponsiveGrid(1, 2, 3);
```

---

## 🔄 Step-by-Step Migration Process

### Step 1: Identify Components to Migrate
- [ ] List all forms
- [ ] List all error handling locations
- [ ] List all loading states
- [ ] List all toast calls

### Step 2: Migrate One Component at a Time
- [ ] Update imports
- [ ] Replace old pattern with new pattern
- [ ] Test functionality
- [ ] Verify accessibility
- [ ] Check responsive behavior

### Step 3: Test Thoroughly
- [ ] Test on mobile
- [ ] Test keyboard navigation
- [ ] Test error scenarios
- [ ] Test loading states

### Step 4: Document Changes
- [ ] Update component documentation
- [ ] Note any breaking changes
- [ ] Update usage examples

---

## 📋 Component Migration Checklist

### Forms
- [ ] Login page
- [ ] Signup page
- [ ] Profile edit modal
- [ ] Create stake form
- [ ] Deposit/Withdraw forms
- [ ] Admin forms

### Error Handling
- [ ] Dashboard page
- [ ] Wallet pages
- [ ] Stake pages
- [ ] API error handlers
- [ ] Form validation errors

### Loading States
- [ ] Dashboard overview
- [ ] Wallet balance
- [ ] Stake list
- [ ] Transaction history
- [ ] Team/referral tree

### Toast Notifications
- [ ] All success messages
- [ ] All error messages
- [ ] All warning messages
- [ ] All info messages

---

## ⚠️ Breaking Changes

### Toast System
- Old: `import { toast } from '@/lib/toast'`
- New: `import { toast } from '@/components/ui/enhanced-toast'`
- **Action**: Update all imports

### Error Handling
- Old: Direct error display
- New: `UserFriendlyError` component
- **Action**: Wrap error displays

---

## 🚀 Quick Wins

These are easy migrations you can do immediately:

1. **Replace loading spinners** → Use `LoadingStates`
2. **Add breadcrumbs** → Already integrated, just verify
3. **Update toast calls** → Use enhanced toast
4. **Add responsive hooks** → Replace hardcoded breakpoints

---

## 📚 Reference

- **FormField**: `src/components/forms/FormField.tsx`
- **UserFriendlyError**: `src/components/errors/UserFriendlyError.tsx`
- **LoadingStates**: `src/components/ui/loading-states.tsx`
- **Enhanced Toast**: `src/components/ui/enhanced-toast.tsx`
- **Animations**: `src/design-system/animations.ts`
- **Responsive**: `src/hooks/useResponsive.ts`

---

*Start migrating components incrementally. Focus on high-traffic pages first.*

