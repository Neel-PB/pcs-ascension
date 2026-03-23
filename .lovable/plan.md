

## Fix: Transform AccessScope from Object to Array for Backend

### Problem
The backend expects `accessScope` as a flat array of assignment objects like:
```json
[
  { "region": "East" },
  { "market": "Florida" },
  { "facility_id": "FAC-001", "facility_name": "St. Vincent" },
  { "department_id": "DEP-001", "department_name": "Nursing", "facility_id": "FAC-001" }
]
```

But the frontend sends it as a structured object:
```json
{ "regions": [], "markets": [], "facilities": [], "departments": [] }
```

This causes the `400 Bad Request: "accessScope must be an array"` error.

### Fix

**File: `src/hooks/useUsers.ts`**

In both `createUser` and `updateUser` mutation functions, transform the `AccessScopeData` object into a flat array of assignment rows before sending to the API:

- Each selected **region** becomes `{ region: "East" }`
- Each selected **market** becomes `{ market: "Florida" }`
- Each selected **facility** becomes `{ facility_id: "...", facility_name: "..." }`
- Each selected **department** becomes `{ department_id: "...", department_name: "...", facility_id: "..." }`

Add a helper function `flattenAccessScope(data)` that converts the structured object to an array. Pass the flattened result in the API body. Also ensure `updateUser` sends `accessScope` (currently missing from its payload).

### Scope
Single file change: `src/hooks/useUsers.ts`. No UI or component changes needed.

