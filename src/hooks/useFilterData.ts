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
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

function transformFlatRows(rows: FlatFilterRow[]): FilterDataResult {
  const regionMap = new Map<string, Region>();
  const marketMap = new Map<string, Market>();
  const facilityMap = new Map<string, Facility>();
  const departmentMap = new Map<string, Department>();

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

    // Departments (dedupe by department_id)
    if (row.department_id && !departmentMap.has(row.department_id)) {
      departmentMap.set(row.department_id, {
        id: row.department_id,
        department_id: row.department_id,
        department_name: row.department_description ?? row.department_id,
        facility_id: row.business_unit,
      });
    }
  }

  return {
    regions: Array.from(regionMap.values()).sort((a, b) => a.region.localeCompare(b.region)),
    markets: Array.from(marketMap.values()).sort((a, b) => a.market.localeCompare(b.market)),
    facilities: Array.from(facilityMap.values()).sort((a, b) => a.facility_name.localeCompare(b.facility_name)),
    departments: Array.from(departmentMap.values()).sort((a, b) => a.department_name.localeCompare(b.department_name)),
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

  return {
    regions,
    markets,
    facilities,
    departments,
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
  };
}
