---
name: Testing disabled state during in-flight mutation
description: How to hold a mutation in-flight and assert the disabled state, then resolve cleanly
type: feedback
---

To assert that a UI element is disabled while a mutation is pending, hold the mock promise unresolved using a captured `resolve` function, trigger the action, assert disabled, then resolve to prevent state-update leaks into subsequent tests.

```ts
let resolvePatch!: () => void;
mockAxiosInstance.patch.mockReturnValue(
  new Promise<void>((resolve) => {
    resolvePatch = resolve;
  }),
);

// trigger the mutation without awaiting
await userEvent.selectOptions(select, "agent-1");

// assert disabled mid-flight
await waitFor(() => expect(select).toBeDisabled());

// resolve and wait for it to settle
resolvePatch();
await waitFor(() => expect(select).not.toBeDisabled());
```

**Why:** If the promise is never resolved, React state updates triggered by `onSuccess`/`onError` happen after the test ends, causing "act()" warnings and potential cross-test contamination.

**How to apply:** Use this pattern for any test that checks `disabled`, spinner, or loading state tied to a mutation's `isPending` flag.
