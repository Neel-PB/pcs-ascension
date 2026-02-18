

## Add Real-Data Previews to Planned/Active Resources Tour

### Goal

Replace generic placeholder text in the 6 Position Planning tour steps with rich visual previews that replicate the actual table structure and data from the app's `PositionPlanning.tsx` component.

### Data Source

The app uses hardcoded variance data in `PositionPlanning.tsx` with these skill groups and values:

**Overheads:** Director (0.0), Manager (1.0), Assistant Manager (1.0), Coordinator (0.0), SPEC (0.0)
**Clinical Staff:** Clinical Lead (Target 4.8, Hired 3.6, Reqs 1.2), Registered Nurse (Target 28.6, Hired 27.6)
**Support Staff:** Patient Care Technician (Target 19.2, Hired 18.4, Reqs 1.6), CLERK (Target 9.6, Hired 9.6)
**TOTAL:** Target 64.2, Hired 61.2, Reqs 2.8, Variance -0.2

Column structure: Skills | Target FTEs (D/N/T) | Hired FTEs (D/N/T) | Open Req FTEs (D/N/T) | Variance (D/N/T)

### New Preview Components in `TourDemoPreview.tsx`

#### 1. `planning-table-preview` — Compact FTE Table Wireframe

A miniature replica of the actual table using real data. Shows:
- Column group headers: Skills | Target | Hired | Reqs | Variance
- Sub-headers: D | N | T under each group
- 3 sample rows: Clinical Lead, RN, PCT (the rows with actual variance)
- TOTAL row at the bottom
- Variance cells colored orange for negative values
- All values match real data from the component

```text
+-------+---------------+--------------+-------------+-------------+
| Skills| Target FTEs   | Hired FTEs   | Open Reqs   | Variance    |
|       | D    N    T   | D    N    T  | D    N    T | D    N    T |
+-------+---------------+--------------+-------------+-------------+
| CL    | 2.4  2.4  4.8 | 1.8  1.8 3.6| 0.6 0.6 1.2| 0.6 0.6 1.2|
| RN    |14.3 14.3 28.6 |13.8 13.8 27.6| 0   0   0  |-0.5-0.5-1.0|
| PCT   | 9.6  9.6 19.2 | 9.2  9.2 18.4| 0.8 0.8 1.6| 0.4 0.4 0.8|
+-------+---------------+--------------+-------------+-------------+
| TOTAL |33.1 31.1 64.2 |31.6 29.6 61.2| 1.4 1.4 2.8|-0.1-0.1-0.2|
+-------+---------------+--------------+-------------+-------------+
```

#### 2. `toggle-comparison` — Side-by-Side View Differences

Accepts `config.type` = `'hired-active'` or `'nursing'`.

**For `hired-active`:**
Two boxes side-by-side showing what changes:
- Left: "Hired" — Shows "All employees including those on leave" with sample values (RN: 27.6)
- Right: "Active" — Shows "Currently available staff" with adjusted values (RN: 26.6) and a blue "adjusted" badge

**For `nursing`:**
- Left: "Nursing" — Shows 4 column groups: Target | Hired | Reqs | Variance
- Right: "Non-Nursing" — Shows 2 column groups: Hired | Reqs (no Target/Variance)

#### 3. `planning-groups` — Expandable Skill Group Preview

Uses real group names and aggregated FTE totals from the actual data:
```text
[v] Overheads           2.0 FTEs
    Director            0.0
    Manager             1.0
    Asst Manager        1.0
[>] Clinical Staff     31.2 FTEs
[>] Support Staff      28.0 FTEs
--- TOTAL              61.2 FTEs
```

#### 4. `planning-actions` — Action Buttons Wireframe

Same pattern as `kpi-actions` with icon-to-label rows:
- Refresh icon --> "Refresh Data" / "Reload the latest staffing data from the database."
- Download icon --> "Download CSV" / "Export the full table as a spreadsheet file."
- Expand icon --> "Full-Screen View" / "Open the table in a full-screen dialog for easier analysis."

### Changes to `tourSteps.ts`

Update all 6 `planningSteps` entries to use the new variants:

| Step | Current | New |
|------|---------|-----|
| 1 - Header | Plain text | `planning-table-preview` with description |
| 2 - Hired/Active toggle | `toggle-pair` | `toggle-comparison` with `type: 'hired-active'` |
| 3 - Nursing toggle | `toggle-pair` | `toggle-comparison` with `type: 'nursing'` |
| 4 - Legend | `legend` (keep as-is) | No change — already has good preview |
| 5 - Table | `expandable-row` | `planning-groups` |
| 6 - Actions | Plain text | `planning-actions` |

### Files Changed

| File | Change |
|------|--------|
| `src/components/tour/TourDemoPreview.tsx` | Add 4 new variants: `planning-table-preview`, `toggle-comparison`, `planning-groups`, `planning-actions` with real data values |
| `src/components/tour/tourSteps.ts` | Update 5 of the 6 `planningSteps` to use new rich preview variants (step 4 legend stays) |

