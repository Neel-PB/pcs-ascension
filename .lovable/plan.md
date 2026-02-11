

# Align ToggleButtonGroup to Helix Toggle Button Spec

## What the Helix Spec Defines

From the Toggle Button component page (Outlined variant, which we use):

| Property | Helix Spec | Current Implementation | Change Needed |
|----------|-----------|----------------------|---------------|
| Container border | 2px stroke, Primary.Main | `border-2 border-primary` | No change |
| Container corners | rounded-full | `rounded-full` | No change |
| Active fill | Primary.Main background | `bg-primary` | No change |
| Active text | White (primary-foreground) | `text-primary-foreground` | No change |
| Inactive text | Darker text (appears near-black in anatomy) | `text-muted-foreground` | Change to `text-foreground` |
| Container padding | Visible internal spacing (~4px) in anatomy | `p-0.5` (2px) | Increase to `p-1` (4px) |
| Button internal padding | Generous horizontal padding visible | `px-4 py-1.5` | Increase to `px-5 py-2` for better touch targets |
| Button gap (icon to label) | Standard spacing | `gap-1.5` | No change |
| Font weight | Medium weight in anatomy | `font-medium` | No change |
| Hover on inactive | Subtle hover state | `hover:text-foreground` | Add `hover:bg-muted/50` for subtle background |

## File to Edit

**`src/components/ui/toggle-button-group.tsx`**

### Changes:
1. **Container padding**: `p-0.5` to `p-1` -- more breathing room between container border and buttons, matching the anatomy diagram
2. **Container gap**: `gap-0.5` to `gap-0.5` -- keep tight gap between buttons
3. **Button padding**: `px-4 py-1.5` to `px-5 py-2` -- slightly larger touch targets matching the anatomy proportions
4. **Inactive text**: `text-muted-foreground` to `text-foreground` -- spec shows darker text for unselected buttons
5. **Hover state**: Add `hover:bg-muted/50 hover:rounded-full` for a subtle background tint on hover (inactive items)

These are small refinements to better match the Helix anatomy proportions while keeping the existing framer-motion animation and outlined variant structure intact.
