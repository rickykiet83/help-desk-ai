---
name: Select option text collides with badge/display text
description: When a new select is added whose option labels match existing display text, getByText throws "multiple elements" — switch to getAllByText
type: feedback
---

When a component adds a new `<select>` whose `<option>` text duplicates text already asserted by `getByText` (e.g. a status badge and a status select both showing "Open"), the existing `getByText` call fails with "Found multiple elements". Switch those assertions to `getAllByText(...).length` > 0, or narrow with `within()` if you need to target a specific DOM region.

**Why:** The Status and Category selects added to TicketDetailPage caused "Open" and "Technical Question" to appear both as badge spans and as select options, breaking two pre-existing `getByText` assertions.

**How to apply:** When reviewing tests after adding a select whose option labels match existing text on the page, scan for `getByText` calls that now have multiple matches and update them to `getAllByText` or a more scoped query.
