

## Make Positions Checklist Tabs Full-Width

### Problem
The Shortage/Surplus tabs in the Positions Checklist drawer are underline-style tabs that only take up partial width. Per the project's tab navigation standards, these should use the pill-shaped toggle button group, full-width with equal segments.

### Changes

**File: `src/components/workforce/WorkforceKPISection.tsx`**

Replace the `Tabs`/`TabsList`/`TabsTrigger`/`TabsContent` implementation (lines 197-218) with:
- A `ToggleButtonGroup` component for the tab headers (full-width, equal segments)
- Local state (`useState`) to track the active tab (`shortage` or `surplus`)
- Conditional rendering of `ForecastChecklistTable` based on active state

The toggle items will include the badge counts in the labels (e.g., "Shortage 2", "Surplus 2") to preserve the current information display.

### Technical Detail
- Import `ToggleButtonGroup` from `@/components/ui/toggle-button-group` and `useState` from React
- Remove `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` imports if no longer used in this file
- Remove `Badge` import if no longer used
- The `ToggleButtonGroup` is already configured for full-width (`w-full`, `flex-1`) pill-shaped buttons per project standards

