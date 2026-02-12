

## Move KPIs Into a New Tab in the Positions Checklist

### What Changes

**File: `src/components/workforce/WorkforceKPISection.tsx`**

Currently the layout is:
1. Collapsible KPI section (above)
2. Shortage / Surplus tabs (below)

The change will restructure this into a single 3-tab layout:
1. **KPIs** tab -- contains all the KPI cards (common + tab-specific)
2. **Shortage** tab -- with badge count, contains the shortage checklist table
3. **Surplus** tab -- with badge count, contains the surplus checklist table

### Technical Details

- Remove the `Collapsible` wrapper and its trigger/content -- KPIs will live inside the "KPIs" tab content instead
- Remove the `kpisExpanded` state and collapsed summary line (no longer needed since it's a tab now)
- Remove the separator between KPIs and tabs (no longer separate sections)
- Remove `Collapsible`, `CollapsibleContent`, `CollapsibleTrigger`, `ChevronDown` imports if unused elsewhere
- Add a third `TabsTrigger` with value `"kpis"` and label `"KPIs"`
- Change `defaultValue` to `"kpis"` so the KPIs tab is shown first
- Add a `TabsContent` for `"kpis"` containing the common KPI grid, separator, and tab-specific KPI grid (same markup currently inside CollapsibleContent)
- The KPIs content will be scrollable within the tab content area
- `TabsList` keeps `w-full` and all three triggers get `flex-1` for equal width

