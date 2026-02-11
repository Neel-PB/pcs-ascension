

# Align Toast/Snackbar to Helix Snackbar Spec

## Helix Snackbar Spec Summary

| Property | Helix Value | Current (Sonner) | Current (Radix Toast) |
|----------|------------|------------------|----------------------|
| Position | Bottom center | Bottom-right (default) | Top mobile / bottom-right desktop |
| Auto-dismiss | 2500ms | 4000ms (default) | 1000000ms (never) |
| Animation enter | Slide up, 500ms ease-out | Default sonner | slide-in-from-bottom |
| Animation exit | Slide down, 400ms ease-in | Default sonner | slide-out-to-right |
| Variants | Success (green icon), Warning | No semantic styling | default, destructive |
| Close button | X icon, always visible | Hidden by default | Hidden until hover |
| Max concurrent | 1 | Multiple (default) | 1 (TOAST_LIMIT) |
| Corner radius | Rounded (consistent with cards = rounded-xl) | rounded-md | rounded-md |
| Anatomy | Leading icon + message + close button | Text only | Title + description |

## Strategy: Consolidate on Sonner

The project uses Sonner in 21 files and Radix Toast in only 3 files. Rather than maintaining two systems, we should:
1. Style Sonner to match Helix Snackbar spec (the primary change)
2. Migrate the 3 remaining Radix Toast usages to Sonner
3. Keep Radix Toast files in place (for safety) but they will no longer be actively used

## Files to Edit

### 1. `src/components/ui/sonner.tsx` -- Main Helix styling

Configure the Sonner `Toaster` to match Helix:
- **Position**: Set `position="bottom-center"`
- **Duration**: Set `duration={2500}` (2.5s auto-dismiss)
- **Max toasts**: Set `visibleToasts={1}` (limit concurrent snackbars)
- **Close button**: Set `closeButton={true}` (always show X)
- **Corner radius**: Update toast class to `rounded-xl` (12px, matching cards)
- **Shadow**: Use `shadow-md` (Helix elevation)
- **Border**: Remove border for a cleaner look matching the solid snackbar style
- **Icon support**: Sonner natively supports `toast.success()` and `toast.warning()` which map directly to Helix Success and Warning variants
- **Animation**: Configure `duration` for CSS transitions to approximate 500ms enter / 400ms exit via custom CSS

### 2. `src/index.css` -- Custom animation timing

Add CSS overrides for Sonner animation timing:
- Enter: 500ms ease-out (slide up)
- Exit: 400ms ease-in (slide down)
- These override Sonner's default animation speed to match Helix motion spec

### 3. `src/hooks/useForecastPositions.ts` -- Migrate from Radix to Sonner

- Change import from `import { toast } from "@/hooks/use-toast"` to `import { toast } from "sonner"`
- Update all `toast({ title, description, variant })` calls to `toast.success(title, { description })` or `toast.error(title, { description })` based on context (success vs error)

### 4. `src/components/messaging/FeedComposer.tsx` -- Migrate from Radix to Sonner

- Change import from `import { useToast } from "@/hooks/use-toast"` to `import { toast } from "sonner"`
- Remove `const { toast } = useToast()` line
- Update toast call syntax to match Sonner API

### 5. `src/pages/support/SupportPage.tsx` -- Migrate from Radix to Sonner

- Same import migration as above

### 6. `src/components/ui/toast.tsx` -- Update styling (kept for backward compat)

Even though we are migrating away from Radix Toast, update the styling for safety:
- Corner radius: `rounded-md` to `rounded-xl`
- Position: bottom-center instead of bottom-right
- Close button: always visible (remove `opacity-0` / `group-hover:opacity-100`)

### 7. `src/components/ui/toaster.tsx` -- Keep but unused

No changes needed; the Radix Toaster will remain in App.tsx but with no active consumers after migration.

## What Users Will See After This Change

- Toast notifications appear at the **bottom center** of the screen
- Rounded corners matching the card style (12px)
- Success toasts show a green checkmark icon (Sonner built-in)
- Warning/error toasts show appropriate colored icons
- Close button (X) always visible on the right
- Auto-dismiss after 2.5 seconds
- Only one toast visible at a time
- Smooth slide-up entrance and slide-down exit animation

