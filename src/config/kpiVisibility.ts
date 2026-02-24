import type { AppRole } from '@/config/rbacConfig';

/**
 * KPI visibility rules for Staffing Summary.
 * Maps KPI id → roles that CANNOT see it.
 * If a KPI id is not listed here, it's visible to all roles.
 */
const hiddenForRoles: Record<string, AppRole[]> = {
  '12m-monthly':        ['director', 'manager'],
  '3m-low':             ['director'],
  '3m-high':            ['director'],
  'paid-ftes':          ['director', 'manager'],
  'contract-ftes':      ['director', 'manager'],
  'overtime-ftes':      ['director', 'manager'],
  'total-prn':          ['director', 'manager'],
  'total-np':           ['director', 'manager'],
  'total-fullpart-ftes':['director', 'manager'],
};

/**
 * Returns true if a KPI should be visible given the user's roles.
 * A KPI is hidden only if the user has a role in its hiddenForRoles list
 * AND does not also hold a role that CAN see it.
 */
export function isKpiVisible(kpiId: string, userRoles: AppRole[]): boolean {
  const blockedRoles = hiddenForRoles[kpiId];
  if (!blockedRoles) return true; // no restrictions

  // If every role the user has is in the blocked list, hide it.
  // If they have ANY role not in the blocked list, they can see it.
  return userRoles.some(role => !blockedRoles.includes(role));
}
