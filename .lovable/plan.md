

# Further Performance Optimization Plan

## Current State Analysis

After the Phase 1 optimizations, the application now has:
- Code splitting with React.lazy() for all pages
- Centralized AuthContext eliminating duplicate getUser() calls
- Optimized RBAC with React Query caching
- Suspense boundary inside ShellLayout for smooth navigation
- Vite manual chunk splitting for vendor libraries
- Consolidated realtime subscription hook

However, there are still several opportunities for improvement:

## Identified Optimization Opportunities

| Area | Issue | Impact |
|------|-------|--------|
| Remaining Realtime Channels | 7+ hooks still create their own channels | Extra WebSocket connections |
| Duplicate `getUser()` calls | `useNotifications` still calls `supabase.auth.getUser()` | Redundant auth calls |
| Framer Motion everywhere | 27 files import framer-motion (heavy library) | Larger initial bundle |
| No route prefetching | Pages load only after click | Perceived slowness |
| Filter data not prefetched | 4 separate queries run on first page load | Waterfall loading |
| No font optimization | System fonts with no preload | Flash of unstyled text |

## Optimization Plan

### Phase 1: Consolidate Remaining Realtime Subscriptions

**Files to modify:**
- `src/hooks/useRealtimeSubscriptions.ts` - Add remaining table subscriptions
- `src/hooks/useNotifications.ts` - Remove individual channel, use centralized hook
- `src/hooks/useUsers.ts` - Remove individual channels
- `src/hooks/useDynamicRoles.ts` - Remove individual channel
- `src/hooks/useRBACAuditLog.ts` - Remove individual channel
- `src/hooks/usePositionCommentCounts.ts` - Remove individual channel
- `src/hooks/usePermissions.ts` - Remove individual channel
- `src/hooks/useRolePermissions.ts` - Remove individual channel

**Current channels (7 remaining):**
1. `profiles-changes` (useUsers)
2. `user-roles-changes` (useUsers)
3. `roles-changes` (useDynamicRoles)
4. `rbac-audit-log-changes` (useRBACAuditLog)
5. `position-comments-count` (usePositionCommentCounts)
6. `permissions-changes` (usePermissions)
7. `notifications-changes` (useNotifications)
8. `role-permissions-changes` (useRolePermissions)

**After consolidation:** 2 channels total
- `rbac-consolidated` - Core RBAC/settings (already exists)
- `data-consolidated` - Notifications, comments, audit logs

### Phase 2: Fix Remaining Auth Duplication

**File:** `src/hooks/useNotifications.ts`

Replace:
```tsx
const { data: { user } } = await supabase.auth.getUser();
```

With:
```tsx
// Use user from parameter or context instead of calling getUser()
```

Pass user ID from AppHeader where useAuth is already available.

### Phase 3: Route Prefetching

**File:** `src/components/layout/DynamicIconOnlySidebar.tsx`

Add hover-based prefetching for next likely page:

```tsx
import { lazy, useCallback } from "react";

// Prefetch map for routes
const routePrefetch: Record<string, () => Promise<any>> = {
  "/staffing": () => import("@/pages/staffing/StaffingSummary"),
  "/positions": () => import("@/pages/positions/PositionsPage"),
  "/analytics": () => import("@/pages/analytics/AnalyticsRegion"),
  "/reports": () => import("@/pages/reports/ReportsRegion"),
  "/admin": () => import("@/pages/admin/AdminPage"),
};

// In ModuleItem:
const handleMouseEnter = useCallback(() => {
  const url = module.items[0]?.url;
  if (url && routePrefetch[url]) {
    routePrefetch[url](); // Preload on hover
  }
}, [module.items]);
```

### Phase 4: Optimize Filter Data Loading

**File:** `src/hooks/useFilterData.ts`

Use parallel queries with `useQueries` instead of 4 separate `useQuery` calls:

```tsx
import { useQueries } from "@tanstack/react-query";

export function useFilterData() {
  const results = useQueries({
    queries: [
      { queryKey: ["filter-regions"], queryFn: fetchRegions },
      { queryKey: ["filter-markets"], queryFn: fetchMarkets },
      { queryKey: ["filter-facilities"], queryFn: fetchFacilities },
      { queryKey: ["filter-departments"], queryFn: fetchDepartments },
    ],
  });
  
  // Already runs in parallel with useQueries
  const [regionsResult, marketsResult, facilitiesResult, departmentsResult] = results;
}
```

Note: React Query already parallelizes multiple useQuery calls by default, but useQueries provides cleaner error handling and loading states.

### Phase 5: Lazy Load Framer Motion for Non-Critical Components

**Current state:** 27 files import framer-motion directly

**Strategy:** Create animation wrapper components that lazy-load framer-motion

**New file:** `src/components/ui/AnimatedWrapper.tsx`

```tsx
import { lazy, Suspense } from "react";

const MotionDiv = lazy(() => 
  import("framer-motion").then(m => ({ default: m.motion.div }))
);

export function AnimatedDiv({ children, ...props }) {
  return (
    <Suspense fallback={<div {...props}>{children}</div>}>
      <MotionDiv {...props}>{children}</MotionDiv>
    </Suspense>
  );
}
```

Note: This is a more aggressive optimization - framer-motion is already in a separate chunk from the Vite config. Consider this only if initial load times remain problematic.

### Phase 6: Add Resource Hints

**File:** `index.html`

Add DNS prefetch and preconnect for Supabase:

```html
<head>
  <!-- Existing preload for logo -->
  <link rel="preload" href="/src/assets/Ascension-Emblem.svg" as="image" type="image/svg+xml" />
  
  <!-- DNS prefetch for Supabase -->
  <link rel="dns-prefetch" href="https://zuikhjazyhfzklrnmyrc.supabase.co" />
  <link rel="preconnect" href="https://zuikhjazyhfzklrnmyrc.supabase.co" crossorigin />
  
  <!-- Preload Inter font if using Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
</head>
```

## Implementation Priority

| Priority | Optimization | Effort | Impact |
|----------|-------------|--------|--------|
| 1 | Consolidate realtime channels | Medium | High - reduces 8 channels to 2 |
| 2 | Route prefetching | Low | Medium - instant navigation feel |
| 3 | Resource hints in index.html | Low | Medium - faster API connection |
| 4 | Fix auth duplication in useNotifications | Low | Low - 1 less API call |
| 5 | Parallel filter queries | Low | Low - already parallelized by React Query |
| 6 | Lazy motion components | High | Medium - only if needed |

## Expected Additional Improvements

| Metric | Current | After | Improvement |
|--------|---------|-------|-------------|
| WebSocket channels | 9 | 2 | 78% fewer |
| Navigation feel | Visible loader | Instant | Near-instant |
| DNS lookup time | ~100ms | ~0ms | Eliminated |
| Auth API calls | 2-3 | 1 | 50-66% fewer |

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/hooks/useRealtimeSubscriptions.ts` | Modify | Add remaining subscriptions |
| `src/hooks/useNotifications.ts` | Modify | Use auth context |
| `src/hooks/useUsers.ts` | Modify | Remove realtime channels |
| `src/hooks/useDynamicRoles.ts` | Modify | Remove realtime channel |
| `src/hooks/usePermissions.ts` | Modify | Remove realtime channel |
| `src/hooks/useRolePermissions.ts` | Modify | Remove realtime channel |
| `src/components/layout/DynamicIconOnlySidebar.tsx` | Modify | Add route prefetching |
| `index.html` | Modify | Add resource hints |

## Technical Notes

- Realtime consolidation reduces connection overhead but requires careful filter matching
- Route prefetching triggers on hover, not on every render
- Resource hints are zero-cost browser optimizations
- All changes are backward compatible with existing functionality

