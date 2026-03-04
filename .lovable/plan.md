

## Investigation: Missing Fields in Position Detail Sheets

### Findings

**Root Cause**: The `normalizeRow` function in `usePositionsByFlag.ts` only normalizes 8 fields. All other fields pass through via `...row` spread with their original API names. When the NestJS API returns snake_case or differently-cased field names, the UI shows "—" because it looks for the wrong property name.

**Currently normalized fields** (8 total):
`id`, `positionNum`, `FTE`, `actual_fte`, `positionStatusDate`, `departmentName`, `employmentType`, `skillMix`, `facility_name`

**Missing from normalization** (fields the detail sheets expect but API may return differently):

| UI expects | API likely returns | Used in |
|---|---|---|
| `jobcode` | `jobCode` | EmployeeDetailsSheet |
| `jobFamily` | `job_family` | EmployeeDetailsSheet |
| `facilityName` | `businessUnitDescription` or `facility_name` | All detail sheets |
| `standardHours` | `standard_hours` | EmployeeDetailsSheet |
| `employeeType` | `employee_type` | EmployeeDetailsSheet |
| `employmentFlag` | `employment_flag` | EmployeeDetailsSheet |
| `employeeId` | `employee_id` | EmployeeDetailsSheet |
| `employeeName` | `employee_name` | All detail sheets |
| `managerName` | `manager_name` | EmployeeDetailsSheet |
| `managerEmployeeId` | `manager_employee_id` | EmployeeDetailsSheet |
| `payrollStatus` | `payroll_status` | All detail sheets |
| `shift` | `shift` | (likely fine) |

**Region is missing entirely** from the Location section in all detail sheets.

### Plan

**1. Expand `normalizeRow` in `usePositionsByFlag.ts`**
Add fallback mappings for every field the detail sheets consume:
```typescript
const normalizeRow = (row: any) => ({
  ...row,
  id: row.positionKey ?? row.id,
  positionNum: row.positionNumber ?? row.positionNum,
  FTE: parseFloat(row.hiredFte ?? row.FTE) || 0,
  actual_fte: parseFloat(row.activeFte ?? row.actual_fte) || 0,
  positionStatusDate: row.posStatusDate ?? row.positionStatusDate,
  departmentName: row.departmentDescription ?? row.departmentName ?? row.department_name,
  employmentType: row.employmentType ?? row.employment_type,
  skillMix: row.skill_mix ?? row.skillMix,
  facilityName: row.businessUnitDescription ?? row.facilityName ?? row.facility_name,
  jobcode: row.jobcode ?? row.jobCode ?? row.job_code,
  jobFamily: row.jobFamily ?? row.job_family,
  jobTitle: row.jobTitle ?? row.job_title,
  standardHours: row.standardHours ?? row.standard_hours,
  employeeType: row.employeeType ?? row.employee_type,
  employmentFlag: row.employmentFlag ?? row.employment_flag,
  employeeId: row.employeeId ?? row.employee_id,
  employeeName: row.employeeName ?? row.employee_name,
  managerName: row.managerName ?? row.manager_name,
  managerEmployeeId: row.managerEmployeeId ?? row.manager_employee_id,
  managerPositionNum: row.managerPositionNum ?? row.manager_position_num,
  payrollStatus: row.payrollStatus ?? row.payroll_status,
  shift: row.shift,
  region: row.region,
  market: row.market,
});
```

**2. Add Region to all detail sheets' Location section**
- `EmployeeDetailsSheet.tsx` — add Region field above Market
- `ContractorDetailsSheet.tsx` — same
- `RequisitionDetailsSheet.tsx` — same
- `PositionToOpenDetailsSheet.tsx` / `PositionToCloseDetailsSheet.tsx` — same if they have Location sections

**3. Use `facilityName` consistently in detail sheets**
The sheet currently reads `employee.facilityName` — after normalization this will work correctly since `normalizeRow` will map `facility_name`/`businessUnitDescription` → `facilityName`.

