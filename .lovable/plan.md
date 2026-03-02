

## Fix: Map API Response Fields to UI-Expected Field Names

### Problem
The NestJS API returns position data with different field names than what the UI columns and tab logic expect. For example, the API returns `positionNumber` but the table column looks for `positionNum`. This is why the data loads but columns appear empty.

### Field Mapping (API → UI)

| API Field | UI Expected Field | Used In |
|-----------|------------------|---------|
| `positionNumber` | `positionNum` | All tab columns (Position #) |
| `hiredFte` | `FTE` | Employee/Contractor tabs (Hired FTE) |
| `activeFte` | `actual_fte` | Employee/Contractor tabs (Active FTE) |
| `posStatusDate` | `positionStatusDate` | Requisition tab (Vacancy Age calc) |
| `departmentDescription` | `departmentName` | Search filters across all tabs |
| `employeeType` | `employmentType` | All tabs (Full/Part Time column) |
| `businessUnitDescription` | `facility_name` | Detail sheets, forecast checklist |
| `positionKey` | `id` | Row identification, comment counts |

Fields that already match (no mapping needed): `employeeName`, `jobTitle`, `jobFamily`, `payrollStatus`, `shift`, `positionLifecycle`, `region`, `market`, `vacancyAge`.

### Solution
Add a normalization step in `usePositionsByFlag` that maps API field names to UI-expected names before returning the data. This is done once at the data-fetching layer so all tabs, columns, search filters, and detail sheets work without any changes.

### Technical Details

**File: `src/hooks/usePositionsByFlag.ts`**

After extracting `rows` from the API response, map each row through a normalizer function:

```typescript
const normalizeRow = (row: any) => ({
  ...row,
  id: row.positionKey ?? row.id,
  positionNum: row.positionNumber ?? row.positionNum,
  FTE: row.hiredFte ?? row.FTE,
  actual_fte: row.activeFte ?? row.actual_fte,
  positionStatusDate: row.posStatusDate ?? row.positionStatusDate,
  departmentName: row.departmentDescription ?? row.departmentName,
  employmentType: row.employeeType ?? row.employmentType,
  facility_name: row.businessUnitDescription ?? row.facility_name,
});
```

Each mapping uses a fallback (`??`) so if the API ever returns the old field name, it still works. This is a single-file change with no impact on columns, tabs, or detail sheets.
