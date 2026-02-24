

## Gate Volume Settings and NP Settings Guides by Permission

### Problem

The Volume Settings and NP Settings guides in User Guides are currently visible to anyone with `staffing.access`, but the actual tabs in Staffing are gated behind `settings.volume_override` and `settings.np_override` respectively. A user who can't see the tab shouldn't see the guide either.

### Change

| File | Change |
|------|--------|
| `src/components/support/UserGuidesTab.tsx` | Add per-guide permission overrides for `staffing-volume-settings` and `staffing-np-settings` so they require `settings.volume_override` and `settings.np_override` in addition to `staffing.access`. |

### Details

Add a `guidePermissionMap` (similar to the existing `overlayPermissionMap`) that maps specific guide `tourKey` values to additional required permissions:

```text
staffing-volume-settings -> settings.volume_override
staffing-np-settings     -> settings.np_override
```

In the `guidesWithSteps` filter, after passing the category-level check, also check this guide-level map. If the user lacks the specific permission, the guide is hidden. This mirrors the exact same pattern already used for overlay-level filtering (the `overlayPermissionMap`).

No other files need changes -- the staffing tabs themselves already enforce these permissions correctly.

