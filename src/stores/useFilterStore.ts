import { create } from "zustand";
import { FILTER_SENTINELS } from "@/lib/selectConstants";

interface FilterState {
  selectedRegion: string;
  selectedMarket: string;
  selectedFacility: string;
  selectedSubmarket: string;
  selectedPstat: string;
  selectedLevel2: string;
  selectedDepartment: string;
  filtersInitialized: boolean;

  // Cascade-aware setters
  setRegion: (value: string) => void;
  setMarket: (value: string) => void;
  setFacility: (value: string) => void;
  setSubmarket: (value: string) => void;
  setPstat: (value: string) => void;
  setLevel2: (value: string) => void;
  setDepartment: (value: string) => void;

  // One-shot initialization from Access Scope defaults
  initializeFromDefaults: (
    defaults: { region: string; market: string; facility: string; department: string },
    filterPerms: { region: boolean; market: boolean }
  ) => void;

  // Clear to Access Scope defaults
  clearFilters: (defaults?: { region: string; market: string; facility: string; department: string }) => void;
}

const {
  ALL_REGIONS,
  ALL_MARKETS,
  ALL_FACILITIES,
  ALL_SUBMARKETS,
  ALL_PSTAT,
  ALL_LEVEL2,
  ALL_DEPARTMENTS,
} = FILTER_SENTINELS;

export const useFilterStore = create<FilterState>((set, get) => ({
  selectedRegion: ALL_REGIONS,
  selectedMarket: ALL_MARKETS,
  selectedFacility: ALL_FACILITIES,
  selectedSubmarket: ALL_SUBMARKETS,
  selectedPstat: ALL_PSTAT,
  selectedLevel2: ALL_LEVEL2,
  selectedDepartment: ALL_DEPARTMENTS,
  filtersInitialized: false,

  setRegion: (value) =>
    set({
      selectedRegion: value,
      selectedMarket: ALL_MARKETS,
      selectedFacility: ALL_FACILITIES,
      selectedSubmarket: ALL_SUBMARKETS,
      selectedPstat: ALL_PSTAT,
      selectedLevel2: ALL_LEVEL2,
      selectedDepartment: ALL_DEPARTMENTS,
    }),

  setMarket: (value) =>
    set({
      selectedMarket: value,
      selectedFacility: ALL_FACILITIES,
      selectedSubmarket: ALL_SUBMARKETS,
      selectedPstat: ALL_PSTAT,
      selectedLevel2: ALL_LEVEL2,
      selectedDepartment: ALL_DEPARTMENTS,
    }),

  setFacility: (value) =>
    set({
      selectedFacility: value,
      selectedPstat: ALL_PSTAT,
      selectedLevel2: ALL_LEVEL2,
      selectedDepartment: ALL_DEPARTMENTS,
    }),

  setSubmarket: (value) => set({ selectedSubmarket: value }),
  setPstat: (value) => set({ selectedPstat: value }),
  setLevel2: (value) => set({ selectedLevel2: value }),
  setDepartment: (value) => set({ selectedDepartment: value }),

  initializeFromDefaults: (defaults, filterPerms) => {
    if (get().filtersInitialized) return;

    const updates: Partial<FilterState> = { filtersInitialized: true };

    // Apply defaults for all filters with restrictions (visible or hidden)
    if (defaults.region !== ALL_REGIONS) {
      updates.selectedRegion = defaults.region;
    }
    if (defaults.market !== ALL_MARKETS) {
      updates.selectedMarket = defaults.market;
    }
    if (defaults.facility !== ALL_FACILITIES) {
      updates.selectedFacility = defaults.facility;
    }
    if (defaults.department !== ALL_DEPARTMENTS) {
      updates.selectedDepartment = defaults.department;
    }

    set(updates);
  },

  clearFilters: (defaults) =>
    set({
      selectedRegion: defaults?.region ?? ALL_REGIONS,
      selectedMarket: defaults?.market ?? ALL_MARKETS,
      selectedFacility: defaults?.facility ?? ALL_FACILITIES,
      selectedSubmarket: ALL_SUBMARKETS,
      selectedPstat: ALL_PSTAT,
      selectedLevel2: ALL_LEVEL2,
      selectedDepartment: defaults?.department ?? ALL_DEPARTMENTS,
    }),
}));
