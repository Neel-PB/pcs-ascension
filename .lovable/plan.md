

# Align Avatar Component to Helix Avatar Spec

## Helix Spec Summary (from PDF)

| Property | Helix Value | Current Implementation |
|----------|------------|----------------------|
| Shape | Circle | Circle (correct) |
| Letters fallback color | Solid brand color (teal #00a791) | `bg-muted` (gray) -- wrong |
| Letters text color | Content.Inverse (white) | Inherits foreground -- wrong |
| Icon avatar padding | 8px (space-sm) all sides | No specific padding |
| Image avatar | Fills entire space, clipped by shape | Correct (`aspect-square h-full w-full`) |
| Avatar group spacing | -8px overlap, leftmost on top | Not implemented (no avatar group component) |
| Avatar group border | 2px outside border matching background | Not implemented |

## Key Issue

The fallback avatar styling is inconsistent across the app:
- `AppHeader.tsx` uses `bg-gradient-primary text-white` (close but gradient, not solid)
- All other files use default `bg-muted` (gray background) with no white text
- Helix spec calls for a **solid brand teal** background with **white** text

## Plan

### 1. `src/components/ui/avatar.tsx` -- Update default fallback styling

Change the `AvatarFallback` default class from `bg-muted` to the Ascension teal color with white text:
- Background: Use the Ascension teal (`bg-[#00a791]`) as the default fallback color
- Text: `text-white` (Content.Inverse per spec)
- Font: `font-medium` for clear letter rendering

This single change fixes all avatar fallbacks across the app since they all inherit from this base component.

### 2. `src/components/shell/AppHeader.tsx` -- Simplify fallback class

Remove the override `bg-gradient-primary text-white text-sm font-medium` since the base component now handles the correct styling. Simplify to just `text-sm` (size override only).

### 3. `src/components/ui/avatar.tsx` -- Add AvatarGroup component (optional)

Add an `AvatarGroup` wrapper component for the overlap pattern:
- Negative margin (`-space-x-2`) for -8px overlap
- Children rendered with `ring-2 ring-background` for the 2px border
- `flex flex-row-reverse` so leftmost avatar appears on top (z-index stacking)

This component exists in the spec but may not be actively used yet -- adding it ensures future compatibility.

## Files to Edit

1. **`src/components/ui/avatar.tsx`** -- Change `AvatarFallback` default from `bg-muted` to `bg-[#00a791] text-white font-medium`; optionally add `AvatarGroup`
2. **`src/components/shell/AppHeader.tsx`** -- Remove redundant `bg-gradient-primary text-white font-medium` from fallback, keep only size override

## What Changes Visually

- All letter/initials avatars across the app will show a **teal circle with white text** instead of a gray circle
- The header avatar will use the same solid teal instead of a gradient
- Consistent brand-aligned avatar appearance everywhere (tables, comments, feeds, profile)
