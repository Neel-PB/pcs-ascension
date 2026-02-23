

## Show Total Counts in Employee Column Headers

### Problem
1. The Supabase query in `useEmployees` uses the default 1000-row limit, so large datasets get truncated silently.
2. The column headers for Employee Name, Hired FTE, and Active FTE show only static labels with no aggregate totals.

### Solution

#### 1. Fix data fetching to return ALL employees (not capped at 1000)

**File: `src/hooks/useEmployees.ts`**

Use a two-step approach: first query with `select('*', { count: 'exact', head: true })` to get the total count, then fetch all rows using `.range()` in batches of 1000 if needed. Alternatively, simply set an explicit large limit (e.g., 10000) since the dataset is ~7000 records.

The simplest reliable approach: use `.select('*', { count: 'exact' })` and then loop with `.range(from, to)` to fetch all pages.

#### 2. Compute totals from fetched data

**File: `src/pages/positions/EmployeesTab.tsx`**

After data is fetched, compute:
- `totalEmployees` = `employees.length` (total count)
- `totalHiredFTE` = sum of all `FTE` values
- `totalActiveFTE` = sum of all `actual_fte` values (falling back to `FTE` when `actual_fte` is null)

#### 3. Pass totals into column definitions via `renderHeader`

**File: `src/config/employeeColumns.tsx`**

Update `createEmployeeColumnsWithComments` to accept a `totals` object and override `renderHeader` for three columns:

- **Employee Name**: `Employee Name (7,234)` -- total count
- **Hired FTE**: `Hired FTE (5,120.5)` -- sum of hired FTE
- **Active FTE**: `Active FTE (4,890.0)` -- sum of active FTE

Each total will be displayed as a smaller, muted-foreground number next to the label.

### Technical Details

**`src/hooks/useEmployees.ts`** -- Paginated fetch:
```typescript
queryFn: async () => {
  const baseQuery = () => {
    let q = supabase.from("positions").select("*", { count: "exact" })
      .eq("positionLifecycle", "Filled")
      .not("employmentFlag", "like", "%Contingent%");
    // apply filters...
    return q;
  };

  // First get count
  const { count } = await baseQuery().limit(0);
  if (!count) return [];

  // Fetch in pages of 1000
  const pages = Math.ceil(count / 1000);
  const allData = [];
  for (let i = 0; i < pages; i++) {
    const { data } = await baseQuery()
      .range(i * 1000, (i + 1) * 1000 - 1)
      .order("employeeName", { ascending: true });
    if (data) allData.push(...data);
  }
  return allData;
};
```

**`src/config/employeeColumns.tsx`** -- Updated signature:
```typescript
interface EmployeeTotals {
  totalCount: number;
  totalHiredFTE: number;
  totalActiveFTE: number;
}

export const createEmployeeColumnsWithComments = (
  commentCounts: Map<string, number>,
  onRowClick: (row: Position) => void,
  onUpdateShiftOverride?: ShiftOverrideHandler,
  totals?: EmployeeTotals
): ColumnDef<Position>[] => {
  // Override renderHeader for employeeName, FTE, actual_fte columns
};
```

**`src/pages/positions/EmployeesTab.tsx`** -- Compute and pass totals:
```typescript
const totals = useMemo(() => {
  if (!employees) return { totalCount: 0, totalHiredFTE: 0, totalActiveFTE: 0 };
  return {
    totalCount: employees.length,
    totalHiredFTE: employees.reduce((sum, e) => sum + (Number(e.FTE) || 0), 0),
    totalActiveFTE: employees.reduce((sum, e) => sum + (Number(e.actual_fte ?? e.FTE) || 0), 0),
  };
}, [employees]);
```

### Files Changed
- `src/hooks/useEmployees.ts` -- paginated fetch to get all rows
- `src/config/employeeColumns.tsx` -- accept totals, render in headers
- `src/pages/positions/EmployeesTab.tsx` -- compute totals, pass to column config
