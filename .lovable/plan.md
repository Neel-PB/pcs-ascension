

## Standardize & Reorder Floating Trigger Buttons

### Problem
- Triggers have inconsistent spacing (bottom-4, bottom-[68px], bottom-[120px], bottom-[168px]) — gaps are uneven (52px, 52px, 48px).
- Order from bottom needs to be: Feedback → AI Hub → Report Issue → Checklist.
- Currently Report Issue is above Checklist but the user wants it below Checklist (3rd from bottom).

### New Order & Positions (consistent 48px gap)

| # | Button | Position | Current |
|---|--------|----------|---------|
| 1 | Feedback | `bottom-4` (16px) | `bottom-4` ✓ |
| 2 | AI Hub | `bottom-[64px]` | `bottom-[68px]` |
| 3 | Report Issue | `bottom-[112px]` | `bottom-[168px]` |
| 4 | Checklist | `bottom-[160px]` | `bottom-[120px]` |

All buttons: `h-12 w-6`, `variant="ghost"`, `bg-primary hover:bg-primary/90`, `text-white`, same rounded/shadow/transition classes.

### Files to Edit

1. **`src/components/ai/AIHubTrigger.tsx`** — Change `bottom-[68px]` → `bottom-[64px]`
2. **`src/components/feedback/ReportIssueTrigger.tsx`** — Change `bottom-[168px]` → `bottom-[112px]`
3. **`src/components/workforce/WorkforceDrawerTrigger.tsx`** — Change `bottom-[120px]` → `bottom-[160px]`, change `variant="default"` → `variant="ghost"`, add `bg-primary hover:bg-primary/90 text-white` to match others

