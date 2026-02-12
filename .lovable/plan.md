

## Fix Role Badge Readability in Users Table

### Problem
Roles like "Manager", "Director", "Cno", and "Leadership" fall into the `default` switch case and get the `secondary` badge variant, which has very low contrast (light gray background with muted text). Only "Admin" (red) and "Labor Team" (blue) are readable.

### Solution
Update `getRoleBadgeVariant` in `src/config/userColumns.tsx` to assign all roles a readable, colored badge variant instead of falling back to `secondary`.

### Specific Changes

**File: `src/config/userColumns.tsx`**

Update the `getRoleBadgeVariant` function to map each role to a visually distinct, high-contrast variant:

- `admin` -- `destructive` (red background, white text) -- unchanged
- `labor_team` -- `default` (primary blue background, white text) -- unchanged
- `manager`, `director`, `cno`, `leadership` and any other role -- `outline` (border with foreground text) instead of `secondary`

Additionally, increase the badge font size from `text-[10px]` to `text-xs` (12px) and add slightly more padding (`px-2 py-0.5`) for better readability across all roles.

### Result
- All role badges will have readable text with sufficient contrast
- Badge sizing will be consistent and large enough to read comfortably
- Named roles get distinct styling; unknown future roles default to a clean outlined style

