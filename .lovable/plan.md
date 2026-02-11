

# Replace Info Icon with Outlined Variant

## Change

Swap the `Info` icon from the filled `MdInfo` to the outlined `MdInfoOutline` variant across the app. This affects the employment type breakdown pills on KPI cards and any other component importing `Info` from `@/lib/icons`.

## File to Edit

**`src/lib/icons.ts`** (line 66)

Replace:
```ts
MdInfo as Info,
```

With:
```ts
MdInfoOutline as Info,
```

Also add `MdInfoOutline` to the import from `'react-icons/md'` (it should already be available in the `react-icons/md` package).

This is a single-line change in the central icon adapter -- every component that uses `Info` (including the KPICard breakdown pill) will automatically pick up the outlined variant.

