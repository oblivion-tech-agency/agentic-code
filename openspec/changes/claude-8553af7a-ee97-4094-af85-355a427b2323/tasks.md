# Tasks: Auth Redesign

## Review Workload Forecast

- Estimated changed lines: 400-500
- Files touched: 10
- Chained PRs recommended: No
- 400-line budget risk: Medium
- Decision needed before apply: No

---

## Phase: Design System Foundations

### Task 1: Add missing design tokens to globals.css and tailwind.config.ts

**Files:**

- `apps/frontend/src/app/globals.css` — MODIFY
- `apps/frontend/tailwind.config.ts` — MODIFY

**What:**
Remove the 6 orphan light-theme CSS variables (`--bg-secondary`, `--bg-card`, `--accent`, `--accent-hover`, `--text-secondary`, `--border-subtle`) and their comment. Add `--surface-elevated`, `--success`, `--warning` tokens. Remove the corresponding old color mappings from `tailwind.config.ts` and add the new ones (`surface-elevated`, `success`, `warning`).

**DoD:**

1. `globals.css`:root contains only the 12 tokens from the design spec.
2. `tailwind.config.ts` colors block references no `bg-secondary`, `bg-card`, `accent`, `accent-hover`, `text-secondary`, or `border-subtle`.
3. No `var(--bg-secondary)`, `var(--bg-card)`, etc. remain in any file under `apps/frontend/src/`.
4. `pnpm --filter frontend build` passes.

**Depends on:** none

---

### Task 2: Create DESIGN.md at repo root

**Files:**

- `DESIGN.md` — CREATE

**What:**
Create a framework-agnostic design reference document with the full dark cyan palette (all 13 tokens), typography scale, spacing rules, component specs (card, input, button, tabs, brand mark, password strength), and CSS do's/don'ts. Content matches Sections 1.1-1.5 of the design doc.

**DoD:**

1. File exists at repo root with complete palette table.
2. All token hex values match `globals.css` `:root`.
3. Typography table covers all 7 element types from the design spec.

**Depends on:** Task 1 (tokens should be finalized first)

---

## Phase: Auth Components

### Task 3: Create BrandMark component

**Files:**

- `apps/frontend/src/components/auth/brand-mark.tsx` — CREATE

**What:**
A small presentational component: centered column with an inline SVG icon (20x20, "ac" stylized mark) and "agentic-code . console" text in muted color. No props, no state.

**DoD:**

1. Component renders the inline SVG + text in a centered column.
2. No icon library imports -- pure inline SVG.
3. Uses only Tailwind utility classes (`text-muted`, `tracking-wide`, etc.) -- no inline `style`.

**Depends on:** none

---

### Task 4: Create Tabs component (segmented control)

**Files:**

- `apps/frontend/src/components/auth/tabs.tsx` — CREATE

**What:**
A controlled segmented control component with two tabs: "Iniciar sesion" and "Crear cuenta". Props: `activeTab: 'login' | 'register'` and `onTabChange: (tab: 'login' | 'register') => void`. Active tab uses `bg-surface-elevated` and `text-primary` classes. Inactive tab uses `text-muted`. Container uses `grid grid-cols-2 p-1 rounded-lg bg-surface-border/10`.

**DoD:**

1. Correctly renders two buttons with conditional active/inactive classes.
2. Clicking fires `onTabChange` with the correct tab value.
3. No internal state -- fully controlled by parent.
4. No inline `style` -- pure Tailwind utility classes.

**Depends on:** none

---

### Task 5: Create PasswordStrength component

**Files:**

- `apps/frontend/src/components/auth/password-strength.tsx` — CREATE

**What:**
A pure presentational component that accepts a `password: string` prop and renders a 4-segment strength meter. Score computation: +1 for >= 8 chars, +1 for uppercase, +1 for digit, +1 for special char. Score 1 = red (danger), 2 = amber (warning), 3-4 = emerald (success). Labels: "Debil", "Media", "Fuerte", "Muy fuerte". Returns null when password is empty.

**DoD:**

1. Meter renders 4 segments with correct dynamic colors.
2. Label appears below with matching color and text.
3. Returns null when password is empty.
4. Inline `style` used ONLY for segment background colors (dynamic) -- all other styling via Tailwind.
5. Segments use `transition-colors duration-200` for animated fill.

**Depends on:** Task 1 (requires `--success`, `--warning`, `--danger` tokens, though could use hex fallbacks)

---

### Task 6: Create LoginForm component

**Files:**

- `apps/frontend/src/components/auth/login-form.tsx` — CREATE

**What:**
Self-contained login form with email and password fields (show/hide toggle), inline error handling, CTA button with loading spinner, and bottom link to switch to register. Manages its own state via `useState`. Calls `login()` from `@/lib/auth` on submit. On success calls `persistToken()` + `onAuthSuccess()`. On 401 shows inline error "Credenciales invalidas" on password field. On network error shows global banner "Error de conexion. Intentalo de nuevo."

**IMPORTANT implementation notes:**

- The `apiFetch` function does NOT expose HTTP status codes -- it throws an `Error` with the server's message string. The form should detect 401 vs network by checking the error message content (e.g., `err.message.includes('Unauthorized')` or `err.message.includes('Invalid')`) since there's no `status` field on the thrown Error. Alternatively, the task may modify `apiFetch` to include status -- this is a design decision to be made during apply.
- All inputs use Tailwind `focus:` variants -- NO `onFocus`/`onBlur` handlers.
- Password toggle uses absolute-positioned eye icon button inside a `relative` wrapper.
- Show/hide icons are inline SVGs (no Tabler Icons import for the auth components).
- Error states are mutually exclusive: inline error XOR global banner.

**DoD:**

1. Email and password fields render with correct labels, placeholders, autocomplete attributes.
2. Password show/hide toggle works.
3. Loading state disables all inputs and shows spinner in button.
4. 401 error shows inline error on password field (red border + "Credenciales invalidas" text).
5. Network error shows global banner above fields.
6. "Sin cuenta? Crear una" link calls `onSwitchToRegister`.
7. No inline `style` -- pure Tailwind utility classes.
8. No `onFocus`/`onBlur` handlers.

**Depends on:** Task 1 (for CSS tokens in Tailwind classes)

---

### Task 7: Create RegisterForm component

**Files:**

- `apps/frontend/src/components/auth/register-form.tsx` — CREATE

**What:**
Self-contained register form with firstName, lastName, email, password fields (show/hide toggle), PasswordStrength component, terms checkbox, CTA button with loading spinner, and bottom link to switch to login. Manages its own state via `useState`. Calls `register()` from `@/lib/auth` on submit. On success calls `persistToken()` + `onAuthSuccess()`. On 409 shows inline error on email field "Ese email ya esta en uso". On network error shows global banner. CTA is disabled until all required fields are filled AND terms checkbox is checked. No dateOfBirth field (backend doesn't accept it -- per spec).

**IMPORTANT implementation notes (same as LoginForm):**

- Error detection via message content (409 includes "already in use" or similar), not HTTP status code.
- Uses `PasswordStrength` component from `@/components/auth/password-strength`.
- Show/hide toggle uses inline SVGs (no Tabler Icons).
- Terms checkbox links use `<a>` tags (simple links, not Next.js `<Link>` since they go to static routes).
- NO `onFocus`/`onBlur` handlers. NO inline `style` (except PasswordStrength which handles its own).

**DoD:**

1. All 4 fields render with correct labels, placeholders, autocomplete attributes.
2. Password strength meter renders below password via the `PasswordStrength` component.
3. Terms checkbox renders with links to /terms and /privacy.
4. CTA is disabled when any required field is empty or terms unchecked.
5. Loading state disables all inputs and checkbox.
6. 409 error shows inline error on email field.
7. Network error shows global banner above fields.
8. "Ya tenes cuenta? Iniciar sesion" link calls `onSwitchToLogin`.
9. No dateOfBirth field present.
10. No inline `style` (delegated to PasswordStrength for dynamic colors).

**Depends on:** Task 1 (CSS tokens), Task 5 (PasswordStrength)

---

## Phase: Routing & Orchestration

### Task 8: Create auth page orchestrator

**Files:**

- `apps/frontend/src/app/auth/page.tsx` — CREATE

**What:**
New route page at `/auth`. Full-viewport centered layout with auth card. Manages `activeTab` state (`'login' | 'register'`). Renders BrandMark, Tabs, and the active form (LoginForm or RegisterForm). On mount, checks for existing token via `readToken()` -- if found, redirects to `/`. Passes `onAuthSuccess` (redirects to `/`) and `onSwitchToRegister`/`onSwitchToLogin` (toggles tab) callbacks.

**DoD:**

1. Page renders centered card with brand mark, tabs, and form.
2. Tab switching works without URL hash or query param changes.
3. Existing token on mount triggers immediate redirect to `/`.
4. No API calls on mount -- only `readToken()` check.
5. All imports use `@/` path alias.

**Depends on:** Task 3 (BrandMark), Task 4 (Tabs), Task 6 (LoginForm), Task 7 (RegisterForm)

---

### Task 9: Refactor page.tsx -- remove login form, add redirect

**Files:**

- `apps/frontend/src/app/page.tsx` — MODIFY

**What:**
Remove the unauthenticated render block (currently lines 491-617 of the file) which contains the inline login form. Remove the associated state variables (`email`, `password`, `error`, `isSubmitting`) and the `handleSubmit` function. Remove the `FormEvent` import. Add `useRouter` from `next/navigation`. Replace the login form render with a `useEffect` that redirects to `/auth` when `!session && !isCheckingSession`. Keep all dashboard code, session check logic, loading spinner, logout handler, and CRUD operations intact.

The return structure becomes:

```tsx
if (isCheckingSession) return <SessionSpinner />;
if (session) return <Dashboard />;
return null; // useEffect already pushed to /auth
```

**DoD:**

1. Login form HTML and state variables removed.
2. `useEffect` redirects to `/auth` when unauthenticated.
3. No flash of auth page -- null render while redirect is in-flight.
4. Dashboard and session check code completely untouched.
5. `pnpm --filter frontend build` passes.
6. Manual test: navigate to `/` without token -> brief spinner -> redirect to `/auth`.

**Depends on:** Task 8 (the `/auth` page must exist before the redirect)

---

### Task 10: Delete register page

**Files:**

- `apps/frontend/src/app/register/page.tsx` — DELETE

**What:**
Delete the entire `/register` page file. Its functionality is now provided by `RegisterForm` on the `/auth` page.

**DoD:**

1. File `apps/frontend/src/app/register/page.tsx` no longer exists.
2. `pnpm --filter frontend build` passes (no dangling imports referencing this file).
3. Manual test: navigate to `/register` -> 404 (no route).

**Depends on:** Task 8 (the register functionality must be available on `/auth` first)

---

## Post-Apply Checklist

- [ ] `pnpm --filter frontend typecheck`
- [ ] `pnpm --filter frontend build`
- [ ] Manual: navigate to `/` without token -> redirect to `/auth`
- [ ] Manual: login with valid credentials -> redirect to `/` -> dashboard renders
- [ ] Manual: login with invalid credentials -> inline error "Credenciales invalidas"
- [ ] Manual: register with new email -> redirect to `/` -> dashboard renders
- [ ] Manual: register with existing email -> inline error "Ese email ya esta en uso"
- [ ] Manual: tab switch preserves card context, resets form state
- [ ] Manual: password strength meter updates as user types
- [ ] Manual: show/hide password toggle works on both forms
- [ ] Manual: loading state disables all inputs, shows spinner in CTA
- [ ] Manual: terms checkbox required for register CTA
- [ ] Manual: bottom link toggles between login and register tabs
- [ ] Manual: network disconnected -> global banner error on submit
