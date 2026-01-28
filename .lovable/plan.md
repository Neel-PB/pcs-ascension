

# Fix: Keep Sidebar and Header Visible During Page Navigation

## Problem Identified

When navigating between pages, the entire screen shows a loader (including hiding the sidebar and header) even though only the page content is changing.

**Root Cause**: The `Suspense` boundary in `App.tsx` wraps the entire `Routes` component, including `ShellLayout`. When a lazy-loaded page is loading, React replaces everything inside Suspense with the fallback.

```text
Current Structure (Problem):
┌─────────────────────────────────────────┐
│  <Suspense fallback={FullPageLoader}>   │ ← Wraps everything
│    <Routes>                             │
│      <ShellLayout>                      │ ← Gets hidden during load!
│        <Sidebar />                      │
│        <Header />                       │
│        <LazyPageContent />              │ ← This is what's loading
│      </ShellLayout>                     │
│    </Routes>                            │
│  </Suspense>                            │
└─────────────────────────────────────────┘
```

## Solution

Move the Suspense boundary **inside** `ShellLayout` to wrap only the page content area:

```text
Fixed Structure:
┌─────────────────────────────────────────┐
│  <Routes>                               │
│    <ShellLayout>                        │ ← Always visible
│      <Sidebar />                        │ ← Always visible
│      <Header />                         │ ← Always visible
│      <Suspense fallback={ContentLoader}>│ ← Only wraps content
│        <LazyPageContent />              │ ← Shows loader here only
│      </Suspense>                        │
│    </ShellLayout>                       │
│  </Routes>                              │
└─────────────────────────────────────────┘
```

## Implementation Details

### File 1: `src/App.tsx`

**Changes:**
- Remove the outer `Suspense` wrapper around `Routes`
- Keep `Suspense` only for auth pages (which don't use ShellLayout)
- ShellLayout will handle its own content loading state

```tsx
// Before (lines 59-74):
<Suspense fallback={<PageLoader />}>
  <Routes>
    <Route path="/auth" element={<AuthPage />} />
    ...
    <Route path="/staffing" element={<ShellLayout><StaffingSummary /></ShellLayout>} />
  </Routes>
</Suspense>

// After:
<Routes>
  {/* Auth pages still need Suspense since they don't use ShellLayout */}
  <Route path="/auth" element={<Suspense fallback={<PageLoader />}><AuthPage /></Suspense>} />
  <Route path="/auth/setup-password" element={<Suspense fallback={<PageLoader />}><SetupPasswordPage /></Suspense>} />
  
  {/* Shell routes - ShellLayout handles its own Suspense */}
  <Route path="/" element={<Navigate to="/staffing" replace />} />
  <Route path="/staffing" element={<ShellLayout><StaffingSummary /></ShellLayout>} />
  <Route path="/positions" element={<ShellLayout><PositionsPage /></ShellLayout>} />
  {/* ... other routes */}
</Routes>
```

### File 2: `src/components/shell/ShellLayout.tsx`

**Changes:**
- Add `Suspense` wrapper around `{children}` with a content-area loader
- Create a `ContentLoader` that shows the branded loader within the content area only

```tsx
import { Suspense } from "react";

// Content area loader - shows in main content while keeping shell visible
const ContentLoader = () => (
  <div className="flex items-center justify-center h-full">
    <LogoLoader size="md" variant="default" />
  </div>
);

export function ShellLayout({ children }: ShellLayoutProps) {
  // ... existing auth check logic ...

  return (
    <div className="h-screen bg-shell-elevated w-full overflow-hidden">
      <DynamicIconOnlySidebar />  {/* Always visible */}
      <AppHeader />              {/* Always visible */}
      
      <main 
        className="px-4 py-4 bg-shell-elevated overflow-auto" 
        style={{ 
          marginLeft: 'var(--sidebar-width)', 
          marginTop: 'var(--header-height)',
          height: 'calc(100vh - var(--header-height))'
        }}
      >
        <Suspense fallback={<ContentLoader />}>
          {children}  {/* Only this shows loader during navigation */}
        </Suspense>
      </main>
    </div>
  );
}
```

## Files to Modify

| File | Change |
|------|--------|
| `src/App.tsx` | Remove outer Suspense, add individual Suspense for auth routes only |
| `src/components/shell/ShellLayout.tsx` | Add Suspense around children with content-area loader |

## Expected Behavior After Fix

| Scenario | Before | After |
|----------|--------|-------|
| Navigate from Staffing → Admin | Full page loader, sidebar/header disappear | Sidebar/header stay, loader shows in content area only |
| Navigate from Admin → Positions | Full page loader | Smooth transition with content loader |
| Initial app load | Full page loader | Full page loader (correct behavior) |
| Auth page load | Full page loader | Full page loader (correct behavior) |

## Visual Difference

```text
BEFORE (clicking navigation):
┌──────────────────────────┐
│                          │
│      ⟳ Loading...        │ ← Entire screen replaced
│                          │
└──────────────────────────┘

AFTER (clicking navigation):
┌──┬───────────────────────┐
│  │                       │
│  │     ⟳ Loading...      │ ← Only content area shows loader
│☰ │                       │
│  ├───────────────────────┤
│  │ Header stays visible  │
└──┴───────────────────────┘
```

This creates a much smoother navigation experience where users always see the familiar shell structure.

