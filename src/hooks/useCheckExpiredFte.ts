import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

// Module-level flag to ensure we only check once per session
let hasCheckedExpiredFte = false;

/**
 * Hook to check and revert expired Active FTE overrides.
 * This is called once per session when the Employees or Contractors tab loads.
 */
export function useCheckExpiredFte() {
  const hasInvoked = useRef(false);

  useEffect(() => {
    if (!hasCheckedExpiredFte && !hasInvoked.current) {
      hasInvoked.current = true;
      hasCheckedExpiredFte = true;
      
      supabase.functions.invoke('check-expired-fte').then(({ data, error }) => {
        if (error) {
          console.error('Error checking expired FTE:', error);
        } else if (data?.count > 0 || data?.sharedExpiredCount > 0) {
          console.log(`Reverted ${data.count} expired FTE override(s), ${data.sharedExpiredCount} shared expiry(s)`);
        }
      });
    }
  }, []);
}
