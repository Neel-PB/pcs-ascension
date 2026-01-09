import { useState, useEffect } from "react";

const COMPACT_BREAKPOINT = 1280; // xl breakpoint in Tailwind

export function useIsCompactScreen() {
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const checkWidth = () => setIsCompact(window.innerWidth < COMPACT_BREAKPOINT);
    
    checkWidth();
    
    const mql = window.matchMedia(`(max-width: ${COMPACT_BREAKPOINT - 1}px)`);
    mql.addEventListener("change", checkWidth);
    
    return () => mql.removeEventListener("change", checkWidth);
  }, []);

  return isCompact;
}
