---
name: Router wrapping for useParams components
description: How to wrap components that use useParams in tests so the param resolves correctly
type: feedback
---

Pages that call `useParams` must be rendered inside a `<Routes><Route path=".../:id">` block within a `MemoryRouter`, not just a bare `MemoryRouter`. Without the `<Route>` the param is undefined and queries are skipped due to `enabled: !!id`.

```tsx
function renderPage(ticketId = "1") {
  return renderWithClient(
    <MemoryRouter initialEntries={[`/tickets/${ticketId}`]}>
      <Routes>
        <Route path="/tickets/:id" element={<TicketDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}
```

**Why:** `renderWithClient` only adds `QueryClientProvider`. Router context must be added separately, and the route must match the param pattern.

**How to apply:** Any page component using `useParams` needs this pattern. Plain `MemoryRouter` without a matched `<Route>` leaves all params empty.
