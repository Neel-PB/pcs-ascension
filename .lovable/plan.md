

## Volume KPI Unit-of-Service Breakdown Badge

### What We're Building
A breakdown badge below the Volume KPI section (similar to the Hired + Open Reqs FT/PT/PRN badge) that shows volume split by the 3 unit-of-service types in primary blue color:
- **Pat Days + Obs**
- **Pat Days + Obs + Newborn Days**  
- **Total Pat Days + Obs**

Each will show its target volume value. The badge uses the primary blue (`text-primary`, `bg-primary/10`) color scheme instead of the green/orange/red used for FTE badges.

### Technical Changes

**1. `src/pages/staffing/StaffingSummary.tsx`**
- Compute per-UOS volume breakdown from `pvFilteredRecords` — group by `unit_of_service` and sum `target_volume` for each
- Pass this breakdown data as a new `volumeBreakdown` prop on the volume section KPIs

**2. `src/components/staffing/DraggableKPISection.tsx`**
- Accept a new optional `volumeBreakdown` prop: `Array<{ label: string; value: number }>`
- When present (for the Volume section), render a blue-themed breakdown badge below the KPI grid, similar to the existing FT/PT/PRN badge
- Uses `bg-primary/10`, `text-primary` color scheme
- Shows each UOS name and its volume value (e.g., "Pat Days + Obs: 12.4 · Total Pat Days + Obs: 8.2 · Newborn: 0.6")
- Clicking opens a modal with detailed UOS volume breakdown

**3. Visual Design**
- Blue connector line from volume KPIs down to badge (matching the green/orange connector pattern)
- Pill-shaped badge with Info icon, primary blue background tint
- Modal showing all 3 UOS types with their volume values

