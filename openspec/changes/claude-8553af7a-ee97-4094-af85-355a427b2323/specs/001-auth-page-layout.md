# Spec: Auth Page Layout

## Change

`claude-8553af7a-ee97-4094-af85-355a427b2323`

## Route

`/auth` renders the auth card only. No dashboard elements, no sidebar, no navbar appear on this page.

- File: `apps/frontend/src/app/auth/page.tsx`
- This is a new file (the route does not exist today).

## Background

The existing login form lives inside `page.tsx` alongside the admin dashboard, and register lives at `/register/page.tsx`. This spec replaces both with a standalone `/auth` page.

## Layout Spec

### Full-viewport background

- Same as existing body gradient (shared via CSS).
- No unique background for the auth page; the global body styles from `globals.css` apply automatically.
- No background image, no pattern overlay.

### Card container

| Property             | Value                                                               |
| -------------------- | ------------------------------------------------------------------- |
| Max width            | `max-w-[420px]`                                                     |
| Horizontal centering | `mx-auto`                                                           |
| Vertical centering   | `flex items-center justify-center min-h-screen` on the page wrapper |
| Background           | `bg-surface`                                                        |
| Border               | `border border-surface-border`                                      |
| Border radius        | `rounded-xl`                                                        |
| Inner padding        | `p-6`                                                               |
| Shadow               | `shadow-lg` (default Tailwind)                                      |

### Brand mark

Positioned at the top of the card, centered:

```
<icon>  agentic-code · console
```

- Icon: a small glyph representing "ac" (letters in a stylized mark, 20x20 or similar). Use an SVG inline or a simple text-based glyph. Do NOT import an icon library.
- Text: "agentic-code · console" in `text-muted text-sm tracking-wide`
- Container: `flex flex-col items-center gap-2 mb-8`

### Segmented control tabs

Two-tab toggle below the brand mark, filling the card width:

| Property            | Value                                                                          |
| ------------------- | ------------------------------------------------------------------------------ |
| Layout              | `grid grid-cols-2` (1fr 1fr)                                                   |
| Container bg        | `bg-surface-border/10` (or a subtle dark surface to distinguish from the card) |
| Container padding   | `p-1`                                                                          |
| Border radius       | `rounded-lg`                                                                   |
| Tab text (inactive) | `text-muted text-sm font-medium`                                               |
| Tab text (active)   | `text-primary text-sm font-medium`                                             |
| Active tab bg       | `bg-surface`                                                                   |
| Active tab shadow   | `shadow-sm` (subtle inset feel)                                                |
| Transition          | `transition-all duration-200`                                                  |
| Labels              | "Iniciar sesion" and "Crear cuenta"                                            |
| Cursor              | `cursor-pointer` on both tabs                                                  |

- Clicking a tab switches the content below it between LoginForm and RegisterForm.
- No URL hash or query parameter changes on tab switch (client-side state only).

### Content area (below tabs)

- Renders `LoginForm` or `RegisterForm` depending on active tab.
- Padding: `pt-6` above the form content.
- No card footer — the form-submit and toggle link live inside each form component.

## State

- `activeTab: 'login' | 'register'` — local state in `AuthPage` (orchestrator component).
- `onAuthSuccess: () => void` — callback passed to both forms, triggers redirect to `/` after successful login/register.

## Redirect behavior

- On mount, if a valid token already exists, redirect to `/` immediately (no flash of auth form).
- On successful login/register, redirect to `/`.

## Dependencies

- `LoginForm` component
- `RegisterForm` component
- `Tabs` component
- `BrandMark` component (optional — can be inline)

## Out of scope

- Dark/light mode toggle
- Remember-me checkbox
- Social login buttons
- Loading skeleton (no async content on initial render)
