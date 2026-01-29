import { startOfMonth, addMonths, endOfMonth, subDays } from 'date-fns';

export interface FteStatusOption {
  value: string;
  label: string;
  maxMonths: number | null; // null = no limit (e.g., Shared Position)
  requiresPRNStatus?: boolean;
  minFte?: number;
}

export const FTE_STATUS_OPTIONS: FteStatusOption[] = [
  { value: 'LOA', label: 'LOA (Leave of Absence)', maxMonths: 12 },
  { value: 'FMLA', label: 'FMLA', maxMonths: 12 },
  { value: 'INTERMITTENT_FMLA', label: 'Intermittent FMLA', maxMonths: 12 },
  { value: 'MILITARY_LEAVE', label: 'Military Leave', maxMonths: 12 },
  { value: 'VOLUNTARY_SEPARATION', label: 'Voluntary Separation', maxMonths: 1 },
  { value: 'INVOLUNTARY_SEPARATION', label: 'Involuntary Separation', maxMonths: 1 },
  { value: 'ORIENTATION', label: 'Orientation', maxMonths: 6 },
  { value: 'PRN', label: 'PRNs', maxMonths: 6, requiresPRNStatus: true, minFte: 0.2 },
  { value: 'SHARED_POSITION', label: 'Shared Position', maxMonths: null },
];

// FTE dropdown values: 0.0 to 1.0 in 0.1 increments
export const FTE_VALUES = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];

/**
 * Calculate max expiry date based on status rules.
 * 
 * Business rule: Months are calculated from the 1st of the current month.
 * The max expiry is the last day of the target month BEFORE the calculated end.
 * 
 * Example (today = Jan 29, 2026):
 * - 1 month: Jan 1 + 1 month = Feb 1 → max = Jan 31
 * - 6 months: Jan 1 + 6 months = Jul 1 → max = Jun 30
 * - 12 months: Jan 1 + 12 months = Jan 1, 2027 → max = Dec 31, 2026
 */
export function getMaxExpiryDate(statusValue: string): Date | null {
  const status = FTE_STATUS_OPTIONS.find(s => s.value === statusValue);
  if (!status || status.maxMonths === null) return null;
  
  const today = new Date();
  
  // Start from 1st of current month
  const monthStart = startOfMonth(today);
  
  // Add the max months to get the start of the target month
  const targetMonthStart = addMonths(monthStart, status.maxMonths);
  
  // Get the last day of the month BEFORE the target month
  // (because "within X months" means up to but not exceeding)
  const maxDate = endOfMonth(subDays(targetMonthStart, 1));
  
  return maxDate;
}

/**
 * Get allowed FTE values based on status and original FTE.
 * 
 * PRN: 0.2 to 1.0
 * Shared Position: anything > 0 up to original FTE
 * Others: 0 to original FTE
 */
export function getFteValuesForStatus(
  statusValue: string, 
  originalFte: number | null | undefined
): number[] {
  const status = FTE_STATUS_OPTIONS.find(s => s.value === statusValue);
  const maxFte = originalFte ?? 1.0;
  
  if (status?.value === 'PRN') {
    // PRN: 0.2 to 1.0
    return FTE_VALUES.filter(v => v >= 0.2 && v <= 1.0);
  }
  
  if (status?.value === 'SHARED_POSITION') {
    // Shared Position: anything other than zero, up to original FTE
    return FTE_VALUES.filter(v => v > 0 && v <= maxFte);
  }
  
  // All others: 0 to original FTE
  return FTE_VALUES.filter(v => v <= maxFte);
}

/**
 * Get visible status options based on employee's employment type.
 * PRN option is only visible for PRN employees.
 */
export function getVisibleStatusOptions(employmentType: string | null | undefined): FteStatusOption[] {
  const isPRN = employmentType?.toUpperCase() === 'PRN';
  
  return FTE_STATUS_OPTIONS.filter(option => {
    // Show PRN option only for PRN employees
    if (option.requiresPRNStatus && !isPRN) {
      return false;
    }
    return true;
  });
}
