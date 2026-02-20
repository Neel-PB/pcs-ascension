

## Fix Sidebar Tour: Add to User Guides and Ensure Launchability

### Problem

1. **Not visible in User Guides**: The `guideCatalog` array in `UserGuidesTab.tsx` lists every tour (header, feedback, ai-hub, checklist) but has no entry for `sidebar`. This means the Sidebar Navigation tour never appears in the Support page.

2. **Not working**: Since there is no catalog entry, there is no "Go & Start" button to trigger `startTour('sidebar')`. The tour itself is correctly wired (steps exist in `sidebarTourSteps.ts`, registered in `tourStepRegistry.ts`, `OverlayTour` is rendered in `DynamicIconOnlySidebar.tsx`), but nothing ever launches it.

### Changes

**File: `src/components/support/UserGuidesTab.tsx`**

Add a new entry to the `guideCatalog` array in the Overlays section (after the `header` entry):

```
{
  tourKey: "sidebar",
  title: "Sidebar Navigation",
  description: "Icon-only module switcher with active-state indicator and prefetch.",
  icon: Navigation,
  route: "",
  category: "Overlays",
  isOverlay: true,
}
```

This single addition will:
- Make the sidebar tour appear in the Overlays tab of the User Guides
- Provide a "Start" button to launch it
- Enable micro-tour step browsing (all 9 steps will be listed)
- Show completion status and reset capability

No other files need changes -- the tour steps, registry, config, and OverlayTour rendering are already in place.

