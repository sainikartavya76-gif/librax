import React from 'react';
import { LucideIcon } from 'lucide-react';
import Button from './Button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-surface border border-border rounded-lg border-dashed">
      {Icon && (
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-background mb-4">
          <Icon className="h-6 w-6 text-textMuted" aria-hidden="true" />
        </div>
      )}
      <h3 className="mt-2 text-sm font-semibold text-textPrimary">{title}</h3>
      <p className="mt-1 text-sm text-textSecondary max-w-sm">{description}</p>
      {action && (
        <div className="mt-6">
          <Button onClick={action.onClick}>
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
