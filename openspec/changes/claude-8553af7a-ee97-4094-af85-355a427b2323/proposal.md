# SDD Proposal -- Auth Page Redesign (Dark Cyan)

## Goal

Redesign the login and register experience on the frontend, unifying both forms into a single `/auth` page with a dark cyan design system. The current implementation has login at `/` (root) co-located with the admin dashboard, and register at `/register` with a separate light theme. Both pages use heavy inline styles and ad-hoc color values.

## Current State

| Area                   | Status                                                                                                                                                                                                                                        |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Login form**         | Co-located in `apps/frontend/src/app/page.tsx` (lines 491-617) alongside the admin dashboard (lines 167-488). Uses inline styles: `#7f77dd` accent, `#f5f5f0` background, `#111827` text, `#e5e7eb` borders.                                  |
| **Register form**      | Standalone at `apps/frontend/src/app/register/page.tsx`. Has password strength bar (4-segment), show/hide toggle, icon prefixes, terms checkbox, date of birth. Same inline style values as login.                                            |
| **globals.css**        | Has TWO conflicting themes: a dark theme (`--primary: #22d3ee` cyan) and a light "registration page" theme (`--accent: #7f77dd` purple). The body uses dark gradient background, but the auth pages override with light bg via inline styles. |
| **tailwind.config.ts** | Maps CSS variables to Tailwind colors, but the auth pages never use them -- everything is `style={{}}`.                                                                                                                                       |
| **Components**         | No shared components exist. `apps/frontend/src/components/` is empty. Inputs, buttons, cards, error banners are duplicated across both pages with onFocus/onBlur handlers for styling.                                                        |
| **Routing**            | Login is at `/`, register at `/register`, admin dashboard is at `/` (behind auth check). No `/auth` route exists.                                                                                                                             |

**Code quality issues:**

1. ~10 input elements with duplicate onFocus/onBlur handlers for border color + box-shadow
2. 3 card containers with identical inline style objects
3. 2 sets of error message blocks (red bg/border/text) with inline styles
4. 2 primary buttons with `backgroundColor: '#7f77dd'`
5. No CSS variable usage in pages -- `--accent`, `--bg-secondary`, `--bg-card` exist but are unused
6. `page.tsx` is ~620 lines combining login page + CRUD dashboard + modals in one component

## Proposed Solution

### 1. Add `DESIGN.md` to repo root

A design tokens document defining the dark cyan system:

- **Palette**: Deep navy background (`#0b1120`), cyan primary (`#22d3ee`), warm gray surfaces (`#1e293b`), slate text, emerald success, amber warning, red danger
- **Typography**: Inter font stack, 3 sizes for auth (title 24px, body 14px, caption 12px)
- **Spacing**: 4px grid, consistent padding (24px card padding, 16px between fields)
- **Components**: Card (panel 420px, rounded-xl, subtle border), Segmented control tabs, Input (outline, focus ring cyan, icon slot), Button primary (cyan glow, 12px px/14px py), strength bar (4 segments, colored)
- **Tokens**: All named CSS variables in `:root`, no magic values

### 2. Clean up `globals.css`

- Remove the light-theme variables (`--bg-secondary`, `--bg-card`, `--accent`, `--accent-hover`, `--text-secondary`, `--border-subtle`)
- Add missing design tokens from DESIGN.md: `--brand`, `--surface-elevated`, `--ring`, `--glow`, `--success`, `--warning`, `--warning-foreground`, `--danger-foreground`, `--radius-sm`, `--radius-md`, `--radius-lg`, `--font-sans`, `--font-mono`
- Keep existing dark theme variables and body gradient, add `@import url()` for Inter font

### 3. Refactor `page.tsx`

Extract the login form into a dedicated `LoginForm` component and create a unified auth page:

**New files under `apps/frontend/src/components/auth/`:**

| File                    | Responsibility                                                                                                               |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `auth-page.tsx`         | Orchestrator: manages active tab state, renders login or register form, handles successful auth (redirect or session update) |
| `login-form.tsx`        | Login form: email + password fields, submit handler, inline field errors, CTA                                                |
| `register-form.tsx`     | Register form: first/last name, email, password with strength meter, date of birth, terms checkbox, submit                   |
| `tabs.tsx`              | Segmented control: "Iniciar sesion" / "Crear cuenta" toggle, active indicator                                                |
| `password-strength.tsx` | Standalone strength meter component (extracted from register logic)                                                          |
| `brand-mark.tsx`        | Logo/brand icon for the auth card header                                                                                     |

**Renamed/moved:**

- `apps/frontend/src/app/page.tsx` becomes the admin dashboard only (no login form). The login state is handled by redirect to `/auth`.
- `apps/frontend/src/app/register/page.tsx` is deleted (functionality lives in `register-form.tsx` on the `/auth` page).
- `apps/frontend/src/app/auth/page.tsx` becomes the new auth page, importing from `components/auth/`.

**UI specs for the auth card:**

- Width: 420px card panel centered on screen
- Background: `--surface` (`#1e293b`) with `--surface-border` border
- Brand mark: cyan icon at top center (e.g. `IconBrandMatrix` or a custom mark)
- Segmented tabs: two-button toggle, active state moves indicator, `--primary` text color
- Inputs: full Tailwind classes (no inline styles), `bg-surface`, focus ring via `focus:ring-2 focus:ring-primary/30 focus:border-primary`
- CTA button: `bg-primary text-primary-foreground` with CSS `box-shadow: 0 0 20px rgba(34,211,238,0.3)` glow
- Inline field errors: red text below input, shown per-field
- Password strength: 4 segments, `--danger` / `--warning` / `--success` / `--primary` colors
- Globe/lock icons inside inputs via `peer` + absolute positioning
- Terms checkbox for register form
- Toggle link at bottom: "Ya tenes cuenta? Inicia sesion" / "No tenes cuenta? Crea una" (clicking toggles tab)

### 4. Auth page routing and session management

The `page.tsx` currently handles three states: session-checking, logged-in (dashboard), and logged-out (login form). The proposal retains the session-checking and dashboard states in `page.tsx` but replaces the login form with a redirect:

- `page.tsx`: if no session and not checking, `router.push('/auth')`
- `/auth/page.tsx`: the new auth page. On successful login/register, redirect to `/` (which then finds the token and renders dashboard)
- `/register/page.tsx`: deleted

### 5. Shared styles convention

- All component UI uses Tailwind utility classes referencing CSS variable tokens, OR inline `style={}` ONLY for truly dynamic values (e.g., strength bar segment color based on score).
- Remove ALL onFocus/onBlur inline handlers -- use Tailwind `focus:` variants instead.
- Use `cn()` or template literals for conditional classes.

## Key Decisions

| Decision                                                          | Rationale                                                                                                                                                                                            |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Single `/auth` page with tabs, not separate routes**            | Register form fields mostly overlap with login (email/password). A tab switcher gives unified branding, shared card container, and simpler state management. The backend already has both endpoints. |
| **Extract components under `components/auth/`**                   | Isolates auth UI from shared components. If auth is later moved to a route group or micro-frontend, the boundary is clean.                                                                           |
| **Design tokens as CSS variables, not Tailwind theme extensions** | DESIGN.md can be framework-agnostic. Tailwind config already reads from CSS vars (`var(--primary)`), so the tokens live in CSS and work regardless of utility framework.                             |
| **Remove inline focus handlers**                                  | They add noise, bloat bundle with closures, and are 100% replaceable with Tailwind `focus:` variants. One fewer source of hydration mismatch.                                                        |
| **Delete `/register` page**                                       | Its functionality moves to `/auth`. Keeping an orphan route creates confusion.                                                                                                                       |
| **`page.tsx` keeps dashboard, loses login form**                  | Dashboard is the authenticated app's entry point. Removing login from it makes state management simpler and avoids the co-location problem.                                                          |
| **`DESIGN.md` at repo root**                                      | Accessible from both frontend and backend teams. Shared reference for visual consistency.                                                                                                            |
| **Date of birth field kept but does NOT send to backend**         | Backend `RegisterDto` doesn't accept it. The field is client-side only. We add a comment and leave it optional.                                                                                      |

## Out of Scope

- Backend changes (auth controller, service, DTOs, guards)
- OAuth / social login
- Forgot password / password reset flow
- Two-factor authentication
- httpOnly cookie storage for tokens
- Changes outside `apps/frontend/src/components/auth/`, `apps/frontend/src/app/`, `DESIGN.md`, `globals.css`
- Admin dashboard UI improvements (the table, modals, navbar remain untouched)
- Unit or integration tests (manual verification only)
- Dark/light mode toggle

## Risks

| Risk                                                                    | Mitigation                                                                                                                                                               |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Password strength colors differ between old and new**                 | `DESIGN.md` defines the new palette explicitly. The strength component accepts color array as a prop.                                                                    |
| **Date of birth field in register form is sent but ignored by backend** | We keep the field client-only and add a TODO comment. The existing register page already has this same behavior, so no regression.                                       |
| **Token flow change**: login/register now redirects to `/auth` then `/` | The "checking session" state handles this gracefully -- `readToken()` fires on mount and finds the persisted token. Existing flow works identically.                     |
| **Removing inline styles might break existing visual**                  | Every element maps to a DESIGN.md token. We verify visually after implementation. The admin dashboard is untouched, so only auth pages are affected.                     |
| **Components directory was empty -- no existing patterns to follow**    | These are the first components. We establish the convention (one component per file, default export, TypeScript props interface, Tailwind classes only, no CSS modules). |
| **No loading skeleton for auth page**                                   | The auth page has no async content on initial render (unlike dashboard which loads users). Adding a skeleton would be premature.                                         |
