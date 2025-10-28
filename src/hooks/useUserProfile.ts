import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserRoles } from "./useUserRoles";
import { useUserOrgAccess } from "./useUserOrgAccess";

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
  const { orgAccess, isLoading: orgLoading, hasUnrestrictedAccess } = useUserOrgAccess(userId);

  return {
    profile,
    roles,
    orgAccess,
    hasUnrestrictedAccess,
    isLoading: profileLoading || rolesLoading || orgLoading,
  };
}
