import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DepartmentCategoryResult {
  isNursing: boolean | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to determine if a selected department is nursing or non-nursing.
 * Returns null for isNursing if no department is selected or department not found.
 */
export function useDepartmentCategory(departmentId: string | null): DepartmentCategoryResult {
  const { data, isLoading, error } = useQuery({
    queryKey: ['department-category', departmentId],
    queryFn: async () => {
      if (!departmentId || departmentId === 'all-departments') {
        return null;
      }

      const { data, error } = await supabase
        .from('departments')
        .select('is_nursing')
        .eq('department_id', departmentId)
        .maybeSingle();

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
