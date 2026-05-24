---
name: Mocking multiple GET endpoints in a single test
description: When a component fetches from multiple URLs, use mockImplementation with URL matching rather than mockResolvedValue
type: feedback
---

When a component fires multiple `GET` requests (e.g. `GET /api/tickets/:id` and `GET /api/agents`), use `mockImplementation` with a URL switch rather than `mockResolvedValue` (which returns the same value for every call).

```ts
mockAxiosInstance.get.mockImplementation((url: string) => {
  if (url === "/api/tickets/1") {
    return Promise.resolve({ data: mockTicket });
  }
  if (url === "/api/agents") {
    return Promise.resolve({ data: { agents: mockAgents } });
  }
  return Promise.reject(new Error(`Unexpected GET ${url}`));
});
```

Set this in `beforeEach` as the default, then override per-test for error scenarios.

**Why:** `mockResolvedValue` always returns the same payload regardless of URL — the second call gets the first endpoint's response shape, causing silent failures.

**How to apply:** Whenever a component page calls `api.get` more than once, always use `mockImplementation` with URL discrimination.
