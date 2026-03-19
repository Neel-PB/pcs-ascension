import { useQuery } from "@tanstack/react-query";

export interface Region {
  id: string;
  region: string;
}

export interface Market {
  id: string;
  market: string;
  region: string | null;
}

export interface Facility {
  id: string;
  facility_id: string;
  facility_name: string;
  market: string;
  region: string | null;
  submarket: string | null;
}

export interface Department {
  id: string;
  department_id: string;
  department_name: string;
  facility_id: string;
}

export interface Level2Value {
  facility_id: string;
  department_id: string;
  level_2: string;
}

export interface PstatValue {
  facility_id: string;
  department_id: string;
  unit_of_service: string;
}

interface FlatFilterRow {
  region: string;
  market: string;
  submarket: string | null;
  business_unit: string;
  business_unit_description: string;
  department_id: string;
  department_description: string;
  level_2: string | null;
  unit_of_service: string | null;
  nursing_flag: boolean;
  market_hierarchy_key: string | null;
}

interface FilterDataResult {
  regions: Region[];
  markets: Market[];
  facilities: Facility[];
  departments: Department[];
  level2Values: Level2Value[];
  pstatValues: PstatValue[];
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

function transformFlatRows(rows: FlatFilterRow[]): FilterDataResult {
  const regionMap = new Map<string, Region>();
  const marketMap = new Map<string, Market>();
  const facilityMap = new Map<string, Facility>();
  const departmentMap = new Map<string, Department>();
  const level2Map = new Map<string, Level2Value>();
  const pstatMap = new Map<string, PstatValue>();

  for (const row of rows) {
    // Regions
    if (row.region && !regionMap.has(row.region)) {
      regionMap.set(row.region, { id: row.region, region: row.region });
    }

    // Markets (keep region reference)
    if (row.market && !marketMap.has(row.market)) {
      marketMap.set(row.market, {
        id: row.market,
        market: row.market,
        region: row.region ?? null,
      });
    }

    // Facilities (business_unit → facility_id, business_unit_description → facility_name)
    if (row.business_unit && !facilityMap.has(row.business_unit)) {
      facilityMap.set(row.business_unit, {
        id: row.business_unit,
        facility_id: row.business_unit,
        facility_name: row.business_unit_description ?? row.business_unit,
        market: row.market,
        region: row.region ?? null,
        submarket: row.submarket ?? null,
      });
    }

    // Departments (dedupe by department_id + business_unit composite key)
    const deptKey = `${row.department_id}|${row.business_unit}`;
    if (row.department_id && !departmentMap.has(deptKey)) {
      departmentMap.set(deptKey, {
        id: deptKey,
        department_id: row.department_id,
        department_name: row.department_description ?? row.department_id,
        facility_id: row.business_unit,
      });
    }

    // Level 2 values (dedupe by level_2 + business_unit)
    if (row.level_2) {
      const l2Key = `${row.level_2}|${row.business_unit}`;
      if (!level2Map.has(l2Key)) {
        level2Map.set(l2Key, {
          facility_id: row.business_unit,
          level_2: row.level_2,
        });
      }
    }

    // PSTAT / Unit of Service values (dedupe by unit_of_service + business_unit)
    if (row.unit_of_service) {
      const pstatKey = `${row.unit_of_service}|${row.business_unit}`;
      if (!pstatMap.has(pstatKey)) {
        pstatMap.set(pstatKey, {
          facility_id: row.business_unit,
          unit_of_service: row.unit_of_service,
        });
      }
    }
  }

  return {
    regions: Array.from(regionMap.values()).sort((a, b) => a.region.localeCompare(b.region)),
    markets: Array.from(marketMap.values()).sort((a, b) => a.market.localeCompare(b.market)),
    facilities: Array.from(facilityMap.values()).sort((a, b) => a.facility_name.localeCompare(b.facility_name)),
    departments: Array.from(departmentMap.values()).sort((a, b) => a.department_name.localeCompare(b.department_name)),
    level2Values: Array.from(level2Map.values()),
    pstatValues: Array.from(pstatMap.values()),
  };
}

export function useFilterData() {
  const token = sessionStorage.getItem("msal_access_token");

  const { data, isLoading } = useQuery({
    queryKey: ["all-filter-data", token ? "authenticated" : "anonymous"],
    queryFn: async (): Promise<FilterDataResult> => {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/filters/unique`, { headers });
      if (!res.ok) throw new Error(`Filter fetch failed: ${res.status}`);

      const json = await res.json();

      // Handle flat denormalized rows from API
      if (Array.isArray(json)) {
        return transformFlatRows(json);
      }

      // Fallback: legacy structured response
      return {
        regions: json.regions ?? [],
        markets: json.markets ?? [],
        facilities: json.facilities ?? [],
        departments: json.departments ?? [],
        level2Values: [],
        pstatValues: [],
      };
    },
    staleTime: 10 * 60 * 1000,
    enabled: !!API_BASE_URL,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const regions = data?.regions ?? [];
  const markets = data?.markets ?? [];
  const facilities = data?.facilities ?? [];
  const departments = data?.departments ?? [];
  const level2Values = data?.level2Values ?? [];
  const pstatValues = data?.pstatValues ?? [];

  // Helper: get markets filtered by region
  const getMarketsByRegion = (regionName: string | null) => {
    if (!regionName || regionName === "all-regions") return markets;
    return markets.filter((m) => m.region === regionName);
  };

  // Helper: get facilities filtered by market
  const getFacilitiesByMarket = (marketName: string | null) => {
    if (!marketName || marketName === "all-markets") return facilities;
    return facilities.filter((f) => f.market.toUpperCase() === marketName.toUpperCase());
  };

  // Helper: get departments filtered by facility
  const getDepartmentsByFacility = (facilityId: string | null) => {
    if (!facilityId || facilityId === "all-facilities") return departments;
    return departments.filter((d) => d.facility_id === facilityId);
  };

  // Helper: get facilities grouped by submarket for a given market
  const getFacilitiesGroupedBySubmarket = (marketName: string) => {
    const marketFacilities = facilities.filter((f) => f.market === marketName);
    const grouped: Record<string, Facility[]> = {};
    
    marketFacilities.forEach((facility) => {
      const submarket = facility.submarket || "Other";
      if (!grouped[submarket]) {
        grouped[submarket] = [];
      }
      grouped[submarket].push(facility);
    });
    
    return grouped;
  };

  // Helper: get unique submarkets for a given market
  const getSubmarketsByMarket = (marketName: string | null) => {
    if (!marketName || marketName === "all-markets") return [];
    const marketFacilities = facilities.filter((f) => f.market.toUpperCase() === marketName.toUpperCase());
    const submarkets = [...new Set(marketFacilities.map(f => f.submarket).filter(Boolean))] as string[];
    return submarkets.sort();
  };

  // Helper: get unique Level 2 values, cascading by facility > market > region
  const getLevel2Options = (facilityId: string | null, marketName?: string | null, regionName?: string | null) => {
    let filtered = level2Values;
    if (facilityId && facilityId !== "all-facilities") {
      filtered = level2Values.filter((v) => v.facility_id === facilityId);
    } else if (marketName && marketName !== "all-markets") {
      const marketFacilityIds = new Set(
        facilities.filter((f) => f.market.toUpperCase() === marketName.toUpperCase()).map((f) => f.facility_id)
      );
      filtered = level2Values.filter((v) => marketFacilityIds.has(v.facility_id));
    } else if (regionName && regionName !== "all-regions") {
      const regionFacilityIds = new Set(
        facilities.filter((f) => f.region?.toUpperCase() === regionName.toUpperCase()).map((f) => f.facility_id)
      );
      filtered = level2Values.filter((v) => regionFacilityIds.has(v.facility_id));
    }
    return [...new Set(filtered.map((v) => v.level_2))].sort();
  };

  // Helper: get unique PSTAT/UoS values, cascading by facility > market > region
  const getPstatOptions = (facilityId: string | null, marketName?: string | null, regionName?: string | null) => {
    let filtered = pstatValues;
    if (facilityId && facilityId !== "all-facilities") {
      filtered = pstatValues.filter((v) => v.facility_id === facilityId);
    } else if (marketName && marketName !== "all-markets") {
      const marketFacilityIds = new Set(
        facilities.filter((f) => f.market.toUpperCase() === marketName.toUpperCase()).map((f) => f.facility_id)
      );
      filtered = pstatValues.filter((v) => marketFacilityIds.has(v.facility_id));
    } else if (regionName && regionName !== "all-regions") {
      const regionFacilityIds = new Set(
        facilities.filter((f) => f.region?.toUpperCase() === regionName.toUpperCase()).map((f) => f.facility_id)
      );
      filtered = pstatValues.filter((v) => regionFacilityIds.has(v.facility_id));
    }
    return [...new Set(filtered.map((v) => v.unit_of_service))].sort();
  };

  return {
    regions,
    markets,
    facilities,
    departments,
    level2Values,
    pstatValues,
    // Keep backward compatibility with individual loading states
    regionsLoading: isLoading,
    marketsLoading: isLoading,
    facilitiesLoading: isLoading,
    departmentsLoading: isLoading,
    isLoading,
    getMarketsByRegion,
    getFacilitiesByMarket,
    getDepartmentsByFacility,
    getFacilitiesGroupedBySubmarket,
    getSubmarketsByMarket,
    getLevel2Options,
    getPstatOptions,
  };
}
