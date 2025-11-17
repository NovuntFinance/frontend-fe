/**
 * Novunt Logo Component
 * Displays the Novunt brand logo with consistent sizing and styling
 */

import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  /** Size variant */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** Whether to show the full logo with text or icon only */
  variant?: 'full' | 'icon';
  /** Theme variant for different backgrounds */
  theme?: 'auto' | 'light' | 'dark';
  /** Whether to make the logo clickable (links to home) */
  clickable?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Custom href for clickable logo */
  href?: string;
}

const sizeMap = {
  xs: { width: 80, height: 24, iconSize: 24 },
  sm: { width: 100, height: 30, iconSize: 30 },
  md: { width: 120, height: 36, iconSize: 36 },
  lg: { width: 160, height: 48, iconSize: 48 },
  xl: { width: 200, height: 60, iconSize: 60 },
  '2xl': { width: 240, height: 72, iconSize: 72 },
};

/**
 * Logo Component
 * Displays the Novunt brand logo with theme variants
 */
export function Logo({
  size = 'md',
  variant = 'full',
  theme = 'auto',
  clickable = true,
  className,
  href = '/',
}: LogoProps) {
  const dimensions = sizeMap[size];
  
  // Theme-specific classes
  const themeClasses = {
    auto: '', // Uses default logo
    light: 'brightness-0 invert', // For dark backgrounds
    dark: '', // For light backgrounds
  };
  
  const logoElement = (
    <div className={cn('relative flex items-center', className)}>
      {variant === 'icon' ? (
        // Icon-only version (first letter or icon)
        <div 
          className={cn(
            'flex items-center justify-center rounded-lg font-bold',
            'bg-primary text-primary-foreground',
            themeClasses[theme]
          )}
          style={{ 
            width: dimensions.iconSize, 
            height: dimensions.iconSize,
            fontSize: dimensions.iconSize * 0.5
          }}
        >
          N
        </div>
      ) : (
        <Image
          src="/icons/novunt.png"
          alt="Novunt"
          width={dimensions.width}
          height={dimensions.height}
          className={cn('object-contain', themeClasses[theme])}
          priority
        />
      )}
    </div>
  );

  if (clickable) {
    return (
      <Link 
        href={href}
        className="inline-flex items-center focus:outline-none focus:ring-2 focus:ring-primary rounded-lg transition-transform hover:scale-105"
      >
        {logoElement}
      </Link>
    );
  }

  return logoElement;
}

/**
 * Logo with text component (for headers/footers)
 */
interface LogoWithTextProps extends Omit<LogoProps, 'variant'> {
  /** Whether to show tagline */
  showTagline?: boolean;
}

export function LogoWithText({
  size = 'md',
  clickable = true,
  className,
  href = '/',
  showTagline = false,
}: LogoWithTextProps) {
  const content = (
    <div className={cn('flex items-center gap-3', className)}>
      <Logo size={size} clickable={false} />
      {showTagline && (
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground font-medium">
            Financial Freedom
          </span>
          <span className="text-xs text-muted-foreground">
            Through Smart Staking
          </span>
        </div>
      )}
    </div>
  );

  if (clickable) {
    return (
      <Link 
        href={href}
        className="inline-flex items-center focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
      >
        {content}
      </Link>
    );
  }

  return content;
}
