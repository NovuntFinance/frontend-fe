/**
 * Input Sanitization Utilities
 * Security-focused input validation and sanitization
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Sanitize HTML to prevent XSS attacks
 * Removes potentially dangerous tags and attributes
 */
export function sanitizeHTML(input: string): string {
    if (!input) return '';

    return input
        // Remove script tags
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        // Remove iframe tags
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        // Remove on* event handlers
        .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
        // Remove javascript: protocol
        .replace(/javascript:/gi, '')
        // Remove data: protocol (can be used for XSS)
        .replace(/data:text\/html/gi, '');
}

/**
 * Sanitize user input for display
 * More aggressive than sanitizeHTML - strips all HTML
 */
export function sanitizeUserInput(input: string): string {
    if (!input) return '';

    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
        .trim();
}

/**
 * Validate and sanitize email
 */
export function sanitizeEmail(email: string): string {
    if (!email) return '';

    // Remove whitespace and convert to lowercase
    const cleaned = email.trim().toLowerCase();

    // Basic email pattern
    const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;

    if (!emailPattern.test(cleaned)) {
        throw new Error('Invalid email format');
    }

    return cleaned;
}

/**
 * Sanitize username
 * Allows alphanumeric, underscore, hyphen only
 */
export function sanitizeUsername(username: string): string {
    if (!username) return '';

    return username
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '')
        .substring(0, 30); // Max 30 characters
}

/**
 * Sanitize phone number
 * Removes all non-numeric characters except +
 */
export function sanitizePhone(phone: string): string {
    if (!phone) return '';

    return phone.replace(/[^\d+]/g, '');
}

/**
 * Sanitize amount/number input
 * Ensures valid decimal number
 */
export function sanitizeAmount(amount: string): string {
    if (!amount) return '0';

    // Remove all non-numeric except decimal point
    const cleaned = amount.replace(/[^\d.]/g, '');

    // Ensure only one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) {
        return `${parts[0]}.${parts.slice(1).join('')}`;
    }

    // Limit decimal places to 2
    if (parts.length === 2 && parts[1]?.length > 2) {
        return `${parts[0]}.${parts[1].substring(0, 2)}`;
    }

    return cleaned;
}

/**
 * Sanitize URL
 * Validates and sanitizes URLs
 */
export function sanitizeURL(url: string): string {
    if (!url) return '';

    try {
        const parsed = new URL(url);

        // Only allow http and https protocols
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            throw new Error('Invalid protocol');
        }

        return parsed.toString();
    } catch {
        throw new Error('Invalid URL');
    }
}

/**
 * Sanitize file name
 * Removes dangerous characters from file names
 */
export function sanitizeFileName(fileName: string): string {
    if (!fileName) return '';

    return fileName
        // Remove directory traversal attempts
        .replace(/\.\./g, '')
        .replace(/\//g, '')
        .replace(/\\/g, '')
        // Remove shell special characters
        .replace(/[;&|`$()]/g, '')
        // Remove null bytes
        .replace(/\0/g, '')
        .trim()
        .substring(0, 255); // Max filename length
}

/**
 * Sanitize search query  
 * Prevents SQL injection in search queries
 */
export function sanitizeSearchQuery(query: string): string {
    if (!query) return '';

    return query
        .trim()
        // Remove SQL comment markers
        .replace(/--/g, '')
        .replace(/\/\*/g, '')
        .replace(/\*\//g, '')
        // Remove SQL keywords that could be dangerous
        .replace(/\b(DROP|DELETE|INSERT|UPDATE|ALTER|CREATE)\b/gi, '')
        .substring(0, 100); // Max search length
}

/**
 * Validate and sanitize referral code
 */
export function sanitizeReferralCode(code: string): string {
    if (!code) return '';

    // Referral codes should be alphanumeric only
    const cleaned = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

    if (cleaned.length < 6 || cleaned.length > 12) {
        throw new Error('Invalid referral code length');
    }

    return cleaned;
}

/**
 * Rate limiting for inputs
 * Prevents brute force attacks
 */
class InputRateLimiter {
    private attempts: Map<string, number[]> = new Map();

    check(key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
        const now = Date.now();
        const timestamps = this.attempts.get(key) || [];

        // Remove old attempts outside window
        const recentAttempts = timestamps.filter(ts => now - ts < windowMs);

        if (recentAttempts.length >= maxAttempts) {
            return false; // Rate limit exceeded
        }

        recentAttempts.push(now);
        this.attempts.set(key, recentAttempts);
        return true;
    }

    clear(key: string) {
        this.attempts.delete(key);
    }
}

export const inputRateLimiter = new InputRateLimiter();

/**
 * Validate content length
 */
export function validateLength(
    input: string,
    min: number,
    max: number,
    fieldName: string = 'Input'
): void {
    const length = input?.trim().length || 0;

    if (length < min) {
        throw new Error(`${fieldName} must be at least ${min} characters`);
    }

    if (length > max) {
        throw new Error(`${fieldName} must not exceed ${max} characters`);
    }
}

/**
 * Deep sanitize object
 * Recursively sanitizes all string values in an object
 */
export function deepSanitizeObject<T extends Record<string, any>>(obj: T): T {
    const sanitized: any = {};

    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            sanitized[key] = sanitizeUserInput(value);
        } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            sanitized[key] = deepSanitizeObject(value);
        } else if (Array.isArray(value)) {
            sanitized[key] = value.map(item =>
                typeof item === 'string' ? sanitizeUserInput(item) :
                    typeof item === 'object' && item !== null ? deepSanitizeObject(item) :
                        item
            );
        } else {
            sanitized[key] = value;
        }
    }

    return sanitized as T;
}
