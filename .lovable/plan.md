

## Replace Tabs with Helix ToggleButtonGroup in KPI Chart Modal

### Change

**`src/components/staffing/KPIChartModal.tsx`**:

1. Replace `Tabs`/`TabsList`/`TabsTrigger` import with `ToggleButtonGroup` from `@/components/ui/toggle-button-group`.
2. Remove the `<Tabs>` wrapper and replace `<TabsList>` + `<TabsTrigger>` with a `<ToggleButtonGroup>` using items `[{ id: "chart", label: "Chart" }, { id: "table", label: "Table" }]`, `activeId={activeTab}`, `onSelect={setActiveTab}`, and a unique `layoutId="kpiChartTab"`.
3. Replace `<TabsContent value="chart">` / `<TabsContent value="table">` with simple conditional rendering: `{activeTab === "chart" && (...)}` / `{activeTab === "table" && (...)}`.
4. Constrain the toggle group width with `className="max-w-xs"` so it doesn't stretch full-width in the modal.

### Scope
Single file, ~10 lines changed. Swaps Radix underline tabs for the pill-shaped Helix toggle group per design system standards.

