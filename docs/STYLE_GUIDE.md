# Philo Genève frontend style guide

This document captures the established visual direction of the frontend. Read
it before changing layout, styling, typography, color, brand placement, or
responsive behavior.

## Design character

The interface should feel like a contemporary cultural institution or an
independent editorial publication: thoughtful, clear, composed, and open. It
should not look like a generic SaaS dashboard or a direct copy of another
cultural website.

The main characteristics are:

- editorial hierarchy rather than card-heavy application styling;
- large but moderated display typography;
- deliberate whitespace without large empty viewport-filling gaps;
- asymmetric compositions held together by a strict shared grid;
- thin rules and typography as the primary means of organization;
- geometric motifs derived from the logo artwork;
- restrained color, with the motifs providing the visual emphasis.

## Source of truth

Shared visual values belong in `src/styles/tokens.css`. Components must consume
tokens rather than repeat literal colors, spacing values, shadows, radii, or
breakpoints.

If a visual decision should affect multiple areas, change or add a semantic
token first. Do not solve system-wide changes with scattered component
overrides.

## Color system

The page uses one continuous cream canvas:

```css
--color-background: #f4f0e7;
```

Do not alternate large sections between light and dark backgrounds by default.
Sections should normally share the cream background and be separated by thin
rules.

Deep navy is the structural color for primary text, navigation, controls, and
strong contrast:

```css
--color-ink: #172335;
--color-primary: #172335;
--color-primary-hover: #293b55;
--color-primary-soft: #506077;
```

Secondary text, borders, badges, and shadows use coordinated blue-gray
neutrals. Consume their semantic tokens instead of introducing new gray or
navy values locally.

### Brand colors and motif colors

Keep the original saturated brand colors available for identity-critical use
and preserve the colors embedded in approved logo assets:

```css
--color-brand-red: #f20d16;
--color-brand-blue: #315fa9;
--color-brand-grey: #9a9a96;
```

Decorative webpage geometry uses a softer, mid-strength palette:

```css
--color-motif-red: #ec5b5d;
--color-motif-blue: #688aba;
--color-motif-grey: #b0aea8;
```

Use motif tokens for squares, bars, lines, dots, poster graphics, and other
logo-derived decoration. Do not recolor the logo asset itself and do not use
the saturated brand colors for large decorative surfaces by default.

Motifs should support the composition rather than decorate every empty area.
One to three simple shapes in a major region is normally enough.

## Typography

The typography combines a restrained sans-serif body face with an editorial
serif heading face. Use the existing font tokens:

```css
--font-body: "DM Sans", sans-serif;
--font-heading: "Playfair Display", serif;
```

Display headings may be large, but they must not dominate an entire viewport:

```css
--font-size-display: clamp(3rem, 7.5vw, 7rem);
--font-size-section: clamp(2.1rem, 4vw, 4rem);
--line-height-display: 0.88;
```

Guidelines:

- Use the serif face for expressive page and section headings.
- Use the sans-serif face for body copy, navigation, labels, and metadata.
- Keep display headings compact with controlled line-height and slightly tight
  letter spacing.
- Use uppercase, tracked labels sparingly for eyebrows, categories, and dates.
- Keep long institutional copy at normal body size with approximately `1.6`
  line-height.
- Avoid adding more typefaces without a deliberate system-wide decision.

## Width, grid, and alignment

Use the shared page measurements:

```css
--page-width: 78rem;
--page-gutter: clamp(1.25rem, 4vw, 4.5rem);
```

Primary page regions use this outer-width calculation:

```css
width: min(
  100%,
  calc(var(--page-width) + var(--page-gutter) + var(--page-gutter))
);
margin-inline: auto;
```

Their content is inset by `var(--page-gutter)`. Section separators must use
exactly the same centered outer width as the header separator. Do not create
full-viewport rules or separators narrower than the shared header width.

Asymmetry is encouraged inside this grid: offset headlines, unequal columns,
poster-like blocks, and deliberately unbalanced geometry are appropriate.
Outer boundaries and repeated alignments must remain consistent.

## Spacing and section rhythm

Whitespace should feel generous but efficient. Avoid minimum heights based on
the viewport for ordinary sections; content should determine section height.

Current direction:

- Hero padding is roughly `2rem` to `3.5rem`, responsively.
- Standard editorial sections use roughly `3rem` to `6rem` of vertical
  padding depending on their density.
- Dense institutional copy uses roughly `2.5rem` to `4.5rem` of section
  padding.
- Reduce internal gaps before reducing readable line-height or column width.

Avoid large blank regions created by `min-height: 100vh`, `margin-top: auto`,
or oversized fixed padding. Oversized typography and open space remain part of
the identity, but both are moderated.

## Section boundaries

The default landing-page rhythm is a continuous background with thin inset
separators:

```css
border-top: 1px solid var(--color-border);
```

The separator width must match the header's outer width exactly. Background
changes should be reserved for a clear functional need, not used merely to
distinguish consecutive sections.

## Brand mark

The shared `BrandMark` component owns logo sizing and its default asset. The
current default is `src/assets/brand/compactbrandmark.png`.

Place the primary mark at the upper-left of headers, forms, and branded
layouts. Preserve its aspect ratio and transparent trim. Do not redraw its
wordmark in adjacent text or recolor the bitmap through CSS.

Decorative shapes may echo the logo's square and linear forms, but must use the
motif palette rather than sampling or modifying the logo image.

## Components and page composition

Prefer semantic editorial structures over generic panels:

- featured content may use a poster-like graphic beside descriptive copy;
- dates and formats should read as metadata, not badges by default;
- important links may use a thin top or bottom rule and a restrained arrow;
- institutional copy should use balanced text columns rather than cards;
- footers should align to the same grid and width as the rest of the page.

Cards remain appropriate for authenticated application data and forms, but
should not become the default structure of public editorial pages.

## Interaction

Interactions should be quiet and immediate:

- use opacity, underline, or subtle color changes for hover states;
- preserve visible keyboard focus states;
- avoid decorative motion that competes with reading;
- respect `prefers-reduced-motion`;
- do not rely on color alone to communicate meaning.

## Responsive behavior

Build mobile-first and preserve the editorial hierarchy at narrow widths.

- Collapse multi-column sections into a clear single-column reading order.
- Keep the logo and member entry visible even when secondary navigation is
  hidden.
- Scale display typography through tokens rather than isolated media-query
  values.
- Reduce offset headings and decorative geometry when they threaten content
  legibility.
- Maintain shared gutters and aligned separators at every viewport width.

## Content and localization

French is the default language. All user-facing copy stays in colocated text
maps with matching `fr`, `de`, `it`, and `en` structures, as required by
`AGENTS.md`.

The writing style should be precise, welcoming, and intellectually serious.
Avoid startup language, exaggerated claims, or overly promotional calls to
action. Prefer direct labels such as “En savoir plus”, “Programme”, and
“À propos”.

## Avoid

- introducing a second page background without a clear functional reason;
- saturated motif colors across large decorative areas;
- viewport-height sections that create excessive blank space;
- separators that do not align with the header width;
- arbitrary local colors, font sizes, gaps, radii, or shadows;
- excessive rounded cards, pills, gradients, and drop shadows;
- centering every region and losing the established asymmetry;
- reproducing another institution's layout or visual identity.

## Validation

After visual changes:

1. Run `npm run build`.
2. Run `git diff --check`.
3. Review the affected flow at narrow and wide viewport widths when browser
   access is available.
4. Confirm that the actual logo remains unchanged and decorative geometry uses
   motif tokens.
5. Confirm that section widths and separators align with the header.
