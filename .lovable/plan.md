

## Change Hired FTEs Split Bar from Red to Orange

### Overview
Replace the red/destructive color on the Hired FTEs + Open Reqs shared split breakdown bar (and its connector lines) with orange, matching the vacancy age badge color used in the Positions module.

### Color Reference
From the Positions vacancy age "Urgent" badge:
- `border-orange-500/50 bg-orange-500/10 text-orange-700 dark:text-orange-400`

### Files to Update

#### 1. `src/components/staffing/DraggableKPISection.tsx`
Replace all `destructive` and `red` references in the Hired/Open Reqs connector lines and badge with orange equivalents:

- **Connector lines** (lines 128, 134, 141, 143, 145, 151): Change `bg-destructive/60 dark:bg-red-400/70` to `bg-orange-500/60 dark:bg-orange-400/70`
- **Badge background** (line 160): Change `bg-destructive/10 dark:bg-destructive/20 hover:shadow-destructive/30` to `bg-orange-500/10 dark:bg-orange-500/20 hover:shadow-orange-300/40`
- **Badge icon** (line 163): Change `text-destructive dark:text-red-400` to `text-orange-600 dark:text-orange-400`
- **Badge text** (line 164): Change `text-destructive dark:text-red-300` to `text-orange-700 dark:text-orange-300`

#### 2. `src/components/staffing/KPICard.tsx`
Add `'orange'` to the `breakdownVariant` type and add orange color mappings:

- Update `breakdownVariant` type from `'green' | 'red'` to `'green' | 'red' | 'orange'`
- Add orange variant styles alongside existing green/red conditions:
  - Background: `bg-orange-500/10 hover:shadow-orange-300/40`
  - Icon: `text-orange-600`
  - Text: `text-orange-700`
  - Dark mode badge variants in the modal: `bg-orange-500/10 text-orange-700`

#### 3. `src/components/staffing/KPICardGroup.tsx`
Same as KPICard -- add `'orange'` variant support to the breakdown variant type and color mappings.

#### 4. `src/pages/staffing/StaffingSummary.tsx`
Change line 142 from `breakdownVariant: 'red'` to `breakdownVariant: 'orange'` on the Hired FTEs KPI config.

#### 5. `src/components/staffing/DraggableKPISection.tsx` (interface)
Update the `breakdownVariant` type in the `KPIData` interface from `'green' | 'red'` to `'green' | 'red' | 'orange'`.

### Result
The Hired FTEs + Open Reqs shared split bar, connector lines, and breakdown modal will use orange instead of red, visually aligning with the Positions module vacancy age badge color system.
