

## Update PositionKPICards to Follow Helix Design System

### What Changes
Update the `PositionKPICards` component styling to match the Helix design system standards shown in the reference image.

### Current vs Target

| Property | Current | Helix Standard |
|----------|---------|---------------|
| Border radius | rounded-lg (8px) | rounded-xl (12px) |
| Shadow | none | shadow-md |
| Horizontal padding | px-3 (12px) | px-4 (16px) |
| Background | bg-muted/30 | bg-card |

### File Changed

| File | Change |
|------|--------|
| `src/components/positions/PositionKPICards.tsx` | Update card className from `rounded-lg border border-border bg-muted/30 px-3 py-2` to `rounded-xl border border-border bg-card shadow-md px-4 py-2` |

