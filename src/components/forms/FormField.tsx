/**
 * Standardized Form Field Component
 * Provides consistent form validation, error handling, and accessibility
 */

'use client';

import { forwardRef } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useId } from '@/hooks/useAccessibility';
import { AlertCircle } from 'lucide-react';

interface FormFieldProps {
  name: string;
  label: string;
  type?:
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'tel'
    | 'textarea'
    | 'select';
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  options?: { value: string; label: string }[]; // For select fields
  autoComplete?: string;
  ariaLabel?: string;
}

/**
 * Standardized Form Field Component
 * Integrates with react-hook-form and provides consistent validation UX
 */
export const FormField = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  FormFieldProps
>(
  (
    {
      name,
      label,
      type = 'text',
      placeholder,
      description,
      required = false,
      disabled = false,
      className,
      options,
      autoComplete,
      ariaLabel,
    },
    ref
  ) => {
    const {
      control,
      formState: { errors },
    } = useFormContext();

    const fieldId = useId(`field-${name}`);
    const errorId = useId(`error-${name}`);
    const descriptionId = useId(`description-${name}`);
    const error = errors[name];
    const hasError = !!error;

    // Determine aria-describedby
    const ariaDescribedBy =
      [description ? descriptionId : null, hasError ? errorId : null]
        .filter(Boolean)
        .join(' ') || undefined;

    return (
      <div className={cn('space-y-2', className)}>
        <Label
          htmlFor={fieldId}
          className={cn(
            required && "after:text-destructive after:ml-1 after:content-['*']"
          )}
        >
          {label}
        </Label>

        {description && (
          <p id={descriptionId} className="text-muted-foreground text-sm">
            {description}
          </p>
        )}

        <Controller
          name={name}
          control={control}
          render={({ field, fieldState, formState }) => {
            // Text, Email, Password, Number, Tel inputs
            if (['text', 'email', 'password', 'number', 'tel'].includes(type)) {
              return (
                <Input
                  {...field}
                  id={fieldId}
                  type={type}
                  placeholder={placeholder}
                  disabled={disabled}
                  required={required}
                  autoComplete={autoComplete}
                  aria-label={ariaLabel || label}
                  aria-describedby={ariaDescribedBy}
                  aria-invalid={hasError}
                  aria-errormessage={hasError ? errorId : undefined}
                  className={cn(
                    hasError &&
                      'border-destructive focus-visible:ring-destructive'
                  )}
                  ref={ref as React.Ref<HTMLInputElement>}
                />
              );
            }

            // Textarea
            if (type === 'textarea') {
              return (
                <Textarea
                  {...field}
                  id={fieldId}
                  placeholder={placeholder}
                  disabled={disabled}
                  required={required}
                  autoComplete={autoComplete}
                  aria-label={ariaLabel || label}
                  aria-describedby={ariaDescribedBy}
                  aria-invalid={hasError}
                  aria-errormessage={hasError ? errorId : undefined}
                  className={cn(
                    hasError &&
                      'border-destructive focus-visible:ring-destructive'
                  )}
                  ref={ref as React.Ref<HTMLTextAreaElement>}
                />
              );
            }

            // Select
            if (type === 'select' && options) {
              return (
                <Select
                  value={field.value || ''}
                  onValueChange={field.onChange}
                  disabled={disabled}
                  required={required}
                >
                  <SelectTrigger
                    id={fieldId}
                    aria-label={ariaLabel || label}
                    aria-describedby={ariaDescribedBy}
                    aria-invalid={hasError}
                    aria-errormessage={hasError ? errorId : undefined}
                    className={cn(
                      hasError &&
                        'border-destructive focus-visible:ring-destructive'
                    )}
                  >
                    <SelectValue
                      placeholder={
                        placeholder || `Select ${label.toLowerCase()}`
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              );
            }

            // Fallback: return empty fragment if type not supported
            return <></>;
          }}
        />

        {hasError && (
          <div
            id={errorId}
            className="text-destructive flex items-center gap-2 text-sm"
            role="alert"
            aria-live="polite"
          >
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{error?.message as string}</span>
          </div>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';
