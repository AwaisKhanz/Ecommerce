# 05 · ACCESSIBILITY GUIDELINES

## 1. Target

**WCAG 2.2 Level AA** across the public site and admin panel.

## 2. Non-Negotiables

1. Every interactive element is reachable and operable by **keyboard alone**.
2. Every form input has an **associated label**.
3. **Color contrast** ≥ 4.5:1 for body text, ≥ 3:1 for large text and UI components.
4. Every image has meaningful `alt` text (decorative images use `alt=""`).
5. **Focus** is always visible — never `outline: none` without a replacement.
6. The page works at **400% zoom** and **200% text scaling** without breaking layout.
7. **Motion** respects `prefers-reduced-motion`.

## 3. Semantic HTML First

| Use | Not |
|---|---|
| `<button>` | `<div onClick>` |
| `<a href>` | `<span>` with handler |
| `<nav>`, `<main>`, `<section>`, `<header>`, `<footer>` | `<div class="nav">` |
| `<h1>`–`<h6>` in hierarchy | All `<div>`s |
| `<table>` for tabular data | Flexbox grids |

One `<h1>` per page. Heading levels increment without skipping.

## 4. ARIA Sparingly

Quote Heydon: "No ARIA is better than bad ARIA."

- Use ARIA only when semantic HTML can't express the need
- `aria-label`/`aria-labelledby` for icon-only buttons
- `aria-expanded`, `aria-controls` for disclosure widgets
- `aria-live` for toast announcements
- `aria-current="page"` for active nav items

## 5. Focus Management

- Visible focus rings everywhere (Tailwind `focus-visible:ring-2`)
- Trap focus inside modals and drawers (Radix handles this)
- Return focus to the trigger on close
- Skip-to-main-content link as first focusable element
- Avoid keyboard traps outside modals

```tsx
<a href="#main-content" className="sr-only focus:not-sr-only ...">Skip to content</a>
```

## 6. Forms

- Every input wrapped with `<Label>` linked via `htmlFor`/`id`
- Required fields marked both visually (`*`) and with `aria-required`
- Error messages associated via `aria-describedby`
- Group related inputs with `<fieldset>` + `<legend>`
- Live validation announced via `aria-live="polite"`
- Don't disable submit on invalid form; instead show errors on submit

## 7. Color and Contrast

- Don't convey meaning by color alone (use icon + text + color)
- Tested combos via Stark / Polypane / Chrome devtools
- Brand color (`--accent`) tested against `--bg-page` for AA
- Disabled states still meet 3:1 against background
- Error / success colors paired with icons

## 8. Images

- Product images: `alt` is the product name (without "Image of ...")
- Decorative images: `alt=""`
- Charts/data viz: provide a textual summary below or via `<figcaption>`
- Hero image with overlaid text: ensure overlay scrim guarantees contrast

## 9. Motion & Animation

```css
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Framer Motion respects `useReducedMotion()` hook.

## 10. Internationalization & Direction

- `lang` attribute on `<html>` matches active locale
- `dir="rtl"` for Arabic and other RTL languages
- Test all flows in RTL
- Don't translate user input fields automatically
- Date/number formatting via Intl.* APIs

## 11. Navigation

- Landmark roles via semantic elements (`<nav>`, `<main>`)
- Breadcrumbs on category and product pages with `aria-label="Breadcrumb"`
- Pagination uses `<nav aria-label="Pagination">`
- Mobile menu is a `<dialog>` or properly-trapped drawer

## 12. Modals, Dialogs, Drawers

- Use Radix primitives (handle focus trap, escape close, scroll lock)
- `aria-modal="true"`
- Focus moves to the dialog on open, returns on close
- Click outside closes (with confirmation if form dirty)

## 13. Toasts

- `role="status"` for info, `role="alert"` for errors
- Auto-dismiss with adequate time (≥ 5s)
- Pause on hover/focus
- Provide a close button

## 14. Tables

- Use proper `<thead>`, `<tbody>`, `<th scope="col">`
- For complex data tables in admin, `aria-sort` for current sort column
- Column headers identify each column for screen readers
- Caption summarizes table purpose (visually-hidden if needed)

## 15. Keyboard Shortcuts

- All admin shortcuts documented in a `?` help modal
- None conflict with browser/AT shortcuts
- Esc closes modals, drawers, and dialogs

## 16. Screen Reader Testing

- Test major flows with **NVDA** (Windows + Firefox), **VoiceOver** (macOS + Safari)
- Order placement, product browse, admin login + add product
- Headings convey page structure
- Buttons announce their action
- Forms announce labels and errors

## 17. Tooling

- ESLint plugin `jsx-a11y` (errors, not warnings)
- `@axe-core/playwright` in E2E
- Lighthouse Accessibility ≥ 95
- Browser devtools accessibility tree review on tricky components

## 18. Specific Component A11y Notes

### 18.1 Product Card
- Whole card not clickable; `<a>` wraps only the link area
- "Add to cart" is a separate button with discernible name

### 18.2 Add to Cart Quantity Stepper
- `<input type="number">` with label and `aria-describedby` for stock limit
- + and − buttons have `aria-label`

### 18.3 Filter Panel
- Filters as `<fieldset>` + `<legend>`
- Each filter group has a clear name
- Mobile filters in a drawer with focus trap

### 18.4 Cart Drawer
- `<dialog>` semantics
- Heading inside
- Close button focusable

### 18.5 Status Badges (admin)
- Color + text; never icon-only
- `aria-label` if the visual is iconographic

## 19. Content Guidelines

- Plain language, short sentences
- Avoid jargon in customer-facing copy
- Provide help text on form fields where ambiguous
- Error messages explain what's wrong **and** how to fix it

## 20. Accessibility Statement

A public page at `/accessibility` describes:
- Conformance level
- Known issues + remediation timeline
- How to report issues (email + form)
- Last reviewed date

## 21. Audit Schedule

- Pre-launch: full WCAG 2.2 AA audit, document any exceptions
- Quarterly: re-run automated + manual spot-checks
- On major feature: re-audit affected flow

## 22. Common Pitfalls

- "Read more" links with no context → use `aria-label` to be specific
- Placeholder text used as label → never; placeholders are hints, not labels
- Removing focus rings to "clean up" → never
- Auto-playing media with sound → never
- Drag-and-drop without keyboard alternative → provide keyboard equivalents

## 23. Personas Test

Before launch, mentally walk through the site as:
- Keyboard-only user (no mouse)
- Screen reader user
- Low-vision user at 200% zoom
- Mobile user with shaky connection on 3G
- Cognitively distracted user (impatient, partial attention)

If any persona can't complete an order in under 2 minutes, fix it before launch.
