---
name: Mocking bare axios.post vs instance post
description: Some components use bare axios.post() rather than an axios.create() instance — mock differently
type: feedback
---

When a component calls `axios.post(...)` directly (not via an `axios.create()` instance), the `mockAxiosInstance.post` spy will not intercept the call. Instead, add `post: vi.fn()` directly on the `default` object in the `vi.mock("axios", ...)` factory, and hoist it separately.

```ts
const mockAxiosPost = vi.hoisted(() => vi.fn());

vi.mock("axios", () => ({
  default: {
    create: () => ({ get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() }),
    isAxiosError: (err: unknown): boolean =>
      err instanceof Object && "response" in (err as object),
    post: mockAxiosPost,   // ← intercepts bare axios.post(...)
  },
}));
```

**Why:** `ReplyForm` (and potentially other leaf components) import `axios` directly and call `axios.post(...)` rather than using an `axiosInstance` from `axios.create()`. The `mockAxiosInstance` pattern only captures calls on the created instance.

**How to apply:** Before writing tests for any component, check whether it calls `axios.post/get/patch/delete` on the bare import or on a created instance, then mock accordingly. A component can do both — include both mocks if so.
