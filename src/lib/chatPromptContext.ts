import { moduleTabConfigs } from '@/components/shell/TabNavigation';
import { FILTER_SENTINELS } from '@/lib/selectConstants';
import type { StaffingViewSnapshot } from '@/stores/useStaffingViewSnapshotStore';

const STAFFING_SUBMODULE_BY_TAB: Record<string, string> = Object.fromEntries(
  moduleTabConfigs.staffing.map((t) => [t.id, t.label]),
);

const MODULE_LABELS: Record<keyof typeof moduleTabConfigs, string> = {
  staffing: 'Staffing',
  positions: 'Positions',
  analytics: 'Analytics',
  support: 'Support',
  reports: 'Reports',
  admin: 'Admin',
};

function normalizePath(p: string): string {
  if (p.length > 1 && p.endsWith('/')) return p.slice(0, -1);
  return p;
}

/**
 * Map current URL to module / submodule using the same tab config as the shell.
 */
export function resolveModuleSubFromPath(
  pathname: string,
  search: string,
): { module?: string; submodule?: string; currentPage?: string } {
  const path = normalizePath(pathname);
  const searchParams = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const tabFromUrl = searchParams.get('tab') ?? '';

  for (const moduleKey of Object.keys(moduleTabConfigs) as (keyof typeof moduleTabConfigs)[]) {
    const tabs = moduleTabConfigs[moduleKey];
    for (const t of tabs) {
      const [basePath, queryPart] = t.path.split('?');
      const normBase = normalizePath(basePath);
      if (path !== normBase) continue;

      if (queryPart) {
        const q = new URLSearchParams(queryPart);
        const expectedTab = q.get('tab');
        if (expectedTab != null && tabFromUrl === expectedTab) {
          return { module: MODULE_LABELS[moduleKey], submodule: t.label };
        }
      } else if (!tabFromUrl) {
        return { module: MODULE_LABELS[moduleKey], submodule: t.label };
      }
    }
  }

  const full =
    path + (search && search !== '?' ? (search.startsWith('?') ? search : `?${search}`) : '');
  return { currentPage: full || path };
}

export interface ChatPromptContextPayload {
  role?: string;
  scope?: string;
  module?: string;
  submodule?: string;
  currentPage?: string;
  scopeFilters?: {
    region?: string;
    market?: string;
    facility?: string;
    department?: string;
  };
  /** Staffing KPI rows for backend tools only (not copied into the model system prompt). */
  viewSnapshot?: StaffingViewSnapshot;
}

export interface FilterSlice {
  selectedRegion: string;
  selectedMarket: string;
  selectedFacility: string;
  selectedDepartment: string;
  filtersInitialized: boolean;
}

function buildScopeFromFilters(filters: FilterSlice): Pick<ChatPromptContextPayload, 'scope' | 'scopeFilters'> {
  if (!filters.filtersInitialized) return {};

  const { ALL_REGIONS, ALL_MARKETS, ALL_FACILITIES, ALL_DEPARTMENTS } = FILTER_SENTINELS;

  const scopeFilters: ChatPromptContextPayload['scopeFilters'] = {
    region: filters.selectedRegion,
    market: filters.selectedMarket,
    facility: filters.selectedFacility,
    department: filters.selectedDepartment,
  };

  const parts: string[] = [];
  if (filters.selectedRegion !== ALL_REGIONS) parts.push(`Region: ${filters.selectedRegion}`);
  if (filters.selectedMarket !== ALL_MARKETS) parts.push(`Market: ${filters.selectedMarket}`);
  if (filters.selectedFacility !== ALL_FACILITIES) parts.push(`Facility (id): ${filters.selectedFacility}`);
  if (filters.selectedDepartment !== ALL_DEPARTMENTS) parts.push(`Department (id): ${filters.selectedDepartment}`);

  return {
    scopeFilters,
    ...(parts.length > 0 ? { scope: parts.join('; ') } : {}),
  };
}

/** Payload for POST /ai/chat/stream `context` field (matches PromptContextDto). */
export function buildChatPromptContext(opts: {
  pathname: string;
  search: string;
  userRole?: string | null;
  filters: FilterSlice;
  /** When false, omit region/market/facility/department scope (module/page still sent). Default true. */
  includeScopeFilters?: boolean;
  /** In-page Staffing tab id (summary, planning, …). Overrides path-based submodule on `/staffing`. */
  staffingTabId?: string | null;
  viewSnapshot?: StaffingViewSnapshot | null;
}): ChatPromptContextPayload | undefined {
  const nav = resolveModuleSubFromPath(opts.pathname, opts.search);
  const scopePart =
    opts.includeScopeFilters === false ? {} : buildScopeFromFilters(opts.filters);

  const path = normalizePath(opts.pathname);
  const isStaffing = path === '/staffing';
  const staffingSubmodule =
    isStaffing && opts.staffingTabId && STAFFING_SUBMODULE_BY_TAB[opts.staffingTabId]
      ? STAFFING_SUBMODULE_BY_TAB[opts.staffingTabId]
      : undefined;
  const submodule = staffingSubmodule ?? nav.submodule;

  const payload: ChatPromptContextPayload = {
    ...(opts.userRole ? { role: opts.userRole } : {}),
    ...nav,
    ...(isStaffing ? { module: MODULE_LABELS.staffing } : {}),
    submodule,
    ...scopePart,
    ...(opts.viewSnapshot && (opts.viewSnapshot.tab === 'summary' || opts.viewSnapshot.tab === 'planning' || opts.viewSnapshot.tab === 'variance')
      ? { viewSnapshot: opts.viewSnapshot }
      : {}),
  };

  const meaningful =
    payload.role ||
    payload.scope ||
    payload.module ||
    payload.submodule ||
    payload.currentPage ||
    payload.scopeFilters ||
    payload.viewSnapshot;

  return meaningful ? payload : undefined;
}

/** True when filters are initialized and at least one of region / market / facility / department is not “all”. */
export function hasNarrowScopeSelection(
  filters: Pick<
    FilterSlice,
    'filtersInitialized' | 'selectedRegion' | 'selectedMarket' | 'selectedFacility' | 'selectedDepartment'
  >,
): boolean {
  if (!filters.filtersInitialized) return false;
  const { ALL_REGIONS, ALL_MARKETS, ALL_FACILITIES, ALL_DEPARTMENTS } = FILTER_SENTINELS;
  return (
    filters.selectedRegion !== ALL_REGIONS ||
    filters.selectedMarket !== ALL_MARKETS ||
    filters.selectedFacility !== ALL_FACILITIES ||
    filters.selectedDepartment !== ALL_DEPARTMENTS
  );
}
