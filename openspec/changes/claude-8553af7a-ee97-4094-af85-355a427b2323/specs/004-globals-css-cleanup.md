# Spec: globals.css Cleanup

## Change

`claude-8553af7a-ee97-4094-af85-355a427b2323`

## Source file

`apps/frontend/src/app/globals.css`

## Problem

The `:root` block contains 6 CSS variables from a discarded light theme that coexist with the dark theme variables. These light-theme variables:

1. Are unused by any component (registration page used inline styles instead).
2. Conflict with the dark cyan design system.
3. Are still referenced in `tailwind.config.ts`, so removing them requires a coordinated cleanup.

## Current state of `:root` (39 lines)

```
:root {
  --background: #07111f;
  --foreground: #f8fafc;
  --surface: #0f172a;
  --surface-foreground: #e2e8f0;
  --surface-border: rgba(148, 163, 184, 0.2);
  --primary: #22d3ee;
  --primary-foreground: #082f49;
  --muted: #94a3b8;
  --danger: #f87171;

  /* Registration page light theme */
  --bg-secondary: #f5f5f0;
  --bg-card: #ffffff;
  --accent: #7f77dd;
  --accent-hover: #6d65c9;
  --text-secondary: #6b7280;
  --border-subtle: #e5e7eb;
}
```

## Changes

### REMOVE these variables

| Variable                                      | Reason                                  |
| --------------------------------------------- | --------------------------------------- |
| `--bg-secondary: #f5f5f0`                     | Light theme variable, unused            |
| `--bg-card: #ffffff`                          | Light theme variable, unused            |
| `--accent: #7f77dd`                           | Light theme purple accent, unused       |
| `--accent-hover: #6d65c9`                     | Light theme purple accent hover, unused |
| `--text-secondary: #6b7280`                   | Light theme text color, unused          |
| `--border-subtle: #e5e7eb`                    | Light theme border color, unused        |
| Comment `/* Registration page light theme */` | No longer relevant                      |

### ADD these variables (if not already present)

After cleanup and verifying DESIGN.md tokens, add any palette tokens listed in DESIGN.md section 2 that are missing from `:root`. At minimum, the design-intent tokens used by the new auth components are:

| Variable             | Value     | Used by                                                 |
| -------------------- | --------- | ------------------------------------------------------- |
| `--surface-elevated` | `#1e293b` | Active tab state, elevated card surfaces                |
| `--success`          | `#34d399` | Password strength meter (score 3-4), success indicators |
| `--warning`          | `#fbbf24` | Password strength meter (score 2), warning indicators   |

Note: If DESIGN.md defines additional tokens (e.g., `--brand`, `--ring`, `--glow`, `--danger-foreground`, `--radius-*`, `--font-*`), add those as well. The spec above covers only the tokens strictly required by the auth components.

### VERIFY no removed variables are referenced

After removing the 6 variables, verify:

1. No `var(--bg-secondary)` in any `.css` file under `apps/frontend/src/`.
2. No `var(--bg-card)` in any `.css` file under `apps/frontend/src/`.
3. No `var(--accent)` in any `.css` file under `apps/frontend/src/`.
4. No `var(--accent-hover)` in any `.css` file under `apps/frontend/src/`.
5. No `var(--text-secondary)` in any `.css` file under `apps/frontend/src/`.
6. No `var(--border-subtle)` in any `.css` file under `apps/frontend/src/`.

### UPDATE tailwind.config.ts

Remove the corresponding color mappings in the Tailwind config:

```diff
- 'bg-secondary': 'var(--bg-secondary)',
- 'bg-card': 'var(--bg-card)',
- accent: 'var(--accent)',
- 'accent-hover': 'var(--accent-hover)',
- 'text-secondary': 'var(--text-secondary)',
- 'border-subtle': 'var(--border-subtle)',
```

Add the new color mappings:

```diff
+ 'surface-elevated': 'var(--surface-elevated)',
+ success: 'var(--success)',
+ warning: 'var(--warning)',
```

## Result after cleanup

`globals.css` `:root` should contain only:

```
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

Plus any additional tokens from DESIGN.md beyond this minimal set.

## Verification checklist

- [ ] `--bg-secondary`, `--bg-card`, `--accent`, `--accent-hover`, `--text-secondary`, `--border-subtle` removed from `:root`
- [ ] No remaining CSS references these removed variables
- [ ] `tailwind.config.ts` color mappings for removed variables are deleted
- [ ] `--surface-elevated`, `--success`, `--warning` added to `:root`
- [ ] `tailwind.config.ts` has mappings for the new tokens
- [ ] DESIGN.md section 2 palette tokens are all present in `:root`
