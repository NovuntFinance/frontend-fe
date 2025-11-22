# Component Development Guidelines

## Component Structure

### File Organization
```
ComponentName/
├── ComponentName.tsx        # Main component
├── ComponentName.test.tsx   # Tests
├── ComponentName.stories.tsx # Storybook stories (optional)
├── hooks/                   # Component-specific hooks
│   └── useComponentName.ts
├── utils/                   # Component-specific utilities
│   └── helpers.ts
└── types.ts                 # Component-specific types
```

### Basic Component Template

```typescript
/**
 * ComponentName
 * Description of what this component does
 */

'use client'; // Only if needed

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ComponentNameProps {
  /** Description */
  title: string;
  /** Description */
  description?: string;
  /** Optional class name */
  className?: string;
  /** Callback function */
  onAction?: () => void;
}

export function ComponentName({
  title,
  description,
  className,
  onAction,
}: ComponentNameProps) {
  const [state, setState] = useState(false);

  return (
    <div className={cn('base-classes', className)}>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      <button onClick={onAction}>Action</button>
    </div>
  );
}

// Export default if needed
export default ComponentName;
```

## Component Types

### 1. **UI Components** (`components/ui/`)
- Pure presentational components
- No business logic
- Highly reusable
- Based on Radix UI or custom

Example:
```typescript
// Button.tsx
export interface ButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ variant = 'default', size = 'md', children, onClick }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(buttonVariants({ variant, size }))}
    >
      {children}
    </button>
  );
}
```

### 2. **Feature Components** (`components/[feature]/`)
- Domain-specific components
- May contain business logic
- Use hooks and services

Example:
```typescript
// WalletCard.tsx
export function WalletCard() {
  const { data: wallet, isLoading } = useWalletBalance();
  const router = useRouter();

  if (isLoading) return <Skeleton />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wallet Balance</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">
          ${wallet.balance.toFixed(2)}
        </p>
      </CardContent>
    </Card>
  );
}
```

### 3. **Layout Components** (`app/*/layout.tsx`)
- Page wrappers
- Navigation
- Sidebars

## Best Practices

### 1. **TypeScript Strict Mode**
- Always define prop types
- Avoid `any` type
- Use type inference where possible

```typescript
// ✅ Good
interface Props {
  user: User;
  onUpdate: (user: User) => void;
}

// ❌ Bad
interface Props {
  user: any;
  onUpdate: (user: any) => void;
}
```

### 2. **Props Destructuring**
```typescript
// ✅ Good - Destructure props
function Component({ title, description }: Props) {
  return <div>{title}</div>;
}

// ❌ Bad - Don't use props object
function Component(props: Props) {
  return <div>{props.title}</div>;
}
```

### 3. **Conditional Rendering**
```typescript
// ✅ Good - Use early returns
if (isLoading) return <Skeleton />;
if (error) return <ErrorState error={error} />;

return <Content data={data} />;

// ❌ Bad - Nested ternaries
return isLoading ? <Skeleton /> : error ? <ErrorState /> : <Content />;
```

### 4. **Event Handlers**
```typescript
// ✅ Good - Arrow functions for handlers
const handleClick = () => {
  // Handler logic
};

// ✅ Good - Inline for simple cases
<button onClick={() => setOpen(true)}>Open</button>

// ❌ Bad - Don't bind in render
<button onClick={this.handleClick.bind(this)}>Click</button>
```

### 5. **State Management**
```typescript
// ✅ Good - Local state for UI
const [isOpen, setIsOpen] = useState(false);

// ✅ Good - React Query for server state
const { data } = useQuery({ queryKey: ['user'], queryFn: fetchUser });

// ✅ Good - Zustand for global client state
const { theme } = useUIStore();
```

### 6. **Styling**
```typescript
// ✅ Good - Use Tailwind utilities
<div className="flex items-center gap-4 p-6 rounded-lg bg-card">

// ✅ Good - Use cn() for conditional classes
<div className={cn('base-class', isActive && 'active-class', className)}>

// ❌ Bad - Inline styles (unless necessary)
<div style={{ padding: '16px', backgroundColor: 'white' }}>
```

### 7. **Accessibility**
```typescript
// ✅ Good - Add ARIA labels
<button aria-label="Close modal" onClick={onClose}>
  <X className="h-4 w-4" />
</button>

// ✅ Good - Semantic HTML
<nav>
  <ul role="list">
    <li><a href="/dashboard">Dashboard</a></li>
  </ul>
</nav>

// ✅ Good - Keyboard support
<div
  role="button"
  tabIndex={0}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
  onClick={handleClick}
>
```

### 8. **Error Handling**
```typescript
// ✅ Good - Handle errors gracefully
function Component() {
  const { data, error, isLoading } = useQuery({
    queryKey: ['data'],
    queryFn: fetchData,
  });

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  if (!data) return <EmptyState />;

  return <Content data={data} />;
}
```

### 9. **Performance Optimization**
```typescript
// ✅ Good - Memoize expensive computations
const sortedItems = useMemo(
  () => items.sort((a, b) => a.name.localeCompare(b.name)),
  [items]
);

// ✅ Good - Memoize callbacks passed to children
const handleUpdate = useCallback(
  (id: string) => {
    // Update logic
  },
  [/* dependencies */]
);

// ✅ Good - Memo components that re-render often
export const ExpensiveComponent = memo(function ExpensiveComponent({ data }) {
  // Component logic
});
```

### 10. **Loading States**
```typescript
// ✅ Good - Show skeleton loaders
if (isLoading) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-20 w-full" />
      </CardContent>
    </Card>
  );
}
```

## Testing Components

### Unit Tests
```typescript
import { render, screen } from '@/lib/test-utils';
import { Button } from'./Button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    
    screen.getByText('Click').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Common Patterns

### Modal Pattern
```typescript
export function MyModal() {
  const { isOpen, closeModal } = useUIStore();

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Title</DialogTitle>
        </DialogHeader>
        {/* Content */}
      </DialogContent>
    </Dialog>
  );
}
```

### Form Pattern
```typescript
export function MyForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: submitData,
  });

  const onSubmit = async (data: FormData) => {
    try {
      await mutation.mutateAsync(data);
      toast.success('Success!');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

### List Pattern
```typescript
export function MyList() {
  const { data: items, isLoading } = useQuery({
    queryKey: ['items'],
    queryFn: fetchItems,
  });

  if (isLoading) return <SkeletonList />;
  if (!items?.length) return <EmptyState />;

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id}>
          <ItemCard item={item} />
        </li>
      ))}
    </ul>
  );
}
```

## Checklist

Before committing a component, ensure:
- [ ] TypeScript types are properly defined
- [ ] Component is properly documented with JSDoc
- [ ] Accessibility attributes are added (aria-label, role, etc.)
- [ ] Error states are handled
- [ ] Loading states are implemented
- [ ] Tests are written
- [ ] No console.log statements
- [ ] Styled with Tailwind (no inline styles)
- [ ] Responsive design considered
- [ ] Performance optimized (memo, useMemo, useCallback if needed)
