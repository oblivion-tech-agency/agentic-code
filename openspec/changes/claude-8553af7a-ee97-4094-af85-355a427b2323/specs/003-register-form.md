# Spec: Register Form

## Change

`claude-8553af7a-ee97-4094-af85-355a427b2323`

## Source file

`apps/frontend/src/components/auth/register-form.tsx`

This is a new file. The register form is currently at `apps/frontend/src/app/register/page.tsx`; that file will be deleted.

## Fields

All input fields share these baseline styles unless overridden:

| Property      | Value                                                                  |
| ------------- | ---------------------------------------------------------------------- |
| Height        | `h-10` (desktop), `h-11` (mobile via `sm:h-11`)                        |
| Border radius | `rounded-lg`                                                           |
| Background    | `bg-surface`                                                           |
| Text color    | `text-foreground`                                                      |
| Width         | `w-full`                                                               |
| Focus ring    | `focus:ring-2 focus:ring-primary/30 focus:border-primary`              |
| Label         | `block text-xs font-medium text-muted uppercase tracking-wider mb-1.5` |

### First name

| Property     | Value        |
| ------------ | ------------ |
| Name         | `firstName`  |
| Type         | `text`       |
| Label        | "NOMBRE"     |
| Placeholder  | `Juan`       |
| Autocomplete | `given-name` |

### Last name

| Property     | Value         |
| ------------ | ------------- |
| Name         | `lastName`    |
| Type         | `text`        |
| Label        | "APELLIDO"    |
| Placeholder  | `Perez`       |
| Autocomplete | `family-name` |

### Email

| Property     | Value                |
| ------------ | -------------------- |
| Name         | `email`              |
| Type         | `email`              |
| Label        | "EMAIL"              |
| Placeholder  | `nombre@example.com` |
| Autocomplete | `email`              |

### Password

| Property     | Value                                                                                              |
| ------------ | -------------------------------------------------------------------------------------------------- |
| Name         | `password`                                                                                         |
| Type         | `password` with show/hide toggle                                                                   |
| Label        | "CONTRASENA"                                                                                       |
| Autocomplete | `new-password`                                                                                     |
| Toggle       | Same implementation as login form: absolute eye icon, toggles `type` between `password` and `text` |

**Password strength meter** (see separate section below) renders directly below the password field, between the input and the helper space.

## Password strength meter

### Layout

- 4 equal-width segments in a horizontal row.
- Gap: `gap-1` between segments.
- Container width: `w-full`.

### Segment styling

| Property        | Value                                      |
| --------------- | ------------------------------------------ |
| Height          | `h-[3px]`                                  |
| Border radius   | `rounded-full`                             |
| Color           | Dynamic based on score (see below)         |
| Transition      | `transition-colors duration-200`           |
| Default (empty) | `bg-surface-border` — all 4 segments muted |

### Score-to-color mapping

| Score | Segments filled | Color   | Token            |
| ----- | --------------- | ------- | ---------------- |
| 1     | 1               | Red     | `var(--danger)`  |
| 2     | 2               | Amber   | `var(--warning)` |
| 3     | 3               | Emerald | `var(--success)` |
| 4     | 4               | Emerald | `var(--success)` |

- Unfilled segments remain `bg-surface-border`.
- Score is computed from password length and character variety (uppercase, lowercase, digits, symbols). Scoring logic is extracted from the existing register page logic.

### Strength label

Below the meter, an optional text label:

| Score     | Label                                  |
| --------- | -------------------------------------- |
| 0 (empty) | (none — no meter shown)                |
| 1         | "Debil" in `text-danger text-xs`       |
| 2         | "Media" in `text-warning text-xs`      |
| 3         | "Fuerte" in `text-success text-xs`     |
| 4         | "Muy fuerte" in `text-success text-xs` |

## Terms checkbox

Positioned below the password strength meter, before the CTA button. Gap from password field: `mt-4`.

```
<div class="flex items-start gap-2">
  <input type="checkbox" id="terms" class="mt-0.5 h-4 w-4 rounded border-surface-border ..." />
  <label for="terms" class="text-xs text-muted">
    Acepto los <a href="/terms" class="text-primary hover:underline">Terminos y Condiciones</a>
    y la <a href="/privacy" class="text-primary hover:underline">Politica de Privacidad</a>
  </label>
</div>
```

| Property               | Value                             |
| ---------------------- | --------------------------------- |
| Checkbox size          | 16x16 (`h-4 w-4`)                 |
| Checkbox border radius | `rounded`                         |
| Checkbox border        | `border-surface-border`           |
| Checkbox checked       | Tailwind default `accent-primary` |
| Label text             | `text-xs text-muted`              |
| Links                  | `text-primary hover:underline`    |

- The CTA button is disabled until the terms checkbox is checked.
- Links open in the same tab (client-side navigation via Next.js `Link` or `<a>`).

## CTA Button

| Property      | Value                                                                               |
| ------------- | ----------------------------------------------------------------------------------- |
| Text          | "Crear cuenta"                                                                      |
| Variant       | Primary with cyan glow                                                              |
| Width         | `w-full`                                                                            |
| Height        | `py-3` vertical padding                                                             |
| Background    | `bg-primary`                                                                        |
| Text color    | `text-primary-foreground`                                                           |
| Font          | `font-semibold text-sm`                                                             |
| Border radius | `rounded-lg`                                                                        |
| Hover         | `hover:bg-primary/90`                                                               |
| Focus         | `focus:outline-none focus:ring-2 focus:ring-primary/50`                             |
| Glow          | `shadow-[0_0_20px_rgba(34,211,238,0.3)]`                                            |
| Disabled      | `opacity-50 cursor-not-allowed` unless all required fields filled AND terms checked |
| Type          | `submit`                                                                            |

## Loading state

When the form is submitting:

| Element     | Change                                                                |
| ----------- | --------------------------------------------------------------------- |
| Button text | Changes to "Creando cuenta..."                                        |
| Button      | `disabled` attribute set                                              |
| Spinner     | Inline spinner SVG (animated spin, `h-4 w-4 mr-2`) placed before text |
| All inputs  | `disabled` attribute set                                              |
| Checkbox    | `disabled` attribute set                                              |

## Error states

### 409 Conflict (email already in use)

- Inline error on the email field only.
- Email input gets: `border-danger focus:ring-danger/30 focus:border-danger`.
- Helper text below email input: "Ese email ya esta en uso" in `text-danger text-xs mt-1`.
- All other fields stay clean.
- The submit button re-enables so the user can correct and retry.
- The global banner does NOT appear for 409.

### Network / 5xx

- Global banner at the top of the form (inside the card, above the fields).
- Styling: `bg-danger/10 border border-danger/30 text-danger text-sm p-3 rounded-lg mb-4`.
- Text: "Error de conexion. Intentalo de nuevo." (generic network error).
- Inline errors clear when network error fires and vice versa.

## Bottom link

Below the CTA, after a `mt-4` gap:

```
"Ya tenes cuenta?" <link>"Iniciar sesion"</link>
```

| Property  | Value                                                             |
| --------- | ----------------------------------------------------------------- |
| Container | `text-center text-sm text-muted mt-4`                             |
| Link text | "Iniciar sesion" in `text-primary hover:underline cursor-pointer` |
| Action    | Calls `onSwitchToLogin` callback (or toggles tab in parent)       |

## Submit handler

```
async function handleRegister(data: RegisterData): Promise<RegisterResult>
```

Where `RegisterData` is:

```
{
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}
```

Note: `dateOfBirth` is NOT sent to the backend. The existing register page has a dateOfBirth field but the backend `RegisterDto` does not accept it. The register form spec omits dateOfBirth entirely (removing the dead field rather than keeping it client-only).

Returns:

| Case          | Result                                          |
| ------------- | ----------------------------------------------- |
| Success       | `{ ok: true }` — parent calls `onAuthSuccess()` |
| 409           | `{ ok: false, error: 'email_in_use' }`          |
| 5xx / network | `{ ok: false, error: 'network' }`               |

- POST to `/api/auth/register` with JSON body.
- On success, persist `accessToken` to `localStorage`.
- No redirect in the component — parent handles it via `onAuthSuccess`.

## CSS approach

- All styling via Tailwind utility classes.
- NO inline `style={}` objects. Conditional classes via template literal or `cn()`.
- Password strength meter colors ARE an exception — the segment color is dynamic, so `style={{ backgroundColor }}` is acceptable for the segment divs only.

## Out of scope

- Date of birth field (removed — backend doesn't accept it)
- OAuth / social register
- Email verification flow
- Captcha / Turnstile
