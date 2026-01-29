import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";

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

export function useFilterData() {
  // Single query that fetches all filter data in parallel
  const { data, isLoading } = useQuery({
    queryKey: ["all-filter-data"],
    queryFn: async (): Promise<FilterDataResult> => {
      const [regionsRes, marketsRes, facilitiesRes, departmentsRes] = await Promise.all([
        supabase.from("regions").select("*").order("region"),
        supabase.from("markets").select("*").order("market"),
        supabase.from("facilities").select("*").order("facility_name"),
        supabase.from("departments").select("*").order("department_name"),
      ]);

      if (regionsRes.error) throw regionsRes.error;
      if (marketsRes.error) throw marketsRes.error;
      if (facilitiesRes.error) throw facilitiesRes.error;
      if (departmentsRes.error) throw departmentsRes.error;

      return {
        regions: regionsRes.data as Region[],
        markets: marketsRes.data as Market[],
        facilities: facilitiesRes.data as Facility[],
        departments: departmentsRes.data as Department[],
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - this is mostly static data
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
