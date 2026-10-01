# Spec: Login Form

## Change

`claude-8553af7a-ee97-4094-af85-355a427b2323`

## Source file

`apps/frontend/src/components/auth/login-form.tsx`

This is a new file. The login form is currently inline inside `page.tsx` (lines 491-617).

## Fields

### Email

| Property     | Value                                                                                                    |
| ------------ | -------------------------------------------------------------------------------------------------------- |
| Type         | `email`                                                                                                  |
| Label        | "EMAIL" — uppercase, tracking-wide, small, muted                                                         |
| Input        | `h-10` (desktop), `h-11` (mobile via `sm:h-11`), `rounded-lg`, `bg-surface`, `text-foreground`, `w-full` |
| Focus ring   | `focus:ring-2 focus:ring-primary/30 focus:border-primary`                                                |
| Placeholder  | `name@example.com`                                                                                       |
| Autocomplete | `username` (primary identifier)                                                                          |

### Password

| Property     | Value                                                                                                                                |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| Type         | `password` with show/hide toggle                                                                                                     |
| Label        | "CONTRASENA" — uppercase, tracking-wide, small, muted                                                                                |
| Input        | `h-10` (desktop), `h-11` (mobile via `sm:h-11`), `rounded-lg`, `bg-surface`, `text-foreground`, `w-full`                             |
| Focus ring   | `focus:ring-2 focus:ring-primary/30 focus:border-primary`                                                                            |
| Toggle       | Eye icon (open/closed SVG) positioned `absolute right-3 top-1/2 -translate-y-1/2`, `text-muted hover:text-foreground cursor-pointer` |
| Autocomplete | `current-password`                                                                                                                   |

### Show/hide toggle

- A button inside the input wrapper, absolutely positioned on the right.
- Toggles input `type` between `password` and `text`.
- Icon changes between an eye and an eye-slash SVG.
- No label — the icon is the affordance.

### Label styling (shared for both fields)

```
<label class="block text-xs font-medium text-muted uppercase tracking-wider mb-1.5">
```

## CTA Button

| Property      | Value                                                   |
| ------------- | ------------------------------------------------------- |
| Text          | "Iniciar sesion"                                        |
| Variant       | Primary with cyan glow                                  |
| Width         | `w-full`                                                |
| Height        | `py-3` vertical padding                                 |
| Background    | `bg-primary`                                            |
| Text color    | `text-primary-foreground`                               |
| Font          | `font-semibold text-sm`                                 |
| Border radius | `rounded-lg`                                            |
| Hover         | `hover:bg-primary/90`                                   |
| Focus         | `focus:outline-none focus:ring-2 focus:ring-primary/50` |
| Glow          | `shadow-[0_0_20px_rgba(34,211,238,0.3)]`                |
| Disabled      | `opacity-50 cursor-not-allowed` when loading            |
| Type          | `submit`                                                |

## Loading state

When the form is submitting:

| Element     | Change                                                                |
| ----------- | --------------------------------------------------------------------- |
| Button text | Changes to "Iniciando sesion..."                                      |
| Button      | `disabled` attribute set                                              |
| Spinner     | Inline spinner SVG (animated spin, `h-4 w-4 mr-2`) placed before text |
| All inputs  | `disabled` attribute set                                              |
| Toggle link | `pointer-events-none`                                                 |

## Error states

### 401 Unauthorized (invalid credentials)

- Inline error on the password field only (email field stays clean).
- Password input gets: `border-danger focus:ring-danger/30 focus:border-danger`.
- Helper text below password input: "Credenciales invalidas" in `text-danger text-xs mt-1`.
- Email input stays in normal (focus-primary) styling.
- The submit button re-enables so the user can retry.
- The global banner does NOT appear for 401.

### Network / 5xx

- Global banner at the top of the form (inside the card, above the fields).
- Styling: `bg-danger/10 border border-danger/30 text-danger text-sm p-3 rounded-lg mb-4`.
- Text: "Error de conexion. Intentalo de nuevo." (generic network error).
- The inline errors clear when a network error fires and vice versa — only one error state is visible at a time (401 field error OR global banner).

## Bottom link

Below the CTA, after a `mt-4` gap:

```
"¿Sin cuenta?" <link>"Crear una"</link>
```

| Property  | Value                                                                  |
| --------- | ---------------------------------------------------------------------- |
| Container | `text-center text-sm text-muted mt-4`                                  |
| Link text | "Crear una" in `text-primary hover:underline cursor-pointer`           |
| Action    | Calls `onSwitchToRegister` callback (or toggles the tab in the parent) |

## Submit handler

```
async function handleLogin(email: string, password: string): Promise<LoginResult>
```

Returns:

| Case          | Result                                          |
| ------------- | ----------------------------------------------- |
| Success       | `{ ok: true }` — parent calls `onAuthSuccess()` |
| 401           | `{ ok: false, error: 'invalid_credentials' }`   |
| 5xx / network | `{ ok: false, error: 'network' }`               |

- POST to `/api/auth/login` with JSON body `{ email, password }`.
- On success, persist `accessToken` to `localStorage`.
- No redirect in the component itself — parent handles it via `onAuthSuccess`.

## CSS approach

- All styling via Tailwind utility classes.
- NO inline `style={}` objects. NO `onFocus`/`onBlur` handlers — use `focus:` variants exclusively.
- Conditional error classes via template literal or `cn()` utility.
- Input container wrapper pattern for password toggle:

```
<div class="relative">
  <input ... />
  <button class="absolute right-3 top-1/2 -translate-y-1/2 ..." />
</div>
```

## Out of scope

- Social login buttons
- "Forgot password" link
- Remember me checkbox
- Captcha / Turnstile
