import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DepartmentCategoryResult {
  isNursing: boolean | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to determine if a selected department is nursing or non-nursing.
 * Filters by both department_id and facility_id for unique results.
 * Returns null for isNursing if no department is selected or department not found.
 */
export function useDepartmentCategory(
  departmentId: string | null,
  facilityId: string | null = null
): DepartmentCategoryResult {
  const { data, isLoading, error } = useQuery({
    queryKey: ['department-category', departmentId, facilityId],
    queryFn: async () => {
      if (!departmentId || departmentId === 'all-departments') {
        return null;
      }

      let query = supabase
        .from('departments')
        .select('is_nursing')
        .eq('department_id', departmentId);

      // Also filter by facility_id if available to get unique result
      if (facilityId && facilityId !== 'all-facilities') {
        query = query.eq('facility_id', facilityId);
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        throw error;
      }

      return data?.is_nursing ?? null;
    },
    enabled: !!departmentId && departmentId !== 'all-departments',
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return {
    isNursing: data ?? null,
    isLoading,
    error: error as Error | null,
  };
}
