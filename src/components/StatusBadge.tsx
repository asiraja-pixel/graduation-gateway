import { ClearanceStatus } from '@/types';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: ClearanceStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const baseClasses = 'status-badge';
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';
  
  const statusConfig = {
    approved: {
      classes: 'status-approved',
      icon: CheckCircle,
      label: 'Approved',
    },
    completed: {
      classes: 'status-approved',
      icon: CheckCircle,
      label: 'Completed',
    },
    in_progress: {
      classes: 'status-pending',
      icon: Clock,
      label: 'In Progress',
    },
    pending: {
      classes: 'status-pending',
      icon: Clock,
      label: 'Pending',
    },
    rejected: {
      classes: 'status-rejected',
      icon: XCircle,
      label: 'Rejected',
    },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span className={`${baseClasses} ${sizeClasses} ${config.classes}`}>
      {Icon ? <Icon className={size === 'sm' ? 'w-3 h-3 mr-1' : 'w-4 h-4 mr-1.5'} /> : null}
      {config.label}
    </span>
  );
}
