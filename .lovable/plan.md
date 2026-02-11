
# Remove "KPIs" Header and Data Refresh Button from Staffing Summary Tab

## Change

Remove the "KPIs" heading text and the `DataRefreshButton` component from the Summary tab in the Staffing page. The KPI sections (FTE, Volume, Productivity) and `DraggableSectionsContainer` will remain -- only the header row containing the word "KPIs" and the refresh status button will be removed.

## Files to Edit

### `src/pages/staffing/StaffingSummary.tsx`

**Lines 556-560** -- Remove the entire `div` containing the "KPIs" heading and `DataRefreshButton`:

```tsx
// REMOVE this block:
<div className="flex items-center justify-between">
  <h2 className="text-2xl font-bold">KPIs</h2>
  <DataRefreshButton dataSources={['staffing_grid', 'labor_uos_data']} />
</div>
```

**Cleanup unused imports** (line 12):
- Remove `import { DataRefreshButton } from "@/components/dashboard/DataRefreshButton";`

The `DraggableSectionsContainer` with all three KPI sections (FTE, Volume, Productive Resources) remains untouched.
