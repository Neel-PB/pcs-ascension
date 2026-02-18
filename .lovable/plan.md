

## Add Header Tour Guide

Create a new tour for the app header bar that walks users through each element: the search bar, notifications bell, theme toggle, and user menu.

### Changes

**1. New tour steps file: `src/components/tour/headerTourSteps.ts`**

Define 4 steps targeting the header elements:

| Step | Target | Title | Content |
|------|--------|-------|---------|
| 1 | `[data-tour="header-search"]` | Global Search | Click the search bar or press Ctrl+K to open the command palette. Search across all pages and navigation items. |
| 2 | `[data-tour="header-notifications"]` | Notifications | Click the bell to open the notification panel. A red badge appears when you have unread items. |
| 3 | `[data-tour="header-theme"]` | Theme Toggle | Click to cycle between Light, Dark, and System themes. The icon updates to reflect the current mode. |
| 4 | `[data-tour="header-user-menu"]` | User Menu | Click your avatar to access your Profile, take a guided Tour of the current page, view all User Guides, or Log Out. |

**2. Add `data-tour` attributes to `src/components/shell/AppHeader.tsx`**

- Wrap the search `div` with `data-tour="header-search"`
- Add `data-tour="header-notifications"` to the notifications `Button`
- Add `data-tour="header-theme"` to the theme `Button`
- Add `data-tour="header-user-menu"` to the user menu `DropdownMenuTrigger` Button

**3. New tour component: `src/components/tour/HeaderTour.tsx`**

A simple `OverlayTour` wrapper with `tourKey="header"` and the header steps. Rendered inside `AppHeader` (or `ShellLayout`).

**4. Mount the tour in `src/components/shell/AppHeader.tsx`**

Add `<HeaderTour />` inside the header component.

**5. Register in User Guides catalog: `src/components/support/UserGuidesTab.tsx`**

Add a new entry in the guide catalog:
- tourKey: `header`
- title: "Header Bar"
- description: "Global search, notifications, theme toggle, and user menu."
- stepCount: 4
- category: "Overlays" (since it's globally available, not tied to a specific page)
- isOverlay: true (no route navigation needed)

### Files changed

| File | Change |
|------|--------|
| `src/components/tour/headerTourSteps.ts` | New file with 4 tour steps |
| `src/components/tour/HeaderTour.tsx` | New OverlayTour wrapper component |
| `src/components/shell/AppHeader.tsx` | Add data-tour attributes + mount HeaderTour |
| `src/components/support/UserGuidesTab.tsx` | Add "Header Bar" to guide catalog |

