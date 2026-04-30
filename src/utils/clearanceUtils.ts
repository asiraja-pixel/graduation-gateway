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

/**
 * Maps full program names to their i18n keys.
 */
export const getProgramKey = (programName: string | undefined): string => {
  if (!programName) return '';
  
  const mapping: Record<string, string> = {
    "Bachelor of Arts in Islamic Sharia": "sharia_ba",
    "Bachelor of Arts in Arabic Language": "arabic_ba",
    "Diploma in Islamic Banking and Finance": "islamic_banking_dip",
    "Diploma in Islamic Psychology": "islamic_psych_dip",
    "Diploma in Arabic Language and Islamic Studies": "arabic_islamic_dip",
    "Certificate in Islamic Banking and Finance": "islamic_banking_cert",
    "Certificate in Arabic Language and Islamic Studies": "arabic_islamic_cert",
    "Bachelor of Business Management": "business_ba",
    "Diploma in Business Management": "business_dip",
    "Certificate in Business Management": "business_cert",
    "Bachelor of Education (B.Ed)": "education_ba",
    "Bachelor of Information Technology": "bit_ba",
    "Diploma in Business Information Technology": "bit_dip",
    "Bachelor of Business Administration": "bba",
    "Bachelor of Sharia": "sharia_ba",
    "Bachelor of Arabic Language": "arabic_ba",
    "Bachelor of Education": "education_ba"
  };
  
  return mapping[programName] || programName;
};

