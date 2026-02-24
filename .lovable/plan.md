

## Fix Invisible Dropdown List in Forecast Filters

### Problem

The Skill Type and Shift filter dropdowns open but their items are not visible. The `SelectContent` in `ForecastTab.tsx` has `className="min-w-[210px] bg-background z-50"`, where `z-50` overrides the component's default `z-[200]`, causing the dropdown to render behind the table.

### Fix

| File | Change |
|------|--------|
| `src/pages/staffing/ForecastTab.tsx` | Remove `z-50` from both `SelectContent` classNames so the default `z-[200]` from the Select component applies correctly |

### Details

Both SelectContent elements (Skill Type and Shift) currently have:
```
className="min-w-[210px] bg-background z-50"
```

Change to:
```
className="min-w-[210px] bg-background"
```

The base `SelectContent` component already applies `z-[200]`, which is sufficient to render above all other page content.
