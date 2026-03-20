import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiFetch";
import { useUserRoles } from "./useUserRoles";
import { useUserAccessScope } from "./useUserOrgAccess";

export function useUserProfile(userId?: string) {
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['user-profile', userId],
    queryFn: async () => {
      if (!userId) return null;
      const data = await apiFetch<any>(`/auth/me`);
      // Map NestJS response to match the profile shape the app expects
      return {
        id: data.id,
        email: data.email,
        first_name: data.firstName || data.first_name || null,
        last_name: data.lastName || data.last_name || null,
        avatar_url: data.avatarUrl || data.avatar_url || null,
        bio: data.bio || null,
        job_title: data.jobTitle || data.job_title || null,
        onboarding_completed: data.onboarding_completed ?? true,
        created_at: data.created_at || data.createdAt || new Date().toISOString(),
        updated_at: data.updated_at || data.updatedAt || new Date().toISOString(),
      };
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
