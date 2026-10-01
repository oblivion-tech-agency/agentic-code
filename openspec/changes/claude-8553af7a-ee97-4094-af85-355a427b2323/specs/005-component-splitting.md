# Spec: Component Splitting

## Change

`claude-8553af7a-ee97-4094-af85-355a427b2323`

## Goal

Extract the 4 new auth components into dedicated files under `components/auth/`. The `auth/page.tsx` orchestrator imports all of them.

## File structure

```
apps/frontend/src/
  components/auth/
    login-form.tsx
    register-form.tsx
    tabs.tsx
    password-strength.tsx
  app/
    auth/
      page.tsx          (new — orchestrator, imports from components/auth/)
    page.tsx             (modified — remove login form, keep dashboard)
    register/
      page.tsx           (DELETED)
```

## Component specs

### 1. `components/auth/login-form.tsx`

**Exports:** default `LoginForm` component.

**Props:**

```typescript
interface LoginFormProps {
  onAuthSuccess: () => void;
  onSwitchToRegister: () => void;
}
```

**Responsibility:**

- Renders email input, password input (with show/hide toggle), "Iniciar sesion" CTA.
- Manages its own form state (field values, loading, error state).
- Calls `POST /api/auth/login` on submit.
- On 401, shows inline error on password field ("Credenciales invalidas").
- On 5xx/network error, shows global banner.
- On success, persists `accessToken` to `localStorage` and calls `onAuthSuccess`.
- Renders "Sin cuenta? Crear una" link that calls `onSwitchToRegister`.

**Internal state:**

- `email: string`
- `password: string`
- `showPassword: boolean`
- `isLoading: boolean`
- `error: 'invalid_credentials' | 'network' | null`

**Pure Tailwind, no inline styles.** No `onFocus`/`onBlur` handlers.

---

### 2. `components/auth/register-form.tsx`

**Exports:** default `RegisterForm` component.

**Props:**

```typescript
interface RegisterFormProps {
  onAuthSuccess: () => void;
  onSwitchToLogin: () => void;
}
```

**Responsibility:**

- Renders firstName, lastName, email, password inputs, password strength meter, terms checkbox, "Crear cuenta" CTA.
- Manages its own form state.
- Calls `POST /api/auth/register` on submit.
- On 409, shows inline error on email field ("Ese email ya esta en uso").
- On 5xx/network error, shows global banner.
- On success, persists token and calls `onAuthSuccess`.
- Renders "Ya tenes cuenta? Iniciar sesion" link.

**Internal state:**

- `firstName: string`
- `lastName: string`
- `email: string`
- `password: string`
- `showPassword: boolean`
- `acceptedTerms: boolean`
- `isLoading: boolean`
- `error: 'email_in_use' | 'network' | null`

**Pure Tailwind, with ONE exception:** password strength segment colors use inline `style={{ backgroundColor }}` because the color is dynamic (depends on score).

---

### 3. `components/auth/tabs.tsx`

**Exports:** default `Tabs` component.

**Props:**

```typescript
interface TabsProps {
  activeTab: 'login' | 'register';
  onTabChange: (tab: 'login' | 'register') => void;
}
```

**Responsibility:**

- Two-button segmented control: "Iniciar sesion" | "Crear cuenta".
- Active tab has elevated background (`bg-surface-elevated`) and subtle shadow.
- Transitions between tabs with `transition-all duration-200`.
- Clicking fires `onTabChange` with the clicked tab value.

**Styling:**

| Element        | Classes                                                                                                                                 |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Container      | `grid grid-cols-2 gap-0 p-1 rounded-lg bg-surface-border/10`                                                                            |
| Tab (inactive) | `py-2 text-center text-sm font-medium text-muted cursor-pointer rounded-md transition-all duration-200`                                 |
| Tab (active)   | `py-2 text-center text-sm font-medium text-primary cursor-pointer rounded-md bg-surface-elevated shadow-sm transition-all duration-200` |

**No internal state.** Fully controlled by parent — the parent manages `activeTab` and passes it down.

---

### 4. `components/auth/password-strength.tsx`

**Exports:** default `PasswordStrength` component.

**Props:**

```typescript
interface PasswordStrengthProps {
  password: string;
}
```

**Responsibility:**

- Computes strength score (0-4) from the `password` prop.
- Renders 4 segments with color based on score.
- Renders optional label below the segments.

**Score computation** (same logic as existing register page):

- Score 0: empty string (render nothing).
- Score 1: < 6 chars or all same type (e.g., only lowercase).
- Score 2: >= 6 chars, at least 2 character types.
- Score 3: >= 8 chars, at least 3 character types.
- Score 4: >= 10 chars, all 4 types (uppercase, lowercase, digits, symbols).

**Segment rendering:**

```tsx
<div class="flex gap-1 w-full">
  {[1, 2, 3, 4].map((segment) => (
    <div
      key={segment}
      class="h-[3px] flex-1 rounded-full transition-colors duration-200"
      style={{ backgroundColor: segment <= score ? colorForScore(score) : undefined }}
    />
  ))}
</div>
```

Note: The `style` prop on segment divs is the intentional exception — the color is computed dynamically.

**Label rendering:**

```
{score > 0 && <p class="text-xs mt-1" style={{ color: colorForScore(score) }}>{labelForScore(score)}</p>}
```

---

### 5. `app/auth/page.tsx` (new orchestrator)

**Responsibility:**

- Full-viewport centered layout with the auth card.
- Manages `activeTab: 'login' | 'register'` state.
- Renders `<BrandMark>`, `<Tabs>`, and the active form.
- On mount, checks for existing token — if present, redirects to `/`.
- Passes `onAuthSuccess` to both forms (redirects to `/` on success).
- Passes `onSwitchToRegister` / `onSwitchToLogin` to toggle the tab.

**No database calls, no API calls on mount.** Just layout orchestration.

---

### 6. `app/page.tsx` (modified)

- Remove the login form block (lines ~491-617 in current file).
- The session-checking state stays (shows a loading spinner while checking token via `readToken()`).
- The dashboard render (when authenticated) stays untouched.
- When NOT authenticated and NOT checking, replace inline login form with `router.push('/auth')`.

---

### 7. `app/register/page.tsx` (DELETED)

- Entire file removed. The register functionality lives in `register-form.tsx` on the `/auth` page.

## Import map

```
app/auth/page.tsx
  imports:
    - LoginForm    from '@/components/auth/login-form'
    - RegisterForm from '@/components/auth/register-form'
    - Tabs         from '@/components/auth/tabs'

components/auth/register-form.tsx
  imports:
    - PasswordStrength from '@/components/auth/password-strength'
```

(No other cross-imports between login-form, tabs, and password-strength.)

## No barrel export

Each component file uses a default export. No `index.ts` barrel file in `components/auth/`. Consumers import by full path.

## CSS verification

After extraction, verify:

- No auth CSS lives in `page.tsx` (dashboard-only).
- No component uses inline `style` except `password-strength.tsx` segment colors.
- All auth pages/components use identical Tailwind patterns (focus ring, input height, label styling).
