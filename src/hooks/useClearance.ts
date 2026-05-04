import { useContext } from 'react';
import { ClearanceContext } from '@/contexts/ClearanceContext';

export function useClearance() {
  const context = useContext(ClearanceContext);
  if (context === undefined) {
    throw new Error('useClearance must be used within a ClearanceProvider');
  }
  return context;
}
