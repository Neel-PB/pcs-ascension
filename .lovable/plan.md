
# Production Performance Optimization Plan

## Problem Summary

The production build is slow to load due to several architectural issues that compound during initial page render:

| Issue | Impact |
|-------|--------|
| No code splitting | Entire app (~19 page components) bundled together |
| Duplicate auth calls | `useAuth` + `useRBAC` both call `supabase.auth.getUser()` |
| Waterfall data loading | Auth → RBAC → UI Settings → Filter Data (sequential) |
| Multiple realtime channels | 9+ WebSocket subscriptions opened simultaneously |
| Heavy sync imports | `recharts`, `xlsx`, `mammoth`, `framer-motion` loaded upfront |

## Solution Overview

```text
┌─────────────────────────────────────────────────────────────────┐
│                     BEFORE (Current)                            │
├─────────────────────────────────────────────────────────────────┤
│  Bundle: ALL pages + ALL libraries → Single main.js (~2MB+)    │
│  Auth:   useAuth() + useRBAC() → 2x getUser() calls            │
│  Load:   Auth → wait → RBAC → wait → Settings → wait → Render  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     AFTER (Optimized)                           │
├─────────────────────────────────────────────────────────────────┤
│  Bundle: Auth page + Shell → main.js (~200KB)                  │
│          Other pages → lazy chunks (loaded on navigation)       │
│  Auth:   Single AuthProvider → shared across all hooks         │
│  Load:   Auth + RBAC + Settings in parallel → Fast render      │
└─────────────────────────────────────────────────────────────────┘
```

## Implementation Steps

### Phase 1: Code Splitting with React.lazy()

**Goal**: Reduce initial bundle size by 60-70%

**File: `src/App.tsx`**

Convert all page imports to lazy imports:

```tsx
import { lazy, Suspense } from "react";
import { LogoLoader } from "@/components/ui/LogoLoader";

// Lazy load all pages
const AuthPage = lazy(() => import("./pages/AuthPage"));
const SetupPasswordPage = lazy(() => import("./pages/SetupPasswordPage"));
const StaffingSummary = lazy(() => import("./pages/staffing/StaffingSummary"));
const PositionsPage = lazy(() => import("./pages/positions/PositionsPage"));
const AnalyticsRegion = lazy(() => import("./pages/analytics/AnalyticsRegion"));
const ReportsRegion = lazy(() => import("./pages/reports/ReportsRegion"));
const SupportPage = lazy(() => import("./pages/support/SupportPage"));
const AdminPage = lazy(() => import("./pages/admin/AdminPage"));
const FeedbackPage = lazy(() => import("./pages/feedback/FeedbackPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Wrap routes in Suspense
<Suspense fallback={<LogoLoader />}>
  <Routes>
    <Route path="/auth" element={<AuthPage />} />
    {/* ... other routes */}
  </Routes>
</Suspense>
```

**Result**: Pages load only when navigated to. Initial bundle contains only auth page + shell components.

---

### Phase 2: Centralized Auth Context

**Goal**: Eliminate duplicate `getUser()` calls

**New File: `src/contexts/AuthContext.tsx`**

Create a single source of truth for authentication:

```tsx
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: Error }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Single auth state listener for entire app
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ... signIn, signOut methods

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
```

**File: `src/App.tsx`**

Wrap app with AuthProvider:

```tsx
const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider ...>
        {/* ... rest of app */}
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);
```

---

### Phase 3: Optimized RBAC Hook

**Goal**: Remove duplicate auth calls, use React Query for caching

**File: `src/hooks/useRBAC.ts`**

Refactor to use the centralized auth context:

```tsx
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";

export function useRBAC() {
  const { user } = useAuth(); // Use context instead of getUser()
  
  // Fetch user roles with React Query
  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ['user-roles', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      return data?.map(r => r.role as AppRole) || [];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  // ... rest of hook logic (permission calculations)
}
```

**Benefits**:
- No more `supabase.auth.getUser()` in this hook
- React Query handles caching and deduplication
- Roles refetch automatically when user changes

---

### Phase 4: Parallel Data Fetching

**Goal**: Load UI Settings and RBAC data concurrently

**File: `src/components/shell/ShellLayout.tsx`**

Use parallel queries instead of waterfall:

```tsx
import { useQueries } from "@tanstack/react-query";

export function ShellLayout({ children }) {
  const { user, loading: authLoading } = useAuth();
  
  // Parallel fetch RBAC + Settings while auth is resolving
  const [rbacQuery, settingsQuery] = useQueries({
    queries: [
      {
        queryKey: ['user-roles', user?.id],
        queryFn: () => fetchUserRoles(user?.id),
        enabled: !!user?.id,
      },
      {
        queryKey: ['app-settings', 'ui_settings'],
        queryFn: fetchUISettings,
        enabled: !!user?.id,
      },
    ],
  });

  const isLoading = authLoading || rbacQuery.isLoading || settingsQuery.isLoading;
  
  if (isLoading) {
    return <ShellSkeleton />;
  }
  
  // ... render shell
}
```

---

### Phase 5: Consolidate Realtime Channels

**Goal**: Reduce WebSocket overhead

**Current State**: 9+ individual channels
- `user-roles-changes`
- `role-permissions-changes-rbac`
- `ui-settings-changes`
- `profiles-changes`
- ... and more

**New File: `src/hooks/useRealtimeSubscriptions.ts`**

Consolidate into a single managed subscription hook:

```tsx
export function useRealtimeSubscriptions() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    // Single channel for all RBAC-related changes
    const rbacChannel = supabase
      .channel('rbac-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_roles' }, () => {
        queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'role_permissions' }, () => {
        queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_settings' }, () => {
        queryClient.invalidateQueries({ queryKey: ['app-settings'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(rbacChannel);
    };
  }, [user?.id, queryClient]);
}
```

**Usage in `App.tsx`**:
```tsx
function AppContent() {
  useRealtimeSubscriptions(); // Single hook manages all subscriptions
  // ...
}
```

---

### Phase 6: Vite Build Optimization

**Goal**: Optimize chunk splitting for production

**File: `vite.config.ts`**

Add manual chunk configuration:

```tsx
export default defineConfig(({ mode }) => ({
  // ... existing config
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks (cached separately)
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-popover', '@radix-ui/react-select'],
          'vendor-charts': ['recharts'],
          'vendor-motion': ['framer-motion'],
          // Heavy libraries loaded on-demand
          'vendor-excel': ['xlsx'],
          'vendor-docparse': ['mammoth'],
        },
      },
    },
  },
}));
```

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/contexts/AuthContext.tsx` | Create | Centralized auth state provider |
| `src/hooks/useRealtimeSubscriptions.ts` | Create | Consolidated realtime channel manager |
| `src/App.tsx` | Modify | Add lazy imports, AuthProvider, Suspense boundaries |
| `src/hooks/useAuth.ts` | Modify | Re-export from AuthContext for compatibility |
| `src/hooks/useRBAC.ts` | Modify | Use auth context, convert to React Query |
| `src/components/shell/ShellLayout.tsx` | Modify | Parallel data fetching |
| `vite.config.ts` | Modify | Add build optimization config |

---

## Expected Performance Improvements

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Initial bundle size | ~2MB | ~400KB | ~80% smaller |
| Time to First Paint | ~3-4s | ~1s | ~70% faster |
| API calls on load | 6-8 calls | 3-4 calls | ~50% fewer |
| WebSocket channels | 9+ | 2-3 | ~70% fewer |
| Time to Interactive | ~5s | ~2s | ~60% faster |

---

## Testing Strategy

1. **Build analysis**: Run `npx vite-bundle-visualizer` to verify chunk sizes
2. **Lighthouse audit**: Compare before/after scores
3. **Network waterfall**: Verify parallel loading in DevTools
4. **Functionality test**: Ensure RBAC permissions still work correctly

