

## Style the "Need Help?" Banner to Follow Helix Card Standards

### Problem

The "Need Help?" contact banner on the Support page uses `bg-shell-elevated` instead of the standard Helix card styling (`bg-card`), making it visually inconsistent with other cards in the application.

### Change

| File | Change |
|------|--------|
| `src/pages/support/SupportPage.tsx` | Update the "Need Help?" banner div (line 135) to use `bg-card` background with `border border-border` to match Helix card standards. |

### Details

Replace the banner's class from `bg-shell-elevated` to `bg-card border border-border`, keeping the existing `rounded-xl px-4 py-3 shadow-md` classes. This aligns with the Helix Design System card spec: `rounded-xl` (12px radius), `shadow-md`, `px-4` internal padding, and proper card background with border.

