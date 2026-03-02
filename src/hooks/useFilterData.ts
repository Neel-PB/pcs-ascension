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

interface FilterDataResult {
  regions: Region[];
  markets: Market[];
  facilities: Facility[];
  departments: Department[];
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

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
      return {
        regions: json.regions ?? [],
        markets: json.markets ?? [],
        facilities: json.facilities ?? [],
        departments: json.departments ?? [],
      };
    },
    staleTime: 10 * 60 * 1000,
    enabled: !!API_BASE_URL,
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
