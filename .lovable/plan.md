

# Switch App Font from Inter to Whitney

## Overview

Replace the Inter font with Ascension's Whitney font family across the entire application using the 9 uploaded font files.

## Step 1: Copy Font Files

Copy all 9 Whitney `.otf` files into `public/fonts/` (public directory is best for CSS `@font-face` references):

- `whitneylight.otf` (300)
- `whitneylightitalic.otf` (300 italic)
- `whitneybook.otf` (400)
- `whitneybookitalic.otf` (400 italic)
- `whitneymedium.otf` (500)
- `whitneymediumitalic.otf` (500 italic)
- `whitneysemibold.otf` (600)
- `WhitneySemiboldItalic.otf` (600 italic)
- `whitneybold.otf` (700)

## Step 2: Add @font-face Declarations in `src/index.css`

Add `@font-face` rules at the top of the file before `@tailwind` directives, mapping each file to the correct weight/style:

```css
@font-face {
  font-family: 'Whitney';
  src: url('/fonts/whitneylight.otf') format('opentype');
  font-weight: 300;
  font-style: normal;
  font-display: swap;
}
/* ... one block per file, 9 total */
```

## Step 3: Update Body Font Stack in `src/index.css`

Replace the Inter reference with Whitney:

```css
/* Before */
font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

/* After */
font-family: "Whitney", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
```

## Step 4: Update Tailwind Config (if needed)

Add Whitney to the `fontFamily` extend in `tailwind.config.ts` so `font-sans` resolves to Whitney:

```ts
fontFamily: {
  sans: ['"Whitney"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
},
```

## Weight Mapping Summary

| File | Weight | Style | Typical Use |
|------|--------|-------|-------------|
| whitneylight | 300 | normal | Subtle/secondary text |
| whitneylightitalic | 300 | italic | Emphasis on light text |
| whitneybook | 400 | normal | Body text (default) |
| whitneybookitalic | 400 | italic | Body emphasis |
| whitneymedium | 500 | normal | Semi-prominent labels |
| whitneymediumitalic | 500 | italic | Semi-prominent emphasis |
| whitneysemibold | 600 | normal | Subheadings, buttons |
| WhitneySemiboldItalic | 600 | italic | Subheading emphasis |
| whitneybold | 700 | normal | Headings, strong emphasis |

## What stays the same

- All component code, Tailwind classes (`font-normal`, `font-medium`, `font-semibold`, `font-bold`) will automatically use the correct Whitney weight
- Color tokens, spacing, layout -- unchanged
- Dark mode -- unchanged

