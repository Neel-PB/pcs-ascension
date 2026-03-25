import { create } from 'zustand';

/** Aligns with Staffing tabs that support AI view snapshot. */
export type StaffingSnapshotTab = 'summary' | 'planning' | 'variance';

export interface StaffingKpiRow {
  id: string;
  label: string;
  value: string;
  section?: string;
}

export interface StaffingViewSnapshot {
  tab: StaffingSnapshotTab;
  capturedAt: string;
  kpis: StaffingKpiRow[];
  /** Position Planning: Hired vs Active FTE mode */
  planningViewMode?: 'planned' | 'active';
}

interface StaffingViewSnapshotState {
  /** Current Staffing sub-tab id from StaffingSummary (summary | planning | variance | …). */
  activeStaffingTab: string | null;
  snapshot: StaffingViewSnapshot | null;
  setActiveStaffingTab: (tab: string) => void;
  setStaffingSnapshot: (snapshot: StaffingViewSnapshot | null) => void;
  clearStaffing: () => void;
}

export const useStaffingViewSnapshotStore = create<StaffingViewSnapshotState>((set) => ({
  activeStaffingTab: null,
  snapshot: null,
  setActiveStaffingTab: (tab) => set({ activeStaffingTab: tab }),
  setStaffingSnapshot: (snapshot) => set({ snapshot }),
  clearStaffing: () => set({ activeStaffingTab: null, snapshot: null }),
}));
