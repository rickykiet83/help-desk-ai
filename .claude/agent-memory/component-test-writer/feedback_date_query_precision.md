---
name: Date formatting test — use precise regex to avoid partial matches
description: Lesson from TicketsTable tests: /Jan/i matched both "Jane Smith" and "Jan 15, 2024", causing a multiple-elements error. Use a more specific pattern.
type: feedback
---

When asserting on a formatted date string (e.g. "Jan 15, 2024"), never use a bare abbreviation regex like `/Jan/i` because it will false-match unrelated text (like sender names). Use a pattern that anchors to the full date format instead:

```ts
screen.getByText(/Jan\s+\d+,\s+2024/)
```

**Why:** In the TicketsTable test, `/Jan/i` matched both the "Jane Smith" sender cell and the "Jan 15, 2024" date cell, causing `getByText` to throw a multiple-elements error.

**How to apply:** Any time you write a date-assertion query in a table that also contains user-entered text (names, emails), use a regex that captures the full date shape rather than just the month abbreviation.
