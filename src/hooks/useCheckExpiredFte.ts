import { useEffect, useRef } from "react";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

// Module-level flag to ensure we only check once per session
let hasCheckedExpiredFte = false;

/**
 * Hook to check and revert expired Active FTE overrides.
 * This is called once per session when the Employees or Contractors tab loads.
 */
export function useCheckExpiredFte() {
  const hasInvoked = useRef(false);

  useEffect(() => {
    if (!hasCheckedExpiredFte && !hasInvoked.current && API_BASE_URL) {
      hasInvoked.current = true;
      hasCheckedExpiredFte = true;

      const token = sessionStorage.getItem("nestjs_token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      fetch(`${API_BASE_URL}/position-overrides/check-expired`, {
        method: "POST",
        headers,
      })
        .then(async (res) => {
          if (!res.ok) {
            console.error("Error checking expired FTE:", res.status);
            return;
          }
          const data = await res.json();
          if (data?.reverted > 0) {
            console.log(`Reverted ${data.reverted} expired FTE override(s)`);
          }
        })
        .catch((err) => {
          console.error("Error checking expired FTE:", err);
        });
    }
  }, []);
}
