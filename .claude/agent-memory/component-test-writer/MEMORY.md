# Memory Index

- [Date formatting test — use precise regex](feedback_date_query_precision.md) — `/Jan/i` matches names too; use `/Jan\s+\d+,\s+\d{4}/` for date cells
- [Router wrapping for useParams components](feedback_router_wrapping.md) — useParams pages need full `<MemoryRouter><Routes><Route>` structure, not just MemoryRouter
- [Mocking multiple GET endpoints](feedback_multi_endpoint_axios_mock.md) — use mockImplementation with URL switch when component fires multiple GET requests
- [Testing disabled state during pending mutation](feedback_pending_mutation_test.md) — hold promise with captured resolve, assert disabled, then resolve to avoid state-update leaks
