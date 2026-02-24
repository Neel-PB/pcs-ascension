

## Unify Header Element Heights to h-11 (44px)

All interactive elements in the header will be standardized to the same `h-11` (44px) height to match the positions toolbar and the reference image.

### Current Heights

| Element | Current Height |
|---------|---------------|
| Search field | h-11 (44px) -- already correct |
| Search icon button | h-10 (40px) |
| Notification bell | h-8 w-8 (32px) |
| Avatar | h-8 w-8 (32px) |
| User menu button | h-auto (content-driven) |
| Org logo (sidebar) | w-10 h-10 / img w-9 h-9 |

### Target: All h-11 (44px)

### Files Changed

| File | Change |
|------|--------|
| `src/components/shell/AppHeader.tsx` | Notification button: `h-8 w-8` to `h-11 w-11`; Avatar: `h-8 w-8` to `h-9 w-9`; User menu trigger button: add `h-11` |
| `src/components/ui/search-field.tsx` | Search icon button: `h-10 w-10` to `h-9 w-9` (fits inside h-11 input with 1px border padding) |
| `src/components/layout/OrganizationSwitcher.tsx` | Link container: `w-10 h-10` to `w-11 h-11`; Logo img: `w-9 h-9` to `w-10 h-10` |

### Details

1. **Notification bell button** -- change from `h-8 w-8` to `h-11 w-11`, keeping the icon at `h-6 w-6`
2. **User menu trigger** -- add explicit `h-11` so the button aligns; avatar inside stays `h-9 w-9` for visual balance
3. **Search field icon** -- keep at `h-9 w-9` (visually inset inside the h-11 input field, matching the reference)
4. **Org switcher logo** -- bump container to `w-11 h-11` and image to `w-10 h-10`
