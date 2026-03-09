import { useEffect, useRef } from "react";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

// Module-level flag to ensure we only check once per session
let hasCheckedExpiredOverrides = false;

/**
 * Hook to check and handle expired volume overrides.
 * Called once per session when the Settings tab loads.
 */
export function useCheckExpiredOverrides() {
  const hasInvoked = useRef(false);

  useEffect(() => {
    if (!hasCheckedExpiredOverrides && !hasInvoked.current && API_BASE_URL) {
      hasInvoked.current = true;
      hasCheckedExpiredOverrides = true;

      const token = sessionStorage.getItem("msal_access_token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      fetch(`${API_BASE_URL}/volume-overrides/check-expired`, {
        method: "POST",
        headers,
      })
        .then(async (res) => {
          if (!res.ok) {
            console.error("Error checking expired volume overrides:", res.status);
            return;
          }
          const data = await res.json();
          if (data?.count > 0) {
            console.log(`Processed ${data.count} expired volume override(s)`);
          }
        })
        .catch((err) => {
          console.error("Error checking expired volume overrides:", err);
        });
    }
  }, []);
}
