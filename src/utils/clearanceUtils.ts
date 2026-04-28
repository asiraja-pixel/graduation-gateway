import { ClearanceRequest, DepartmentClearance } from '@/types';

/**
 * Normalizes departmentClearances from backend (could be array or object)
 * to ensure it's always a record of department keys to clearance data.
 */
export const normalizeClearances = (clearances: unknown): ClearanceRequest['departmentClearances'] => {
  if (Array.isArray(clearances)) {
    const obj: Record<string, DepartmentClearance> = {};
    clearances.forEach((dc: unknown) => {
      const clearance = dc as DepartmentClearance;
      const department = clearance.department;
      if (department) {
        obj[department.toLowerCase()] = dc as DepartmentClearance;
      }
    });
    return obj as ClearanceRequest['departmentClearances'];
  }
  return (clearances || {}) as unknown as ClearanceRequest['departmentClearances'];
};
