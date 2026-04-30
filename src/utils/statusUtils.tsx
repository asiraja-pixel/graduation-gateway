import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ClearanceStatus } from '@/types';

const STATUS_COLORS: Record<ClearanceStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800'
};

export const getStatusBadge = (status: ClearanceStatus) => {
  return (
    <Badge className={STATUS_COLORS[status]}>
      {status.toUpperCase()}
    </Badge>
  );
};
