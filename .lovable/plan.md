

## Strip department IDs from name display

### Problem
The `concat_dept_name` field from the patient-volume API includes IDs like `"26012 10162 - Mother Baby Unit 001"`. The user wants only the name portion (e.g., `"Mother Baby Unit 001"`).

### Fix in `src/pages/staffing/SettingsTab.tsx` (line 66)

Extract the name after the last ` - ` delimiter:

```typescript
// Before:
department_name: record.concat_dept_name,

// After:
department_name: record.concat_dept_name?.includes(' - ')
  ? record.concat_dept_name.split(' - ').slice(1).join(' - ')
  : record.concat_dept_name,
```

Uses `slice(1).join(' - ')` so if the name itself contains ` - `, it's preserved. Only the leading ID segment is removed.

### Scope
Single line change in `SettingsTab.tsx`.

