import React from 'react';

type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'blue';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  success: 'bg-green-50 text-success border-green-200',
  danger: 'bg-red-50 text-danger border-red-200',
  warning: 'bg-amber-50 text-warning border-amber-200',
  info: 'bg-blue-50 text-blue-600 border-blue-200',
  blue: 'bg-blue-50 text-accent border-blue-200',
  neutral: 'bg-gray-100 text-textSecondary border-border',
};

const Badge: React.FC<BadgeProps> = ({ variant, children, className = '' }) => {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
