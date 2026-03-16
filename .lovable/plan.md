

## Restore Static FTE Employment Split Bars

### What happened
The FTE KPI section in the Staffing Summary used to show breakdown bars (green "70% FT · 20% PT · 10% PRN" under Target FTEs, and orange "Hired and Open Reqs: 62% FT · 23% PT · 15% PRN" spanning Hired FTEs through Open Reqs). These bars are no longer rendering.

### Root cause
The rendering logic in `DraggableKPISection.tsx` is intact — it looks for `employmentBreakdown` on the `hired-ftes` and `target-ftes` KPI objects. However, `StaffingSummary.tsx` never sets `employmentBreakdown` or `breakdownVariant` on any FTE KPI object, so the bars silently don't render.

The Skill-Shift API does not provide FT/PT/PRN breakdown data, so these were always static placeholder values.

### Fix — `src/pages/staffing/StaffingSummary.tsx`

Add `employmentBreakdown` and `breakdownVariant` to the `target-ftes` and `hired-ftes` KPI objects in the `fteKPIs` memo:

- **`target-ftes`**: `employmentBreakdown: { ft: 70, pt: 20, prn: 10 }`, `breakdownVariant: 'green'`
- **`hired-ftes`**: `employmentBreakdown: { ft: 62, pt: 23, prn: 15 }`, `breakdownVariant: 'orange'`

This restores the breakdown bars exactly as they were in the screenshot. One file changed, two properties added to two KPI objects.

### Volume KPI question
You also asked about Volume KPI values. The current Volume KPIs use a `ROLLUP_PSTATS` filter that restricts aggregation to specific `unit_of_service` types when "All Departments" is selected. This was a deliberate design choice. Should I also remove that filter so all department records are summed? (This was discussed previously but you asked to skip it.)

