import React from 'react';
import { Loader2 } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'outline-accent';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl' | 'icon-sm' | 'icon-md';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-white hover:bg-accent-hover focus-visible:ring-accent',
  secondary: 'bg-surface border border-border text-ink hover:bg-surface-2 focus-visible:ring-border',
  danger: 'bg-crit text-white hover:opacity-90 focus-visible:ring-crit',
  ghost: 'text-ink-2 hover:text-ink hover:bg-surface-2 focus-visible:ring-transparent',
  outline: 'border border-border text-ink hover:bg-surface-2 focus-visible:ring-border bg-transparent',
  'outline-accent': 'border border-accent text-accent hover:bg-accent-bg focus-visible:ring-accent bg-transparent',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-7 px-2.5 text-xs gap-1.5',
  md: 'h-8 px-3 text-sm gap-2',
  lg: 'h-9 px-4 text-sm gap-2',
  xl: 'h-10 px-5 text-sm gap-2',
  'icon-sm': 'h-7 w-7 p-0',
  'icon-md': 'h-8 w-8 p-0',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={isLoading || disabled}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-bg',
          'disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
