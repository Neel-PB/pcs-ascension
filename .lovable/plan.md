

## Switch Header Icons to Outlined Variants

### What Changes

The notification bell, sun, moon, and monitor icons in the header currently use filled Material Design icons. They need to switch to outlined variants to match the design system standard.

### Current vs. New

| Icon | Current (Filled) | New (Outlined) |
|------|-------------------|-----------------|
| Bell | `MdNotifications` | `MdOutlineNotifications` |
| Sun | `MdLightMode` | `MdOutlineLightMode` |
| Moon | `MdDarkMode` | `MdOutlineDarkMode` |
| Monitor | `MdMonitor` | `MdOutlineMonitor` |

### File Changed

| File | Change |
|------|--------|
| `src/lib/icons.ts` | Update 4 icon mappings from filled to outlined variants |

### Technical Detail

In `src/lib/icons.ts`, replace:
- Line 22: `MdNotifications as Bell` with `MdOutlineNotifications as Bell`
- Line 84: `MdMonitor as Monitor` with `MdOutlineMonitor as Monitor`
- Line 85: `MdDarkMode as Moon` with `MdOutlineDarkMode as Moon`
- Line 111: `MdLightMode as Sun` with `MdOutlineLightMode as Sun`

No other files need changes since all components import from `@/lib/icons`.

