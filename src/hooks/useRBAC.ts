import { useState, useEffect } from "react";

export function useRBAC() {
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<string[]>(["user", "admin"]);

  // Placeholder implementation - returns true for all permissions
  const hasPermission = (permission: string): boolean => {
    // In a real implementation, this would check against user's actual permissions
    return true;
  };

  return {
    hasPermission,
    roles,
    loading,
  };
}
