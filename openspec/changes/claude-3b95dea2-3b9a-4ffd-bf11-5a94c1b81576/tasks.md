# ARIA Chunk 1 -- Tasks: Foundation (Keyframes + Fonts + Tokens)

## Overview

4 sequential tasks across 3 existing files. Purely additive -- no removals, no new files.
Estimated: ~100 lines added, 1 line modified. Single PR, no chaining required.

---

## Task 1: Update layout.tsx (Fonts + Locale + Metadata)

**Files**: `apps/frontend/src/app/layout.tsx`

**Dependencies**: None

**What to do**:

1. Import `Space_Grotesk` and `JetBrains_Mono` from `next/font/google`
2. Configure `Space_Grotesk` with `{ subsets: ['latin'], display: 'swap', variable: '--font-sans' }`
3. Configure `JetBrains_Mono` with `{ subsets: ['latin'], display: 'swap', variable: '--font-mono' }`
4. Add font `.variable` classNames to `<html className={...}>`
5. Change `lang="en"` to `lang="es"`
6. Update metadata: `title: 'ARIA'`, `description: 'Plataforma de desarrollo con agentes de IA'`
7. Do NOT modify body className or children

**Verification**:

- `pnpm --filter frontend typecheck` exits 0 (validates font imports are typed)
- `rg "Space_Grotesk|JetBrains_Mono" apps/frontend/src/app/layout.tsx` returns imports
- `rg "lang=\"es\"" apps/frontend/src/app/layout.tsx` returns the html element
- `rg "fontSans.variable|fontMono.variable" apps/frontend/src/app/layout.tsx` returns className usage

---

## Task 2: Append ARIA tokens and typography rules to globals.css

**Files**: `apps/frontend/src/app/globals.css`

**Dependencies**: Task 1 (font CSS variables must exist before body references them)

**What to do**:

1. Append 8 `--aria-*` CSS custom properties to the existing `:root` block (DO NOT modify/reorder existing tokens)
2. Change `body { font-family: Arial, Helvetica, sans-serif; }` to `body { font-family: var(--font-sans); }`
3. Add `::selection` rule: `background: var(--aria-accent); color: var(--aria-bg);`
4. Add `.font-mono, code, pre, kbd, samp { font-family: var(--font-mono); }`

**Verification**:

- `pnpm --filter frontend build` exits 0 with no CSS errors
- `rg "var\(--aria-bg\)" apps/frontend/src/app/globals.css` returns 1 match in :root
- `rg "var\(--aria-accent-rgb\)" apps/frontend/src/app/globals.css` returns 1 match in :root
- `rg "::selection" apps/frontend/src/app/globals.css` returns 1 match
- `rg "var\(--font-mono\)" apps/frontend/src/app/globals.css` returns 2 matches (body + mono rule)
- Count of `--aria-` tokens in :root = 8

---

## Task 3: Append 11 @keyframes and utility classes to globals.css

**Files**: `apps/frontend/src/app/globals.css`

**Dependencies**: Task 2 (same file, sequential to avoid merge conflicts)

**What to do**:

1. Append all 11 `@keyframes` under an ARIA banner comment
2. Append all 11 `.animate-aria-*` utility classes
3. Keyframes: `aria-sweep`, `aria-spin-slow`, `aria-spin-rev`, `aria-spin-fast`, `aria-pulse`, `aria-pulse-dot`, `aria-shine`, `aria-fade-in`, `aria-marquee`, `aria-blink`, `aria-wave`
4. `.animate-aria-fade-in` must use `animation-fill-mode: both`

**Verification**:

- `pnpm --filter frontend build` exits 0 with no CSS warnings
- `rg "@keyframes" apps/frontend/src/app/globals.css | wc -l` returns 11
- `rg "\.animate-aria-" apps/frontend/src/app/globals.css | wc -l` returns 11
- `rg "aria-sweep" apps/frontend/src/app/globals.css` returns 2 matches (keyframe + class)
- `rg "both" apps/frontend/src/app/globals.css` returns 1 match (fade-in fill mode)

---

## Task 4: Extend tailwind.config.ts

**Files**: `apps/frontend/tailwind.config.ts`

**Dependencies**: Task 2 (color token CSS variables must be defined in :root)

**What to do**:

1. Add `aria-bg`, `aria-accent`, `aria-accent-soft`, `aria-success`, `aria-danger`, `aria-warning` to `theme.extend.colors`, each mapped to `var(--aria-*)`
2. Add `sans: ['var(--font-sans)']` and `mono: ['var(--font-mono)']` to `theme.extend.fontFamily`
3. Do NOT modify or remove existing color aliases
4. Do NOT add `aria-accent-rgb` or `aria-success-rgb` (these are CSS-only, not Tailwind colors)

**Verification**:

- `pnpm --filter frontend typecheck` exits 0
- `pnpm --filter frontend build` exits 0
- `rg "aria-bg" apps/frontend/tailwind.config.ts` returns 1 match in colors
- `rg "fontFamily" apps/frontend/tailwind.config.ts` returns 1 match
- `rg "var\(--font-sans\)" apps/frontend/tailwind.config.ts` returns 1 match

---

## Final Verification (after all tasks)

Run all checks:

- `pnpm --filter frontend typecheck` exits 0
- `pnpm --filter frontend build` exits 0
- `pnpm --filter frontend dev` starts without errors (smoke test only, kill after start)

---

## Review Workload Forecast

| Metric                       | Value                   |
| ---------------------------- | ----------------------- |
| Estimated lines added        | ~100                    |
| Estimated lines modified     | 1 (body font-family)    |
| Estimated lines removed      | 0                       |
| Files touched                | 3                       |
| New files                    | 0                       |
| 400-line budget risk         | Low (well under budget) |
| Chained PRs recommended      | No                      |
| Decision needed before apply | None                    |

**Single PR. No splitting required.**
