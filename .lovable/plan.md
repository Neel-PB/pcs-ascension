

## Add Sidebar Navigation Tour

### Problem

The icon-only sidebar (showing Staffing, Positions, Analytics, Reports, Support, Admin, Feedback) has no dedicated tour coverage. The header tour includes a single generic step for `data-tour="sidebar-nav"` but does not walk through individual modules or explain the active-state indicator, prefetch behavior, or bottom-pinned sections.

### Changes

**1. Add `data-tour` attributes to individual sidebar modules**

**File: `src/components/layout/DynamicIconOnlySidebar.tsx`**

- Add `data-tour={`sidebar-${module.label.toLowerCase()}`}` to each `ModuleItem` wrapper div (both main and bottom sections)
- This produces targets like `sidebar-staffing`, `sidebar-positions`, `sidebar-analytics`, `sidebar-reports`, `sidebar-support`, `sidebar-admin`, `sidebar-feedback`

**2. Create sidebar tour steps**

**File: `src/components/tour/sidebarTourSteps.ts`** (new file)

Define steps covering:
1. **Sidebar Overview** (`sidebar-nav`) -- explains the icon-only layout, that it is always visible, and module navigation
2. **Staffing** (`sidebar-staffing`) -- first module, staffing summary and sub-tabs
3. **Positions** (`sidebar-positions`) -- employee, requisition, and contractor management
4. **Analytics** (`sidebar-analytics`) -- volume trend charts by region/market/facility
5. **Reports** (`sidebar-reports`) -- exportable report cards
6. **Support** (`sidebar-support`) -- FAQs, user guides, troubleshooting
7. **Admin** (`sidebar-admin`) -- user management, RBAC, settings (permission-gated)
8. **Feedback** (`sidebar-feedback`) -- bottom-pinned feedback module
9. **Active State** (`sidebar-nav`) -- explains the primary-colored background indicator that follows the active module and the spring animation

Each step will include descriptive text explaining what the module contains and when to use it.

**3. Register the tour**

**File: `src/components/tour/tourStepRegistry.ts`**

- Import `sidebarTourSteps` and add entry: `'sidebar': sidebarTourSteps`

**File: `src/components/tour/tourConfig.ts`**

- Add a new `TourSection` entry: `{ page: null, tab: null, tourKey: 'sidebar', name: 'Sidebar Navigation' }` (placed after the header entry since it is also a global overlay tour)

**4. Add OverlayTour to the sidebar component**

**File: `src/components/layout/DynamicIconOnlySidebar.tsx`**

- Import `OverlayTour` and `sidebarTourSteps`
- Render `<OverlayTour tourKey="sidebar" steps={sidebarTourSteps} />` inside the sidebar container

### Technical Notes

- The sidebar is always visible (fixed position, z-50), so Joyride spotlight targeting will work reliably
- Module items are rendered conditionally based on RBAC permissions, so some steps may not have targets for all users -- Joyride handles missing targets gracefully by skipping those steps
- The tour uses `autoStart: false` consistent with all global overlay tours (Header, Feedback, AI Hub, Checklist)
- Individual module steps become available as micro-tours from the Support page User Guides tab

