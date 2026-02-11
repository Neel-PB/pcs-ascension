

# Replace Outline Material Icons with Filled Variants

## What's Changing

Only 2 icons in `src/lib/icons.ts` are using explicit outline variants. Everything else is already filled.

| Current (Outline) | Replacement (Filled) | Alias |
|---|---|---|
| `MdErrorOutline` | `MdError` | AlertCircle |
| `MdHelpOutline` | `MdHelp` | HelpCircle |

## Technical Detail

Update `src/lib/icons.ts`:
- Line 14: Change `MdErrorOutline as AlertCircle` to `MdError as AlertCircle`
- Line 61: Change `MdHelpOutline as HelpCircle` to `MdHelp as HelpCircle`

No other files need changes since they all import via the alias names from `@/lib/icons`.

## Note

The remaining ~120 icons (including all sidebar icons) are already using filled Material Design variants. If specific icons still look "outlined" after this change, that is simply the filled icon's design in Google's Material icon set -- not an outline variant.

