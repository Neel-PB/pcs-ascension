import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

export function useFilterData() {
  // Fetch regions
  const { data: regions = [], isLoading: regionsLoading } = useQuery({
    queryKey: ["filter-regions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("regions")
        .select("*")
        .order("region");
      if (error) throw error;
      return data as Region[];
    },
  });

  // Fetch markets
  const { data: markets = [], isLoading: marketsLoading } = useQuery({
    queryKey: ["filter-markets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("markets")
        .select("*")
        .order("market");
      if (error) throw error;
      return data as Market[];
    },
  });

  // Fetch facilities
  const { data: facilities = [], isLoading: facilitiesLoading } = useQuery({
    queryKey: ["filter-facilities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("facilities")
        .select("*")
        .order("facility_name");
      if (error) throw error;
      return data as Facility[];
    },
  });

  // Fetch departments
  const { data: departments = [], isLoading: departmentsLoading } = useQuery({
    queryKey: ["filter-departments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("departments")
        .select("*")
        .order("department_name");
      if (error) throw error;
      return data as Department[];
    },
  });

  // Helper: get markets filtered by region
  const getMarketsByRegion = (regionName: string | null) => {
    if (!regionName || regionName === "all-regions") return markets;
    return markets.filter((m) => m.region === regionName);
  };

  // Helper: get facilities filtered by market
  const getFacilitiesByMarket = (marketName: string | null) => {
    if (!marketName || marketName === "all-markets") return [];
    return facilities.filter((f) => f.market === marketName);
  };

  // Helper: get departments filtered by facility
  const getDepartmentsByFacility = (facilityId: string | null) => {
    if (!facilityId || facilityId === "all-facilities") return [];
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

  return {
    regions,
    markets,
    facilities,
    departments,
    isLoading: regionsLoading || marketsLoading || facilitiesLoading || departmentsLoading,
    getMarketsByRegion,
    getFacilitiesByMarket,
    getDepartmentsByFacility,
    getFacilitiesGroupedBySubmarket,
  };
}
