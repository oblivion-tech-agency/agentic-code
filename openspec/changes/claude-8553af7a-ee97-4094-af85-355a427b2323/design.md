# Design: Auth Redesign -- Dark Cyan Design System & Component Architecture

**Change:** `claude-8553af7a-ee97-4094-af85-355a427b2323`

---

## 1. DESIGN.md -- Dark Cyan Design System Reference

A new file `DESIGN.md` at the repository root serves as the framework-agnostic design reference. It defines the visual foundation that all auth components (and future views) will follow.

### 1.1 Palette

Complete set of CSS custom properties, their hex values, and Tailwind class mappings:

| Token                  | Hex / Value                | Tailwind Class                                | Purpose                              |
| ---------------------- | -------------------------- | --------------------------------------------- | ------------------------------------ |
| `--background`         | `#07111f`                  | `bg-background`                               | Page background (deep navy)          |
| `--foreground`         | `#f8fafc`                  | `text-foreground`                             | Primary text (near-white)            |
| `--surface`            | `#0f172a`                  | `bg-surface`                                  | Card / container background          |
| `--surface-foreground` | `#e2e8f0`                  | `text-surface-foreground`                     | Text on surface (light gray)         |
| `--surface-border`     | `rgba(148, 163, 184, 0.2)` | `border-surface-border`                       | Card borders                         |
| `--surface-elevated`   | `#1e293b`                  | `bg-surface-elevated`                         | Active tab, elevated surfaces        |
| `--primary`            | `#22d3ee`                  | `bg-primary` / `text-primary`                 | Cyan accent for CTAs, highlights     |
| `--primary-foreground` | `#082f49`                  | `text-primary-foreground`                     | Text on primary bg (dark navy)       |
| `--muted`              | `#94a3b8`                  | `text-muted`                                  | Secondary text, labels, placeholders |
| `--danger`             | `#f87171`                  | `text-danger` / `border-danger` / `bg-danger` | Error states                         |
| `--success`            | `#34d399`                  | `text-success`                                | Password strength (3-4), success     |
| `--warning`            | `#fbbf24`                  | `text-warning`                                | Password strength (2), warnings      |
| `--ring`               | `rgba(34, 211, 238, 0.3)`  | (focus ring via Tailwind)                     | Input focus ring (cyan at 30%)       |
| `--glow`               | `rgba(34, 211, 238, 0.3)`  | `shadow-[0_0_20px_rgba(34,211,238,0.3)]`      | Primary button glow                  |

**Key decisions:**

- No `--brand` token needed -- `--primary` doubles as the brand accent
- No `--danger-foreground` -- errors use `text-danger` on `bg-danger/10` (transparency)
- All alpha values are in the hex/rgba, not in Tailwind opacity modifiers (avoids double-compounding)
- The `--glow` token is a `box-shadow` value, not a CSS variable -- referenced directly in Tailwind arbitrary values

### 1.2 Typography

| Element      | Size             | Weight          | Letter-spacing   | Color (Tailwind)          |
| ------------ | ---------------- | --------------- | ---------------- | ------------------------- |
| Labels       | `text-xs` (12px) | `font-medium`   | `tracking-wider` | `text-muted`              |
| Input text   | `text-sm` (14px) | `font-normal`   | normal           | `text-foreground`         |
| Button text  | `text-sm` (14px) | `font-semibold` | normal           | `text-primary-foreground` |
| Helper/error | `text-xs` (12px) | `font-normal`   | normal           | `text-danger`             |
| Muted link   | `text-sm` (14px) | `font-normal`   | normal           | `text-muted`              |
| Brand mark   | `text-sm` (14px) | `font-normal`   | `tracking-wide`  | `text-muted`              |

**Decision:** The existing body font `Arial, Helvetica, sans-serif` from `globals.css` is used throughout. No custom font import.

### 1.3 Spacing Scale

Use Tailwind's default spacing scale: `gap-2` (8px), `gap-4` (16px), `mt-4` (16px), `p-6` (24px), `mb-8` (32px), `mb-1.5` (6px for label-input gap).

### 1.4 Component Specs (from DESIGN.md)

#### Card

```
rounded-xl border border-surface-border bg-surface p-6 shadow-lg
```

Max width: `max-w-[420px]`. Centered via flex parent.

#### Input

```
h-10 sm:h-11 w-full rounded-lg bg-surface text-foreground
focus:ring-2 focus:ring-primary/30 focus:border-primary
```

Label above input: `block text-xs font-medium text-muted uppercase tracking-wider mb-1.5`.

Password toggle: absolute-positioned button inside `relative` wrapper, `absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground`.

#### Button (Primary CTA)

```
w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm
hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50
shadow-[0_0_20px_rgba(34,211,238,0.3)]
disabled:opacity-50 disabled:cursor-not-allowed
```

#### Tabs (Segmented Control)

```
grid grid-cols-2 gap-0 p-1 rounded-lg bg-surface-border/10
```

Active tab: `bg-surface-elevated shadow-sm`.
Inactive tab: `text-muted`.

#### Brand Mark

```
flex flex-col items-center gap-2 mb-8
```

Icon: 20x20 inline SVG. Text: `text-muted text-sm tracking-wide`.

#### Password Strength

```
flex gap-1 w-full
```

Segments: `h-[3px] flex-1 rounded-full transition-colors duration-200`.
Default: `bg-surface-border`. Active: dynamic via `style={{ backgroundColor }}`.
Label: `text-xs mt-1`.

### 1.5 Do's & Don'ts

**Do:**

- Use Tailwind utility classes for ALL styling
- Use `focus:` variants for focus states (never `onFocus`/`onBlur` handlers)
- Use CSS variables via Tailwind config (e.g., `bg-surface`, `text-muted`)
- Keep forms self-contained -- each form manages its own state
- Use inline `style` only for dynamic computed colors (password strength segments)

**Don't:**

- Use `<style>` tags or CSS modules
- Import icon libraries -- use inline SVGs
- Use inline `style` objects for static styling
- Mix light and dark theme tokens
- Add per-component CSS files

---

## 2. Component Tree

```
page.tsx  (/)
  Renders: dashboard when authenticated, router.push('/auth') when not
  No auth form elements remain

app/auth/page.tsx  (new)
  Manages: activeTab state, session check on mount, onAuthSuccess redirect
  Renders:
    ├── BrandMark (inline or separate component)
    ├── Tabs
    │   ├── "Iniciar sesion" (tab index 0)
    │   └── "Crear cuenta"   (tab index 1)
    ├── [activeTab === 'login']    → LoginForm
    │   ├── Input (email)
    │   ├── Input (password + show/hide toggle)
    │   ├── Inline error / global banner area
    │   ├── CTA Button ("Iniciar sesion")
    │   └── Bottom link ("Sin cuenta? Crear una")
    └── [activeTab === 'register'] → RegisterForm
        ├── Input (firstName)
        ├── Input (lastName)
        ├── Input (email)
        ├── Input (password + show/hide toggle)
        ├── PasswordStrength (4-segment meter)
        ├── Checkbox (terms)
        ├── Inline error / global banner area
        ├── CTA Button ("Crear cuenta")
        └── Bottom link ("Ya tenes cuenta? Iniciar sesion")
```

**Key decision:** No barrel export file (`index.ts`) in `components/auth/`. Each component is imported by full path. This avoids unnecessary module resolution overhead and keeps the import graph explicit.

---

## 3. Data Flow

### 3.1 Form State

Each form component (LoginForm, RegisterForm) manages its own local state via `useState`. No global state, no context, no form library:

```
LoginForm state:
  email: string
  password: string
  showPassword: boolean
  isLoading: boolean
  error: 'invalid_credentials' | 'network' | null

RegisterForm state:
  firstName: string
  lastName: string
  email: string
  password: string
  showPassword: boolean
  acceptedTerms: boolean
  isLoading: boolean
  error: 'email_in_use' | 'network' | null
```

### 3.2 Auth Flow

```
Submit → login(input) / register(input)
  ├── Success (2xx) → persistToken(accessToken) → onAuthSuccess() → router.push('/')
  │
  ├── 401 (login only) → error = 'invalid_credentials'
  │     → inline error on password field ("Credenciales invalidas")
  │     → button re-enables
  │
  ├── 409 (register only) → error = 'email_in_use'
  │     → inline error on email field ("Ese email ya esta en uso")
  │     → button re-enables
  │
  └── 5xx / network → error = 'network'
        → global banner at top of form ("Error de conexion. Intentalo de nuevo.")
        → button re-enables
```

### 3.3 Error Exclusivity

- `401` / `409` inline error AND global banner are mutually exclusive
- Only one error state is visible at a time
- Setting a new error clears the previous one

### 3.4 Token Persistence

- `login()` and `register()` call `persistToken(accessToken)` from `lib/auth.ts`
- Token is stored in `localStorage` under key `accessToken` (existing pattern, unchanged)
- On mount, `auth/page.tsx` checks `readToken()` -- if valid token exists, redirects to `/` immediately
- `page.tsx` continues its existing session check pattern (`readToken()` + `getMe()` + `getConfig()`)

### 3.5 Loading State

Each form has `isSubmitting: boolean`. While `true`:

- Button shows spinner + loading text ("Iniciando sesion..." / "Creando cuenta...")
- All inputs are `disabled`
- Bottom link gets `pointer-events-none`

---

## 4. Route Design

| Route       | File                      | Behavior                                                      |
| ----------- | ------------------------- | ------------------------------------------------------------- |
| `/`         | `page.tsx` (existing)     | If authenticated → dashboard. If not → `router.push('/auth')` |
| `/auth`     | `app/auth/page.tsx` (NEW) | Auth card with login/register tabs. Pure client component     |
| `/register` | `app/register/page.tsx`   | DELETED -- functionality absorbed into `/auth`                |

**Decision:** `/` keeps the session-check spinner on first load. Once checked and no token exists, the redirect to `/auth` replaces the inline login form. This means:

- The session check (`readToken()` + `getMe()` + `getConfig()`) stays in `page.tsx`
- The loading spinner stays in `page.tsx`
- The unauthenticated branch changes from `<LoginForm>` to `router.push('/auth')` + `null` render

**Decision rationale for single `/auth` vs separate `/login` + `/register`:** 90% of the UI (card wrapper, brand mark, body gradient, input styling) is shared between login and register. A single route with client-side tab switching avoids:

- Route duplication (two page files with identical layout)
- Layout shift on navigation
- Extra server round-trips for theme

---

## 5. CSS Architecture

### 5.1 Current State

`globals.css` has:

- 9 dark-theme CSS variables (lines 6-14)
- 6 light-theme orphan variables (lines 17-22) -- unused by any component
- Body gradient background (lines 25-31)
- A `@layer utilities` with `text-balance`

### 5.2 Target State

All styling via Tailwind utility classes. No per-component CSS files. The CSS variables in `:root` serve as the design token source of truth, referenced through `tailwind.config.ts` color mappings.

### 5.3 Key Rules

1. **ALL static styling** uses Tailwind utility classes
2. **NO** CSS modules, `<style>` tags, or `.module.css` files
3. **NO** inline `style` objects -- except for `password-strength.tsx` (dynamic color)
4. **NO** `onFocus`/`onBlur` handlers -- use `focus:ring-2 focus:ring-primary/30 focus:border-primary`
5. The body gradient (`radial-gradient` + `linear-gradient`) stays in `globals.css` as-is

---

## 6. File-by-File Change Plan

### 6.1 `DESIGN.md` (NEW -- repo root)

**What:** Create the dark cyan design system reference document.

**Content:** Sections 1.1-1.5 from this design doc (palette, typography, spacing, component specs, do's & don'ts).

**Notes:**

- Framework-agnostic -- no React, no Next.js specifics
- All token values match what goes in `globals.css` and `tailwind.config.ts`
- Serve as the single source of truth for future components and views

---

### 6.2 `apps/frontend/src/app/globals.css` (MODIFY)

**Remove (lines 16-22):**

```css
/* Registration page light theme */
--bg-secondary: #f5f5f0;
--bg-card: #ffffff;
--accent: #7f77dd;
--accent-hover: #6d65c9;
--text-secondary: #6b7280;
--border-subtle: #e5e7eb;
```

**Add (after `--danger: #f87171;`):**

```css
--surface-elevated: #1e293b;
--success: #34d399;
--warning: #fbbf24;
```

**Final `:root` block:**

```css
:root {
  --background: #07111f;
  --foreground: #f8fafc;
  --surface: #0f172a;
  --surface-elevated: #1e293b;
  --surface-foreground: #e2e8f0;
  --surface-border: rgba(148, 163, 184, 0.2);
  --primary: #22d3ee;
  --primary-foreground: #082f49;
  --muted: #94a3b8;
  --danger: #f87171;
  --success: #34d399;
  --warning: #fbbf24;
}
```

**Verify:** No `var(--bg-secondary)`, `var(--bg-card)`, `var(--accent)`, `var(--accent-hover)`, `var(--text-secondary)`, or `var(--border-subtle)` remain anywhere in `apps/frontend/src/`.

---

### 6.3 `apps/frontend/tailwind.config.ts` (MODIFY)

**Remove these color mappings:**

```
'bg-secondary': 'var(--bg-secondary)',
'bg-card': 'var(--bg-card)',
accent: 'var(--accent)',
'accent-hover': 'var(--accent-hover)',
'text-secondary': 'var(--text-secondary)',
'border-subtle': 'var(--border-subtle)',
```

**Add these color mappings:**

```
'surface-elevated': 'var(--surface-elevated)',
success: 'var(--success)',
warning: 'var(--warning)',
```

**Final colors block:**

```typescript
colors: {
  background: 'var(--background)',
  foreground: 'var(--foreground)',
  surface: 'var(--surface)',
  'surface-elevated': 'var(--surface-elevated)',
  'surface-foreground': 'var(--surface-foreground)',
  'surface-border': 'var(--surface-border)',
  primary: 'var(--primary)',
  'primary-foreground': 'var(--primary-foreground)',
  muted: 'var(--muted)',
  danger: 'var(--danger)',
  success: 'var(--success)',
  warning: 'var(--warning)',
},
```

---

### 6.4 `apps/frontend/src/app/page.tsx` (MODIFY -- redirect instead of render login)

**What changes:**

1. Imports: add `useRouter` from `next/navigation`. Remove `FormEvent`, `useState` for email/password, `login` import (those are now in the form component)
2. Remove `email`, `password`, `error`, `isSubmitting` state variables
3. Remove `handleSubmit` function
4. Remove the unauthenticated render block (lines 491-617) completely
5. Replace with `useEffect` that calls `router.push('/auth')` when `!session && !isCheckingSession`
6. Keep: session check (getMe + getConfig), dashboard render, user CRUD, loading spinner

**Return structure:**

```tsx
if (isCheckingSession) return <SessionSpinner />;
if (session) return <Dashboard />;
return null; // useEffect already pushed to /auth
```

**Key implementation notes:**

- The `useEffect` for redirect fires after `isCheckingSession` is false AND `session` is null
- This avoids a flash of the auth page before the session check completes
- The `null` render is a brief no-op while the redirect is in-flight

---

### 6.5 `apps/frontend/src/app/auth/page.tsx` (NEW)

**Component:** `AuthPage` -- orchestrator.

**State:**

```typescript
const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
```

**On mount effect:**

```typescript
useEffect(() => {
  const token = readToken();
  if (token) router.push('/');
}, []);
```

**Render:**

```tsx
<main className="flex min-h-screen items-center justify-center">
  <div className="w-full max-w-[420px] mx-auto p-6">
    <BrandMark />
    <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
    <div className="pt-6">
      {activeTab === 'login' ? (
        <LoginForm
          onAuthSuccess={() => router.push('/')}
          onSwitchToRegister={() => setActiveTab('register')}
        />
      ) : (
        <RegisterForm
          onAuthSuccess={() => router.push('/')}
          onSwitchToLogin={() => setActiveTab('login')}
        />
      )}
    </div>
  </div>
</main>
```

**Notes:**

- `BrandMark` is imported from `@/components/auth/brand-mark` (or inlined)
- The card `bg-surface border border-surface-border rounded-xl shadow-lg p-6` wraps the inner content
- Full-viewport background comes from `globals.css` body gradient (no inline background)

---

### 6.6 `apps/frontend/src/components/auth/brand-mark.tsx` (NEW)

**Exports:** default `BrandMark`.

**Render:**

```tsx
<div className="flex flex-col items-center gap-2 mb-8">
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Inline SVG -- "ac" stylized mark */}
    <rect width="20" height="20" rx="4" fill="var(--primary)" />
    <text
      x="50%"
      y="55%"
      dominantBaseline="middle"
      textAnchor="middle"
      fill="var(--primary-foreground)"
      fontWeight="bold"
      fontSize="11"
      fontFamily="Arial, sans-serif"
    >
      AC
    </text>
  </svg>
  <span className="text-muted text-sm tracking-wide">agentic-code · console</span>
</div>
```

**Notes:**

- No icon library imported
- SVG is inline, light (< 1KB)
- Fill uses `currentColor` approach via Tailwind classes or CSS variable references

---

### 6.7 `apps/frontend/src/components/auth/tabs.tsx` (NEW)

**Exports:** default `Tabs`.

**Props:**

```typescript
interface TabsProps {
  activeTab: 'login' | 'register';
  onTabChange: (tab: 'login' | 'register') => void;
}
```

**Render:**

```tsx
<div className="grid grid-cols-2 gap-0 p-1 rounded-lg bg-surface-border/10">
  <button
    onClick={() => onTabChange('login')}
    className={`py-2 text-center text-sm font-medium cursor-pointer rounded-md transition-all duration-200
      ${activeTab === 'login' ? 'text-primary bg-surface-elevated shadow-sm' : 'text-muted'}`}
  >
    Iniciar sesion
  </button>
  <button
    onClick={() => onTabChange('register')}
    className={`py-2 text-center text-sm font-medium cursor-pointer rounded-md transition-all duration-200
      ${activeTab === 'register' ? 'text-primary bg-surface-elevated shadow-sm' : 'text-muted'}`}
  >
    Crear cuenta
  </button>
</div>
```

**Notes:**

- Fully controlled -- no internal state
- Transitions with `transition-all duration-200` on both tabs
- No `type="button"` needed since these are `<button>` elements outside a `<form>`

---

### 6.8 `apps/frontend/src/components/auth/login-form.tsx` (NEW)

**Exports:** default `LoginForm`.

**State:** email, password, showPassword, isLoading, error.

**Form layout:**

1. Optional global banner (conditional on `error === 'network'`)
2. Email field (label "EMAIL" + autocomplete "username")
3. Password field (label "CONTRASENA" + show/hide toggle + autocomplete "current-password")
4. Inline error on password (conditional on `error === 'invalid_credentials'`)
5. CTA button ("Iniciar sesion" with spinner)
6. Bottom link ("Sin cuenta? Crear una")

**Submit handler:**

```typescript
async function handleSubmit(e: FormEvent) {
  e.preventDefault();
  setError(null);
  setIsLoading(true);
  try {
    const response = await login({ email, password });
    persistToken(response.accessToken);
    onAuthSuccess();
  } catch (err) {
    if (err.message includes '401' or similar) {
      setError('invalid_credentials');
    } else {
      setError('network');
    }
  } finally {
    setIsLoading(false);
  }
}
```

**Edge case -- error exclusivity:** When setting a new error, the previous error is always cleared first (`setError(null)` before the async call). The `catch` block sets exactly one error type, never both.

**Edge case -- race condition:** The `isLoading` flag disables all inputs and the submit button, preventing double-submit. The flag is always reset in `finally`.

---

### 6.9 `apps/frontend/src/components/auth/register-form.tsx` (NEW)

**Exports:** default `RegisterForm`.

**State:** firstName, lastName, email, password, showPassword, acceptedTerms, isLoading, error.

**Form layout:**

1. Optional global banner (conditional on `error === 'network'`)
2. First name field (label "NOMBRE" + autocomplete "given-name")
3. Last name field (label "APELLIDO" + autocomplete "family-name")
4. Email field (label "EMAIL" + autocomplete "email")
5. Password field (label "CONTRASENA" + show/hide toggle + autocomplete "new-password")
6. Password strength meter (below password input)
7. Terms checkbox
8. Inline error on email (conditional on `error === 'email_in_use'`)
9. CTA button ("Crear cuenta" with spinner)
10. Bottom link ("Ya tenes cuenta? Iniciar sesion")

**Submit handler:**

```typescript
async function handleSubmit(e: FormEvent) {
  e.preventDefault();
  setError(null);
  setIsLoading(true);
  try {
    const response = await register({ firstName, lastName, email, password });
    persistToken(response.accessToken);
    onAuthSuccess();
  } catch (err) {
    if (err.message includes '409' or 'already in use') {
      setError('email_in_use');
    } else {
      setError('network');
    }
  } finally {
    setIsLoading(false);
  }
}
```

**Button disabled logic:**

```
disabled = isLoading || !firstName || !lastName || !email || !password || !acceptedTerms
```

**Key decision -- dateOfBirth removed:** The existing register page has a dateOfBirth field, but the backend `RegisterDto` does not accept it. The spec explicitly omits it. This avoids sending dead data.

---

### 6.10 `apps/frontend/src/components/auth/password-strength.tsx` (NEW)

**Exports:** default `PasswordStrength`.

**Props:**

```typescript
interface PasswordStrengthProps {
  password: string;
}
```

**Score computation:**

```typescript
function getScore(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}
```

**Color mapping:**

```typescript
const SEGMENT_COLORS: Record<number, string> = {
  1: '#f87171', // danger
  2: '#fbbf24', // warning
  3: '#34d399', // success
  4: '#34d399', // success (same for 3 and 4)
};

const LABELS: Record<number, string> = {
  1: 'Debil',
  2: 'Media',
  3: 'Fuerte',
  4: 'Muy fuerte',
};
```

**Render:**

```tsx
{
  password.length > 0 && (
    <div className="mt-2">
      <div className="flex gap-1 w-full">
        {[1, 2, 3, 4].map((segment) => (
          <div
            key={segment}
            className="h-[3px] flex-1 rounded-full transition-colors duration-200"
            style={{
              backgroundColor: segment <= score ? SEGMENT_COLORS[score] : undefined, // falls back to bg-surface-border
            }}
          />
        ))}
      </div>
      <p className="text-xs mt-1" style={{ color: SEGMENT_COLORS[score] }}>
        {LABELS[score]}
      </p>
    </div>
  );
}
```

**Notes:**

- Returns `null` when `password` is empty (no meter shown)
- Unfilled segments inherit `bg-surface-border` from the default Tailwind class
- Inline `style` is the intentional exception for dynamic colors

---

### 6.11 `apps/frontend/src/app/register/page.tsx` (DELETE)

**Action:** Delete the entire file.

**No migration needed:** The register page had its own copy of form logic, dateOfBirth (dead field), and light-theme inline styles. None of this code is reused -- the new `RegisterForm` component is built from scratch using the design system tokens.

---

## 7. Error Handling & Edge Cases

| Scenario                    | Handling                                                                  |
| --------------------------- | ------------------------------------------------------------------------- |
| Invalid login credentials   | Inline error on password field ("Credenciales invalidas")                 |
| Email already registered    | Inline error on email field ("Ese email ya esta en uso")                  |
| Network error / 5xx         | Global banner at top of form (mutually exclusive with inline errors)      |
| Token exists on /auth mount | Immediate redirect to `/` (no flash)                                      |
| No token, user at `/`       | `useEffect` redirects to `/auth` (no inline login form)                   |
| Double submit               | `isLoading` disables form fields and submit button                        |
| Empty register form         | Submit button is disabled (all required fields check)                     |
| Unaccepted terms            | Submit button is disabled until terms checkbox is checked                 |
| Tab switch during loading   | Tabs are not disabled (acceptable -- abort controller not implemented)    |
| Tab switch with dirty form  | Form state resets on remount (each form is a separate component instance) |
| 500 on auth success token   | `page.tsx` session check fails, clears token, redirects back to `/auth`   |

---

## 8. Risks & Mitigations

| Risk                                             | Likelihood | Impact | Mitigation                                                                                        |
| ------------------------------------------------ | ---------- | ------ | ------------------------------------------------------------------------------------------------- |
| Broken references to removed CSS vars            | Low        | High   | Search entire `src/` for removed var() references before deploy                                   |
| Dashboard inline styles conflict with new tokens | Medium     | Medium | Dashboard styles are inline (light theme), not affected by dark tokens                            |
| Tab switch loses form state                      | Low        | Low    | Acceptable -- forms are ephemeral; users expect fresh state                                       |
| Redirect loop (no token, / push to /auth)        | None       | High   | No redirect loop -- `/auth` does NOT redirect back to `/` without a token                         |
| Token exists but expired                         | Low        | Medium | `page.tsx` session check handles 401 by clearing token and showing auth; `/` redirects to `/auth` |
| Register password strength on 409                | None       | Low    | Password state is preserved (same component instance after error)                                 |

---

## 9. Verification Checklist

- [ ] `DESIGN.md` created at repo root
- [ ] `globals.css` -- orphan light theme variables removed, `--surface-elevated`, `--success`, `--warning` added
- [ ] No `var(--bg-secondary)`, `var(--bg-card)`, etc. remain in `apps/frontend/src/`
- [ ] `tailwind.config.ts` -- old mappings removed, new mappings added
- [ ] `page.tsx` -- login form removed, redirect to `/auth` added
- [ ] `register/page.tsx` -- deleted
- [ ] `auth/page.tsx` -- orchestrator with tabs, brand mark, session check
- [ ] `components/auth/brand-mark.tsx` -- inline SVG, no icon library
- [ ] `components/auth/tabs.tsx` -- controlled component, no internal state
- [ ] `components/auth/login-form.tsx` -- email + password with show/hide, 401 handling
- [ ] `components/auth/register-form.tsx` -- 4 fields + strength meter + terms, 409 handling
- [ ] `components/auth/password-strength.tsx` -- 4-segment meter with dynamic colors
- [ ] No inline `style` on any component except password-strength segment colors
- [ ] No `onFocus`/`onBlur` handlers -- all focus states via Tailwind `focus:` variants
- [ ] All imports use `@/` path alias (e.g., `@/components/auth/login-form`)
