

## Fix Report Issue Trigger: Overlap & Color

### Problem
- The Report Issue trigger (`bottom-[116px]`) overlaps with the Workforce/Positions Checklist trigger (`bottom-[120px]`).
- The Report Issue trigger uses red (`bg-destructive`) instead of matching the blue style of the other triggers.

### Current Stack (bottom to top)
| Button | Position |
|--------|----------|
| Feedback | `bottom-4` (16px) |
| AI Hub | `bottom-[68px]` |
| Report Issue | `bottom-[116px]` ← overlaps |
| Workforce Checklist | `bottom-[120px]` ← overlaps |

### Fix — `src/components/feedback/ReportIssueTrigger.tsx`

1. **Change position** from `bottom-[116px]` to `bottom-[168px]` — placing it above the Workforce Checklist trigger with proper spacing.
2. **Change color** from `bg-destructive hover:bg-destructive/90 text-destructive-foreground` to `bg-primary hover:bg-primary/90 text-white` to match the AI Hub and Feedback triggers.

### Updated Stack
| Button | Position |
|--------|----------|
| Feedback | `bottom-4` |
| AI Hub | `bottom-[68px]` |
| Workforce Checklist | `bottom-[120px]` |
| Report Issue | `bottom-[168px]` |

