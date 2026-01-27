/**
 * Standard sentinel values for Select components.
 * Radix UI throws if SelectItem value is "".
 * Always use these constants instead of empty strings.
 */
export const SELECT_ALL = "all" as const;
export const SELECT_NONE = "none" as const;
export const SELECT_UNSET = "unset" as const;

// Filter-specific sentinels (maintain existing patterns)
export const FILTER_SENTINELS = {
  ALL_REGIONS: "all-regions",
  ALL_MARKETS: "all-markets",
  ALL_FACILITIES: "all-facilities",
  ALL_DEPARTMENTS: "all-departments",
  ALL_SUBMARKETS: "all-submarkets",
  ALL_LEVEL2: "all-level2",
  ALL_PSTAT: "all-pstat",
} as const;
