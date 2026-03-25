

## Fix Trigger Button Spacing

### Problem
The four triggers have large 48px gaps between them, but the reference image shows them stacked tightly with small gaps (~8px between each button).

### Current vs New Positions

Each button is `h-12` (48px tall). With 8px gaps between buttons:

| # | Button | Current | New |
|---|--------|---------|-----|
| 1 | Feedback | `bottom-4` (16px) | `bottom-4` (16px) |
| 2 | AI Hub | `bottom-[64px]` | `bottom-[72px]` (16 + 48 + 8) |
| 3 | Report Issue | `bottom-[112px]` | `bottom-[128px]` (72 + 48 + 8) |
| 4 | Workforce Checklist | `bottom-[160px]` | `bottom-[184px]` (128 + 48 + 8) |

### Files to Edit

1. **`src/components/ai/AIHubTrigger.tsx`** — `bottom-[64px]` → `bottom-[72px]`
2. **`src/components/feedback/ReportIssueTrigger.tsx`** — `bottom-[112px]` → `bottom-[128px]`
3. **`src/components/workforce/WorkforceDrawerTrigger.tsx`** — `bottom-[160px]` → `bottom-[184px]`

