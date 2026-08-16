# Frontend Agent Instructions

These instructions apply to all work inside the `frontend` repository and
supplement the workspace-level `AGENTS.md`.

## Styling architecture

- Before making visual, layout, or styling changes, read
  `docs/STYLE_GUIDE.md` and preserve its established design direction.
- Treat the frontend styling system as a small centralized design system.
- Keep shared design tokens in `src/styles/tokens.css`.
- Define colors, typography, spacing, radii, shadows, transitions, and
  breakpoints as tokens. Reuse those tokens throughout the application.
- Do not introduce arbitrary colors, spacing, typography, radii, shadows, or
  breakpoints inside page components or page-specific styles.
- A change to a shared visual rule should be made centrally and propagate
  consistently to every consumer.

Use this general structure:

```text
src/
├── components/
│   └── ui/
├── styles/
│   ├── tokens.css
│   ├── reset.css
│   ├── global.css
│   └── utilities.css
└── pages/
```

## Reusable UI components

- Implement repeated interface patterns as reusable React components under
  `src/components/ui/`.
- Shared controls include buttons, text fields, checkboxes, alerts, cards,
  badges, loading indicators, and page headers.
- Expose intentional component variants such as `primary`, `secondary`,
  `danger`, and `compact` instead of duplicating or overriding styles at call
  sites.
- Pages should compose shared UI components rather than reproduce their markup
  and class combinations.
- Page-specific styling should control page composition and layout, not redefine
  shared controls.

## Brand assets and placement

- Use `src/assets/brand/compactbrandmark.png` as the default logo asset. It
  preserves the colored and gray artwork, places its black lettering below the
  red artwork, and has a tightly trimmed transparent background.
- Place the primary logo at the upper-left of headers, forms, and branded
  layouts.
- Render `BrandMark` before the containing region's content so its visual
  upper-left placement follows the markup order.
- Do not place the primary logo on the right or bottom unless a documented
  design requirement explicitly overrides this rule.
- Keep the black-background, white-background, and other transparent logo files
  available as approved alternative variants; do not overwrite or
  destructively edit them.
- Keep logo sizing, alternative text, and default alignment centralized in the
  shared `BrandMark` component.
- When using transparent logo variants, do not add transparent canvas margin or
  padding. Every fully transparent outer row and column must be removed.
- Do not reproduce the wordmark as adjacent text when it is already present in
  the logo asset.

## User-facing text and localization

- Do not hardcode user-facing text in React components or JSX.
- User-facing text includes headings, labels, buttons, links, hints,
  placeholders, validation messages, errors, empty states, loading states,
  accessibility labels, and alternative text.
- Internal identifiers, API paths, CSS class names, test selectors, and
  developer-only logs are not user-facing text.
- Put every user-facing component in its own folder with its React file and a
  colocated text-map file:

```text
ComponentName/
├── ComponentName.tsx
└── ComponentName.text.ts
```

- Name text maps after their component and use stable semantic keys rather than
  using displayed text as keys.
- Every text map must have `fr`, `de`, `it`, and `en` language roots.
- French (`fr`) is the default and fallback language.
- Every language root must implement exactly the same key structure. Adding or
  removing a key requires updating all four languages in the same change.
- Preserve the text-map shape with TypeScript so missing or inconsistent keys
  fail during the build.

Use this general form:

```ts
export const componentText = {
  fr: {
    title: "Bienvenue",
    submit: "Se connecter",
  },
  de: {
    title: "Willkommen",
    submit: "Anmelden",
  },
  it: {
    title: "Benvenuto",
    submit: "Accedi",
  },
  en: {
    title: "Welcome",
    submit: "Sign in",
  },
} as const;

export const defaultLanguage = "fr";
```

- Components should read copy through a small local lookup boundary so the
  selected language can later come from a shared language context without
  rewriting the text maps.
- Until a language context exists, render the French text map.
- Generic UI primitives should receive contextual user-facing copy through
  typed props. The page or feature component that owns the meaning must source
  that copy from its own text map.
- Do not place all application copy in one global file. Keep copy colocated with
  the component that owns it while maintaining the same language-map contract.

## CSS organization

- Use CSS Modules for component-specific and page-specific styles.
- Keep resets, design tokens, application-wide defaults, and deliberately
  shared utilities global.
- Avoid inline styles except when a value is genuinely dynamic and cannot be
  represented by a component variant or CSS custom property.
- Avoid `!important` and excessive selector specificity. Fix the ownership or
  structure of the style instead.
- Remove obsolete styles when replacing components or layouts.

## Accessibility and responsive behavior

- Preserve semantic HTML, keyboard navigation, labels, and visible focus
  states.
- Do not communicate meaning through color alone.
- Ensure interactive controls have clear hover, focus, disabled, loading, and
  error states.
- Build layouts mobile-first and verify them at narrow and wide viewport sizes.
- Respect reduced-motion preferences for nonessential animation.

## TypeScript and React

- Keep TypeScript strict and avoid `any`.
- Give shared component props explicit types.
- Keep API access and authentication logic outside presentational UI
  components.
- Prefer small composable components with clear ownership over large page
  components.

## Validation

After frontend changes, run:

```bash
npm run build
```

When styling or interaction changes materially, also verify the affected flows
in the browser at mobile and desktop widths.
