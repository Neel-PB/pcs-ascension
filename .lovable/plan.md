

## Wire Position Tabs to NestJS API

### Overview
Replace Supabase queries and dummy data across all 5 position tabs with a single NestJS API endpoint using flag-based filtering.

**API endpoint**: `GET /positions?flag={flag_name}&value=true&limit=200&offset=0`

### Flag Mapping

| Tab | Flag Parameter |
|-----|---------------|
| Employee | `employee_flag` |
| Contractor | `contractor_flag` |
| Open Position | `open_position_flag` |
| Open Requisition | `open_requisition_flag` |
| Contractor Requisition | `contractor_requisition_flag` |

### Changes

**1. New file: `src/hooks/usePositionsByFlag.ts`**
- Generic hook that accepts a `flag` string and filter params (region, market, facility, department)
- Fetches from `GET ${API_BASE_URL}/positions?flag={flag}&value=true&limit=1000&offset=0`
- Sends MSAL Bearer token via `Authorization` header
- Uses the same trailing-slash sanitization pattern as `useFilterData`
- Handles pagination if needed (multiple fetches with offset)
- Returns `{ data, isFetching }` matching the existing hook interface

**2. Delete: `src/hooks/useEmployees.ts`**
- Replaced by `usePositionsByFlag('employee_flag', ...)`

**3. Delete: `src/hooks/useContractors.ts`**
- Replaced by `usePositionsByFlag('contractor_flag', ...)`

**4. Delete: `src/hooks/useRequisitions.ts`**
- Replaced by `usePositionsByFlag('open_position_flag', ...)`

**5. Update: `src/pages/positions/EmployeesTab.tsx`**
- Replace `import { useEmployees }` with `import { usePositionsByFlag }`
- Change `useEmployees({...})` to `usePositionsByFlag('employee_flag', {...})`

**6. Update: `src/pages/positions/ContractorsTab.tsx`**
- Replace `import { useContractors }` with `import { usePositionsByFlag }`
- Change `useContractors({...})` to `usePositionsByFlag('contractor_flag', {...})`

**7. Update: `src/pages/positions/RequisitionsTab.tsx` (Open Position tab)**
- Replace `import { useRequisitions }` with `import { usePositionsByFlag }`
- Change `useRequisitions({...})` to `usePositionsByFlag('open_position_flag', {...})`

**8. Update: `src/pages/positions/OpenRequisitionTab.tsx`**
- Remove dummy data
- Add `usePositionsByFlag('open_requisition_flag', {...})` to fetch real data
- Accept and use filter props (currently ignored as `_props`)
- Add loading/empty states matching other tabs

**9. Update: `src/pages/positions/ContractorRequisitionTab.tsx`**
- Remove dummy data
- Add `usePositionsByFlag('contractor_requisition_flag', {...})` to fetch real data
- Accept and use filter props
- Add loading/empty states matching other tabs

### Technical Details

```typescript
// src/hooks/usePositionsByFlag.ts
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

export function usePositionsByFlag(flag: string, filters: {
  selectedRegion: string;
  selectedMarket: string;
  selectedFacility: string;
  selectedDepartment: string;
}) {
  const token = sessionStorage.getItem("msal_access_token");
  return useQuery({
    queryKey: ["positions", flag, filters],
    queryFn: async () => {
      const params = new URLSearchParams({ flag, value: "true", limit: "1000", offset: "0" });
      const res = await fetch(`${API_BASE_URL}/positions?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Positions API error: ${res.status}`);
      return res.json();
    },
    enabled: !!token,
  });
}
```

### Files Summary
- 1 new file (`usePositionsByFlag.ts`)
- 3 deleted files (`useEmployees.ts`, `useContractors.ts`, `useRequisitions.ts`)
- 5 updated files (all 5 tab components)

