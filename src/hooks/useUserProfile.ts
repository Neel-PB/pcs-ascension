import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserRoles } from "./useUserRoles";
import { useUserAccessScope } from "./useUserOrgAccess";

export function useUserProfile(userId?: string) {
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['user-profile', userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const { roles, isLoading: rolesLoading } = useUserRoles(userId);
  const { accessScope, isLoading: scopeLoading, hasUnrestrictedAccess } = useUserAccessScope(userId);

  return {
    profile,
    roles,
    accessScope,
    hasUnrestrictedAccess,
    isLoading: profileLoading || rolesLoading || scopeLoading,
    // Backward compatibility
    orgAccess: accessScope,
  };
}
