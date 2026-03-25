/**
 * Toolbar / search glyph size only — keep surrounding circles at default `Button size="icon"` / SearchField dimensions.
 */
export const ICON_CHROME = 'h-3.5 w-3.5 shrink-0';

/** Magnifying glass in `SearchField` circular button — circle size unchanged; slightly larger than `ICON_CHROME`. */
export const ICON_SEARCH_FIELD = 'h-4 w-4 shrink-0';

/** Header notification bell glyph — pair with `BTN_HEADER_ICON`; keep dimensions in sync with its `[&_svg]` rules. */
export const ICON_HEADER_BELL = 'h-4 w-4 shrink-0';

/**
 * Header ghost `Button` + `size="icon"` (e.g. notifications bell). Same `size="icon"` SVG override issue
 * as ascension toolbar — use with `ICON_HEADER_BELL` on the icon.
 */
export const BTN_HEADER_ICON =
  'relative h-9 w-9 [&_svg]:!h-4 [&_svg]:!w-4 [&_svg]:shrink-0';

/** Glyph inside ascension round toolbar buttons (refresh, download, expand, filter). */
export const ICON_ASCENSION_ACTION = 'h-4 w-4 shrink-0';

/**
 * Round ascension toolbar controls: Staffing (variance / planning) + Positions (refresh / filter).
 * `Button` `size="icon"` applies `[&_svg]:size-6`, which overrides icon `className`; the `[&_svg]:!…`
 * rules here win so `ICON_ASCENSION_ACTION` actually applies. Keep dimensions in sync with it.
 */
export const BTN_ASCENSION_TOOLBAR =
  'h-8 w-8 [&_svg]:!h-4 [&_svg]:!w-4 [&_svg]:shrink-0';
