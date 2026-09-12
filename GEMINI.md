# Orbit Savings Tracker - Project Rules

1. **Context Contracts**: `useFinance()` exposes raw state arrays (`buckets`, `subscriptions`, `transactions`). Aggregates like `totalAllocated` must be computed in consumer components via `buckets.reduce((sum, b) => sum + b.allocated, 0)` rather than expected directly on the context interface.
2. **Currency Conventions**: Use `currencySymbols[currency]`, where MDL maps to `"MDL "` (with trailing space) instead of `"M"` to prevent confusion with millions or broken characters.
3. **Mobile Layout Constraints**: All top-level cards and containers must specify responsive padding (`p-4 sm:p-6`) and `overflow-hidden` to avoid horizontal scrolling and container boundary clipping on mobile viewports.
4. **Authentication Security & Delivery**: Never leak OTP codes in API response bodies or on-screen DOM chips. All verification must be resolved strictly through `/api/auth/verify-code`, and SMTP connections must always specify explicit timeouts (`connectionTimeout`, `socketTimeout`).
