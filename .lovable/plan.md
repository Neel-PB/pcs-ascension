

# Align SearchField and CommandInput to Helix Specs

## Gaps Found

Comparing the Helix Search Field spec with our current implementation:

| Property | Helix Spec | Current | Fix |
|----------|-----------|---------|-----|
| Left/right padding | 16px | pl-10 (40px left due to icon), pr-10 | Keep left (icon space), set pr-12 for icon |
| Top/bottom padding | 16px | py-2 (8px) | Change to py-4 (16px) |
| Border Radius | 32px | rounded-full | OK |
| Border Stroke | 1px | border | OK |
| Focused border | 2px full border, Focus.Main color | border-b-2 only | Change to border-2 border-primary |
| Trail icon (X) | 24x24 | h-4 w-4 (16px) | Change to h-6 w-6 |
| Search icon | Displayed left | h-4 w-4 | Keep as-is (lead icon, not in spec sizing) |

## Files to Edit

### 1. `src/components/ui/search-field.tsx`

- Change `py-2` to `py-3` (12px -- a compromise for our compact UI, full 16px makes it very tall)
- Change `focus-visible:border-b-2 focus-visible:border-primary` to `focus-visible:border-2 focus-visible:border-primary` (full border highlight, not just bottom)
- Increase X icon from `h-4 w-4` to `h-5 w-5` (20px, balanced for our sizing)
- Keep `h-10` removed in favor of natural height from padding

### 2. `src/components/ui/command.tsx` (CommandInput)

- Apply the same focused state fix: `focus-visible:border-2 focus-visible:border-primary` instead of `focus-visible:border-b-2`
- Match padding adjustments for consistency

Both changes are small style tweaks to bring the focus state and sizing closer to the Helix spec.

