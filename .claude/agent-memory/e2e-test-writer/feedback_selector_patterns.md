---
name: Selector patterns for Helpdesk UI
description: Playwright selector strategies discovered while testing Helpdesk — field errors, headings, nav elements
type: feedback
---

Use `getByRole('heading', { name: '...', level: 1 })` when a page has multiple heading elements that share the same text (e.g., HomePage renders both h1 "Dashboard" and h2 "Welcome to the Helpdesk dashboard." — strict mode violation without `level`).

**Why:** Playwright strict mode throws if a locator resolves to multiple elements. The HomePage has h1 + h2 that both match `getByRole('heading', { name: 'Dashboard' })`.

**How to apply:** Always use `level` when scoping to a specific heading rank.

---

Field validation errors in the login form are `<p>` elements rendered as direct children of a wrapper `<div>` alongside the `<Label>` and `<Input>`. Use:

```ts
page.locator("div:has(> #email) > p")     // email error
page.locator("div:has(> #password) > p")  // password error
```

**Why:** `input#email ~ p` (CSS sibling) fails because Playwright didn't find the element in some conditions. The `div:has(> #input-id) > p` pattern scopes to the wrapper and is unambiguous.

---

The login form uses `<Input type='email'>`. Browser-native email validation blocks submission when the field contains a string like "not-an-email" — Zod never fires. To test Zod's email error, submit with an **empty** email field (no `required` attribute, so browser allows it; Zod fires "Enter a valid email address").

**Why:** Native browser validation intercepts before React Hook Form / Zod runs, so the `<p>` error element is never rendered.

**How to apply:** In email validation tests, leave the email field empty rather than filling it with a malformed value.
