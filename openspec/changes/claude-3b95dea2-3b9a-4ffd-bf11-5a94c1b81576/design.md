# ARIA Chunk 1 -- Design: Foundation (Keyframes + Fonts + Tokens)

## Overview

This document captures the architectural decisions for ARIA Chunk 1/4. This is a purely additive, non-breaking change across three existing files. It establishes the typographic, animation, and color token infrastructure that chunks 2-4 will consume. The only user-visible change is the body font switching from Arial to Space_Grotesk.

---

## Decision 1: Font Loading Strategy

### 1.1 Choose `next/font/google` with CSS Variables

**Decision**: Use Next.js's built-in `next/font/google` with `variable` option rather than `@import`, `<link>`, or `@font-face` in global CSS.

**Rationale**:

- **Self-hosting at build time**: `next/font/google` downloads font files at build time and serves them from the same origin. No runtime Google Fonts requests. This eliminates the FOUT/FOIT tradeoff that `@import` or `<link>` suffer from due to cross-origin latency.
- **CSS variable integration**: The `variable: '--font-sans'` option generates a CSS custom property scoped to the font class. This means any element under `<html>` can reference `var(--font-sans)` without hardcoding the font family string anywhere. The generated variable value is the full font-family stack including the system fallback.
- **Optimized subsetting**: `subsets: ['latin']` loads only Latin glyphs, keeping the font payload minimal. ARIA targets Latin-first content; Cyrillic, Greek, and other scripts are unnecessary weight.
- **Zero runtime cost**: No extra JavaScript. The font is a static CSS asset at build output.

**Alternatives considered and rejected**:

| Approach              | Rejected Because                                                                                                    |
| --------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Google Fonts `<link>` | Extra round trip, render-blocking, FOIT risk, no self-hosting                                                       |
| `@import` in CSS      | Same as `<link>`                                                                                                    |
| Manual `@font-face`   | Requires downloading, subsetting, and serving font files manually -- unnecessary when Next.js does it automatically |
| Adobe Fonts / Typekit | Adds a third-party dependency, script-based loading, slower                                                         |

### 1.2 Use `display: 'swap'`

**Decision**: Both fonts use `display: 'swap'`.

**Rationale**:

- `swap` gives the browser an extremely short block period (typically ~100ms) and an infinite swap period. If the font hasn't loaded within the block period, text renders immediately in the fallback font. When the web font arrives, it swaps in.
- This is the correct choice for body and UI text: content is always readable. The alternative `optional` could permanently hide the web font if the network is slow; `block` hides text for up to 3 seconds; `fallback` gives a short swap window before giving up permanently.
- For a developer platform, content legibility trumps font fidelity. Users should never see invisible text.

### 1.3 Font Variables on `<html>`, Not `<body>`

**Decision**: Apply font CSS variable class names (`.__variable_*`) to the `<html>` element via `className`, not to `<body>`.

**Rationale**:

- Next.js's `next/font/google` with `variable` generates a CSS class that defines a CSS custom property (`--font-sans`, `--font-mono`) on that element. Every descendant inherits the property.
- Placing the class on `<html>` ensures the variable is available to **every** element in the DOM tree -- including elements that might be rendered outside `<body>` by third-party scripts, portals, or future `<head>` additions.
- It follows Next.js's documented convention. Example from Next.js docs:

```tsx
import { Space_Grotesk } from 'next/font/google';
const font = Space_Grotesk({ variable: '--font-sans', subsets: ['latin'] });
// Used as: <html className={font.variable}>
```

- The `body` element references the variable via `font-family: var(--font-sans)` in CSS, which resolves correctly because `<body>` is a descendant of `<html>`.

### 1.4 Font Family Extension, Not Replacement

**Decision**: `tailwind.config.ts` extends `fontFamily` with `sans` and `mono` using CSS variable references (`var(--font-sans)`, `var(--font-mono)`), rather than hardcoding font names.

**Rationale**:

- Using CSS variables means the font stack is defined once (in the `next/font/google` configuration) and referenced everywhere. No duplication.
- Tailwind's `font-sans` utility class resolves to `var(--font-sans)`, which in turn resolves to the full font stack including system fallback.
- Adding `mono` to the config enables `font-mono` as a Tailwind utility. Combined with the CSS rule in globals.css (which targets `code, pre, kbd, samp` elements plus `.font-mono`), every code-like element automatically uses JetBrains_Mono.

---

## Decision 2: Token Coexistence Strategy

### 2.1 Namespace Isolation via `--aria-` Prefix

**Decision**: All new CSS custom properties use the `--aria-` namespace prefix. They coexist in the same `:root` block as existing tokens without modification, removal, or reordering of existing tokens.

**Rationale**:

- **Additive, not destructive**: The existing `--background`, `--foreground`, `--primary`, `--muted`, etc. tokens serve non-ARIA components (Navbar, pages). Chunk 1 does not touch those components. Removing or renaming existing tokens would break them.
- **Clear ownership**: The `--aria-` prefix makes it immediately obvious which tokens belong to the ARIA design system and which are legacy. This matters for chunks 2-4 when ARIA components start consuming these tokens -- no ambiguity about which token a component references.
- **Easy removal**: If the ARIA migration is ever rolled back, every ARIA token can be found and removed with a single search for `--aria-`.
- **No shadowing**: The prefix prevents accidental collision with existing token names. `--aria-success` and `--success` are distinct, namespaced tokens.

### 2.2 Same `:root` Block, Not a Separate Block

**Decision**: ARIA tokens are added to the single existing `:root` block, not a separate `:root` block or a different scope.

**Rationale**:

- CSS custom properties cascade from `:root` to everything. Multiple `:root` blocks work but are confusing to maintain -- readers have to scan two blocks to see all available tokens.
- A single `:root` block is the conventional pattern in Tailwind projects. DevTools shows all tokens in one place.
- `html` or `body` scope would be unconventional and harder to discover.

### 2.3 RGB Tuple Variants Without Tailwind Aliases

**Decision**: `--aria-accent-rgb` and `--aria-success-rgb` are defined only in `:root`. They do not get Tailwind `colors` aliases.

**Rationale**:

- These are not used as standalone colors. They exist exclusively for `rgba(var(--aria-accent-rgb), <alpha>)` patterns in component-level CSS.
- Adding Tailwind aliases for RGB tuples would create confusing utility classes (e.g., `bg-aria-accent-rgb`) that produce invalid colors.
- Tailwind's color system expects hex values or CSS variable references that resolve to hex. RGB tuples break this assumption and shouldn't be exposed as utilities.

---

## Decision 3: Keyframe Naming Convention

### 3.1 Namespaced Kebab-Case: `aria-{descriptor}`

**Decision**: All `@keyframes` names follow the pattern `aria-{descriptor}` in kebab-case. Utility classes follow `.animate-aria-{name}`.

**Rationale**:

- **Namespace safety**: The `aria-` prefix prevents collision with any existing or future keyframes. A generic name like `pulse` or `fade-in` could conflict with Tailwind's built-in animations, third-party libraries, or other parts of the codebase.
- **Kebab-case**: CSS convention. UpperCamelCase and snake_case are anomalous in CSS and would break mental model for developers reading the codebase.
- **Utility class pattern**: `.animate-aria-{name}` mirrors Tailwind's `.animate-{name}` convention, making it feel native to Tailwind. The `aria-` infix preserves namespacing.

### 3.2 Plain CSS in `globals.css`, Not Tailwind `@layer`

**Decision**: Keyframes and utility classes are written as plain CSS in `globals.css`, not wrapped in `@layer components` or `@layer utilities`.

**Rationale**:

- `@keyframes` definitions cannot be placed inside `@layer` -- they must be at the top level of a stylesheet.
- Utility classes that consume these keyframes are straightforward CSS rules. Wrapping them in `@layer utilities` would add Tailwind's layer ordering but provides no benefit for animations consumed via class names.
- Plain CSS is simpler to read, edit, and grep. It avoids the mental overhead of Tailwind's `@layer` semantics for what is fundamentally just CSS animations.

### 3.3 Animation Shorthand Only

**Decision**: All utility classes use the `animation` shorthand property, not individual `animation-name`, `animation-duration`, etc.

**Rationale**:

- Single-property format is more compact and conventional.
- Reduces risk of accidentally overriding one property while leaving another (e.g., changing `animation-name` but not `animation-duration`).
- Clearer intent: one rule, one animation behavior.

### 3.4 `.animate-aria-fade-in` Uses `animation-fill-mode: both`

**Decision**: The fade-in utility class explicitly uses `both` fill mode.

**Rationale**:

- `both` combines `forwards` and `backwards`.
- `forwards` ensures the element stays at `opacity: 1` after the animation completes (otherwise it would snap back to `opacity: 0`).
- `backwards` ensures the element starts at `opacity: 0` before the animation begins (prevents a visible flash of fully opaque content if there's an animation delay).

---

## Decision 4: CSS Organization

### 4.1 Appended at Bottom with Clear Banner

**Decision**: All ARIA additions are appended at the bottom of `globals.css` under a `/* ARIA foundation -- chunk 1 */` banner comment, with sub-sections for each capability.

**Rationale**:

- **Findability**: A single banner comment makes all ARIA additions findable with one search.
- **Merge safety**: Appending (not inserting in the middle) minimizes merge conflicts if other developers are modifying the same file.
- **Removability**: If ARIA needs to be rolled back, everything below the banner comment can be removed in one operation.
- **Chunk clarity**: The chunk number in the banner maps directly to the migration plan, making it obvious which set of additions belong to which phase.

### 4.2 Proposed File Structure

```
globals.css
├── @tailwind directives (lines 1-3) [unchanged]
├── :root block (lines 5-17) [ARIA tokens appended]
├── body rule (lines 20-27) [font-family changed]
├── @layer utilities { .text-balance } (lines 29-33) [unchanged]
│
├── /* ARIA foundation -- chunk 1 */     <-- banner
├──   /* Typography */                   <-- ::selection + mono elements
├──   /* Keyframes */                    <-- 11 @keyframes
├──   /* Utility classes */              <-- 11 .animate-aria-* classes
```

---

## Decision 5: Tailwind Extension Pattern

### 5.1 Colors Use `var(--aria-*)` References

**Decision**: New Tailwind color aliases (`aria-bg`, `aria-accent`, `aria-accent-soft`, `aria-success`, `aria-danger`, `aria-warning`) are mapped to `var(--aria-*)` CSS variable references, matching the existing pattern.

**Rationale**:

- Every existing Tailwind color alias in this project already follows this pattern (e.g., `background: 'var(--background)'`, `primary: 'var(--primary)'`).
- Consistency with the existing codebase is more important than any alternative pattern.
- Using CSS variables via `var()` means colors can be changed in `:root` without touching the Tailwind config.

### 5.2 `fontFamily` Extended, Not Replaced

**Decision**: `theme.extend.fontFamily` gains `sans` and `mono` entries. No existing font family entries are removed or modified (there are none to begin with -- fontFamily was not previously configured).

**Rationale**:

- `theme.extend` is the standard Tailwind pattern for adding properties without overriding the default theme.
- Even though the existing config has no `fontFamily` to protect, using `extend` future-proofs against Tailwind upgrades that might ship with default font families.

---

## Decision 6: Non-Breaking Nature

### 6.1 Strictly Additive

**Decision**: No existing tokens, classes, styles, or configuration entries are removed or modified (except the single `font-family` line in the `body` rule).

**Rationale**:

- Existing components (Navbar, pages, forms) rely on the current token set (`--primary`, `--background`, etc.). Breaking those tokens would cascade visual breakage across the entire app.
- Chunks 2-4 will introduce new ARIA components that consume ARIA tokens. The existing components remain functional until their eventual migration or retirement.
- Additive changes are trivially reversible. If this chunk is the wrong approach, reverting it is a clean removal of everything under the ARIA banner.

### 6.2 The One Visible Change: Body Font

**Decision**: The only user-visible change in Chunk 1 is `body { font-family: Arial, Helvetica, sans-serif }` becoming `body { font-family: var(--font-sans) }`, which resolves to Space_Grotesk.

**Rationale**:

- This is a deliberate baseline change. Space_Grotesk is the ARIA typeface. Applying it immediately (rather than only to ARIA components) ensures the entire app uses a single cohesive typeface. Partial font mixing (Arial in one place, Space_Grotesk in another) would look inconsistent and unprofessional.
- The font swap from Arial to Space_Grotesk is cosmetic. Both are sans-serif. Line height, weight, and sizing remain identical. No layout shift is expected.

---

## Error Handling and Edge Cases

| Edge Case                                | Resolution                                                                                                                                                                           |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Font fails to load (slow network)        | `display: 'swap'` ensures text renders in system sans-serif immediately, swaps when font arrives                                                                                     |
| Font variable undefined                  | `var(--font-sans)` is set by the font class on `<html>`. If the class fails to apply, the variable is undefined and the browser falls back to `sans-serif` via the font-family stack |
| Keyframe name collision                  | Namespace prefix `aria-` prevents collision with existing or future CSS                                                                                                              |
| Tailwind purge removes animation classes | Classes are defined in `globals.css` (not inline), so Tailwind's JIT purge does not touch them. They are always available                                                            |
| `:root` token ordering changes           | ARIA tokens are appended at the end of the existing `:root` block. No existing token is moved, so cascade order for existing tokens is preserved                                     |
| Build fails with unknown `@keyframes`    | All keyframes use standard CSS syntax. No PostCSS plugin or processor is involved                                                                                                    |
| Typed linting fails on font imports      | Both fonts are typed. `next/font/google` has TypeScript support. `pnpm typecheck` validates the imports                                                                              |
