

## Fix: Paginated fetching for patient-volume API

### Problem
`usePatientVolume` fetches only one page of data. The API uses `take` (not `limit`) for pagination, defaulting to 500.

### Change: `src/hooks/usePatientVolume.ts`

Refactor `fetchPatientVolume` to loop with `take=1000` and `offset`, accumulating all pages until complete — matching the pattern already used in `useSkillShift`.

```typescript
async function fetchPatientVolume(filters: PatientVolumeFilters): Promise<PatientVolumeRecord[]> {
  const PAGE_SIZE = 1000;
  const allRecords: PatientVolumeRecord[] = [];
  let offset = 0;

  const baseParams = new URLSearchParams();
  if (filters.region) baseParams.append('region', filters.region);
  // ... other filters ...

  while (true) {
    const params = new URLSearchParams(baseParams);
    params.append('take', String(PAGE_SIZE));
    params.append('offset', String(offset));

    const res = await fetch(`${API_BASE_URL}/patient-volume?${params}`, { headers: getAuthHeaders() });
    // parse, accumulate, break when done
    offset += PAGE_SIZE;
  }
  return allRecords;
}
```

### Scope
Single file change in `usePatientVolume.ts`.

