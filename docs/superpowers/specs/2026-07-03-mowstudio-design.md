# MowStudio — Product and System Design Specification

**Status:** Ready for user review  
**Date:** 2026-07-03  
**Product timezone:** `Asia/Ho_Chi_Minh`  
**Primary language:** Vietnamese  
**Related diagrams:** [`mowstudio-runtime-architecture.svg`](../../../mowstudio-runtime-architecture.svg), [`mowstudio-booking-flow.svg`](../../../mowstudio-booking-flow.svg), [`mowstudio-vm-deployment.svg`](../../../mowstudio-vm-deployment.svg)

## 1. Purpose

MowStudio is an end-to-end creative-studio booking web application. It must be credible as a full-stack intern portfolio project while remaining small enough to finish, explain, test, and deploy. The first release supports browsing studio rooms and services, finding availability, creating a single-service booking, paying a 30% deposit with SePay/VietQR, and managing the booking from customer and admin views.

The design deliberately uses a modular monolith. It demonstrates meaningful business logic, concurrency control, payments, role-based access, integration testing, observability, and CI/CD without introducing distributed-system complexity before it is useful.

## 2. Goals and success criteria

### 2.1 MVP goals

- A visitor can understand the three studio offerings and book one service through a five-step wizard.
- A guest can complete a booking without creating an account.
- A registered customer can see bookings associated with their account and claim eligible earlier guest bookings.
- Availability reflects room working hours, service duration, service buffer, blocked slots, active holds, and blocking bookings.
- Concurrent requests cannot create overlapping bookings for the same room.
- A customer pays a 30% deposit through SePay/VietQR; webhook processing is authenticated and idempotent.
- `ROOM_ONLY` and `ASSISTED` bookings follow distinct post-payment confirmation rules.
- Admins can manage bookings, rooms, services, schedules, blocked slots, and payment/refund records.
- Critical journeys are covered by unit, PostgreSQL integration, and Playwright E2E tests.
- Production exposes useful error, tracing, structured-log, health, readiness, and release metadata.

### 2.2 Portfolio success

The repository should make the following engineering decisions easy to demonstrate in a CV review or interview:

- feature-module boundaries in a Next.js modular monolith;
- business logic isolated in services and persistence isolated in repositories;
- server-authoritative validation and pricing;
- PostgreSQL transaction-level advisory locking for booking concurrency;
- a provider-neutral payment boundary with an actual SePay adapter;
- RBAC and negative authorization tests;
- automated quality gates and repeatable deployment;
- pragmatic phasing from managed hosting to a containerized VM.

## 3. Scope

### 3.1 MVP

- Public marketing and discovery pages.
- Three rooms: Photo Studio, Voice/Podcast Booth, Music Studio.
- Services attached to exactly one room.
- Service booking type: `ROOM_ONLY` or `ASSISTED`.
- One service per booking; no cart or package composition.
- Five-step booking wizard.
- Guest and authenticated customer booking.
- Supabase email/password and Google authentication.
- Customer booking list/detail and cancellation.
- Admin booking, calendar, room, service, schedule, blocked-slot, and payment screens.
- SePay/VietQR deposit payment.
- Transactional emails for booking created, payment success, confirmed, and cancelled.
- Sentry, JSON logs, request correlation, health/readiness checks, uptime monitoring, and release SHA.
- GitHub Actions and Vercel Preview/Production deployment.

### 3.2 Explicitly deferred

- Memberships, discounts, vouchers, carts, combos, and multi-service bookings.
- Equipment inventory and equipment-level availability.
- Staff selection and staff-level availability.
- Automated refunds.
- Stripe, except for preserving a provider interface that can support it later.
- Vietnamese/English i18n and a mobile/Flutter app.
- Production 3D booking interactions; 3D is limited to a later marketing-page polish phase.
- Jenkins, Kubernetes, microservices, Grafana, Prometheus, and OpenTelemetry in the MVP.

## 4. Users and authorization

### 4.1 Roles

- **Guest:** browse, query availability, create and pay for a booking, and open the payment/confirmation experience using a high-entropy booking access token stored only as a hash in the database.
- **CUSTOMER:** all guest capabilities plus account booking history, booking detail, cancellation when eligible, and guest-booking claim.
- **ADMIN:** all operational screens and actions, including assisted-booking confirmation, schedule management, blocked slots, manual refund tracking, and audit access where exposed.

RBAC is enforced on the server. Hiding controls in the client is only a usability measure, not authorization. Admin routes and mutations require `ADMIN`; customer resources require ownership or `ADMIN`.

### 4.2 Guest booking claim

Guest bookings store normalized customer email and optional phone alongside the immutable booking contact snapshot. After email/password or Google authentication, a customer may claim unowned guest bookings whose normalized email matches the verified account email. Claiming is an explicit, idempotent server action and writes an audit entry. It never reassigns a booking already owned by another user. A matching but unverified account email is insufficient.

## 5. User experience and information architecture

### 5.1 Routes

**Public and account**

- `/`
- `/studios`
- `/studios/[slug]`
- `/services/[slug]`
- `/booking/[serviceId]`
- `/booking/[id]/payment`
- `/booking/[id]/confirmation`
- `/account/bookings`
- `/account/bookings/[id]`
- `/login`
- `/register`

**Admin**

- `/admin`
- `/admin/bookings`
- `/admin/bookings/calendar`
- `/admin/bookings/[id]`
- `/admin/rooms`
- `/admin/services`
- `/admin/schedule`
- `/admin/blocked-slots`
- `/admin/payments`

**HTTP API**

- `GET /api/availability`
- `POST /api/payments/sepay/webhook`
- `GET /api/health`
- `GET /api/ready`

Other mutations may use typed Server Actions where appropriate. The application must not create API routes merely to mirror internal module calls.

### 5.2 Five-step booking wizard

1. **Dịch vụ:** show the chosen service and room; allow navigation back to discovery.
2. **Ngày & giờ:** choose a local calendar date and one server-returned start slot.
3. **Thông tin:** name, email, phone, and optional note; prefill for signed-in customers.
4. **Xác nhận:** show room, service, local start/end time, pricing snapshot, deposit, remaining balance, cancellation policy, and consent.
5. **Thanh toán:** after atomic booking creation, redirect to the booking payment route with VietQR, transfer content, countdown, and live/polled payment state.

Wizard state can persist client-side for accidental navigation, but price, availability, deposit, timestamps, and booking status are always recomputed and validated by the server on submission. A stale slot produces a clear conflict response and returns the user to step 2 without losing contact details.

### 5.3 UI direction

- Vietnamese copy and `vi-VN` currency/date formatting.
- Functional responsive wireframes before visual polish.
- Next.js Server Components by default; client components only for interactive forms, calendars, countdowns, and later 3D.
- Booking UI remains clear, fast, and two-dimensional.
- A later polish phase may add a lazy-loaded React Three Fiber hero with subtle pointer/scroll response, reduced-motion handling, and a static mobile/low-power fallback.

## 6. Architecture

### 6.1 Runtime shape

MowStudio is one Next.js App Router application deployed initially to Vercel. It talks to Supabase Auth, Supabase PostgreSQL through Prisma, Supabase Storage, SePay, an email provider, and Sentry. The browser never owns business decisions and does not write booking/payment state directly to Supabase tables.

The three root SVG diagrams are explanatory architecture artifacts. The booking sequence diagram is normative for the concurrency/payment flow except where this specification adds the explicit late-webhook and failure behavior below. The VM diagram describes a later deployment phase, not the MVP runtime.

### 6.2 Feature modules

- `auth`: Supabase session integration, role resolution, guards, guest claim.
- `studio-room`: room catalog and room administration.
- `service`: service catalog, duration, buffer, price, and booking type.
- `availability`: schedule composition and slot generation.
- `booking`: booking commands, state transitions, cancellation, ownership.
- `payment`: provider interface, SePay adapter, webhook processing, refund record state.
- `notification`: email intents, delivery, retries/logging.
- `dashboard`: customer/admin read models and presentation queries.
- `observability`: request context, logs, Sentry integration, health/readiness.

Each feature exposes a narrow public surface. Route handlers, Server Actions, and pages call feature application services; services depend on repository interfaces and provider ports; repositories contain Prisma and controlled raw SQL. Cross-feature writes occur through explicit service methods rather than importing another feature's repository.

### 6.3 Dependency rules

- UI/transport → application service → repository/provider.
- Zod schemas validate untrusted inputs at transport boundaries and provider boundaries.
- Domain/application services own authorization-sensitive transitions and invariants.
- Repositories own query details and transaction-aware persistence.
- React components do not import Prisma or payment adapters.
- Provider-specific payloads do not leak into booking domain types.
- Raw SQL is limited to documented, parameterized repository operations requiring PostgreSQL behavior Prisma cannot express safely.

## 7. Domain model

### 7.1 Core entities

| Entity | Responsibility and important data |
|---|---|
| `User` | Local application identity linked to Supabase Auth ID; role `CUSTOMER` or `ADMIN`; normalized verified email. |
| `CustomerProfile` | Name, phone, preferences, and one-to-one link to `User`. |
| `StudioRoom` | Name, slug, description, active flag, display metadata, and timezone (MVP value: `Asia/Ho_Chi_Minh`). |
| `Service` | Room relation, name/slug, `ROOM_ONLY` or `ASSISTED`, duration minutes, buffer minutes, price, currency, active flag. |
| `WorkingHour` | Room, weekday, local opening/closing time, active flag; multiple non-overlapping windows per weekday are allowed. |
| `BlockedSlot` | Room, UTC start/end, reason, creator, timestamps. |
| `Booking` | Ownership/contact snapshot, room/service references and names, schedule snapshot, money snapshot, statuses, hold/cancellation metadata, guest access-token hash. |
| `Payment` | Booking, provider, provider reference, idempotency key, requested/paid amount, currency, status, raw-payload reference or redacted payload, timestamps. |
| `NotificationLog` | Event type, booking/user target, channel, recipient hash/masked value, status, attempt count, provider reference, error summary. |
| `AuditLog` | Actor, action, entity type/id, before/after metadata with sensitive fields redacted, request ID, timestamp. |

Money is stored as integer minor units. For VND, the minor-unit exponent is zero, so `300000` represents ₫300,000. Booking schedule and money fields are immutable snapshots; later edits to a service must not rewrite historical bookings.

### 7.2 Booking fields and enums

Minimum booking snapshots:

- `roomId`, `serviceId`, `roomName`, `serviceName`, `bookingType`;
- `customerName`, normalized `customerEmail`, normalized `customerPhone`, optional note;
- `startTime`, `endTime`, `bufferEndTime`, all UTC;
- `subtotalAmount`, `depositAmount`, `remainingAmount`, `currency`;
- `holdExpiresAt`, `cancelledAt`, `cancellationReason`;
- `bookingStatus`, `paymentStatus`, `refundStatus`;
- optional `userId`, guest access-token hash, created/updated timestamps.

`depositAmount = round(subtotalAmount * 30 / 100)` using integer arithmetic; `remainingAmount = subtotalAmount - depositAmount`. MVP services are priced per booking, not dynamically by slot.

**BookingStatus**

- `PENDING_PAYMENT`: active temporary hold awaiting deposit.
- `PENDING`: deposit paid for an `ASSISTED` service, awaiting admin confirmation.
- `CONFIRMED`: deposit paid and accepted; automatic for `ROOM_ONLY`, admin-driven for `ASSISTED`.
- `CANCELLED`: cancelled by customer/admin or rejected by admin.
- `EXPIRED`: unpaid hold elapsed.
- `COMPLETED`: optional operational close-out after the booked time; it does not affect MVP availability logic.

**PaymentStatus:** `PENDING`, `PAID`, `FAILED`, `EXPIRED`.  
**RefundStatus:** `NONE`, `REQUESTED`, `PROCESSING`, `REFUNDED`, `REJECTED`.

## 8. Availability and time rules

### 8.1 Time representation

- Database instants are UTC.
- Working hours are recurring wall-clock times interpreted in the room timezone.
- Public inputs/outputs use an explicit local date/time or ISO timestamp with offset and are rendered in `Asia/Ho_Chi_Minh`.
- A timezone-aware library performs local-date boundaries and UTC conversion; string slicing and server-local timezone assumptions are forbidden.

### 8.2 Slot generation

For a room, service, and local date:

1. Load the active service and verify it belongs to the requested room.
2. Resolve that weekday's working-hour windows in the room timezone.
3. Generate candidate starts every 15 minutes within each window.
4. Compute `endTime = startTime + service.durationMinutes`.
5. Compute `bufferEndTime = endTime + service.bufferMinutes`.
6. Keep candidates whose full interval `[startTime, bufferEndTime)` lies inside one working window.
7. Remove candidates overlapping a blocked slot or blocking booking interval.
8. Remove starts in the past and starts closer than any configured lead time; MVP lead time is zero, so only past starts are removed.

Intervals are half-open: `[start, bufferEnd)`. Two intervals overlap when `candidateStart < existingBufferEnd && candidateBufferEnd > existingStart`. Thus a booking may begin exactly when the prior booking's buffer ends.

Blocking booking statuses are `PENDING_PAYMENT` with `holdExpiresAt > now`, `PENDING`, and `CONFIRMED`. `CANCELLED`, `EXPIRED`, and `COMPLETED` do not block. Expired holds may be lazily marked `EXPIRED` during reads/writes and also swept by a scheduled job; correctness never depends on the sweep running on time.

### 8.3 Server-authoritative booking creation

Availability results are advisory. On create, the server reloads service/room data, recomputes all snapshots, validates the requested start, and performs the final conflict check in the same transaction that inserts the booking.

## 9. Booking lifecycle and concurrency

### 9.1 Atomic create

Inside a PostgreSQL transaction:

1. Derive a stable advisory-lock key from `roomId` plus the room-local calendar date.
2. Acquire a transaction-level advisory lock with parameterized raw SQL.
3. Re-query blocked slots and blocking bookings that overlap `[startTime, bufferEndTime)`.
4. Reject with a conflict if any overlap exists.
5. Insert a `PENDING_PAYMENT` booking with `holdExpiresAt = transactionNow + 10 minutes` and immutable snapshots.
6. Insert the pending payment intent/record needed to render VietQR.
7. Commit, then enqueue/attempt the booking-created notification outside the transaction.

The same lock convention must be used by any operation that creates or changes a room-blocking interval. Multi-day intervals are outside the MVP because bookings and blocked slots are constrained to a single room-local date; an admin must split a multi-day closure into daily blocked slots.

### 9.2 State transitions

Allowed business transitions are:

- `PENDING_PAYMENT → EXPIRED` when the unpaid hold passes `holdExpiresAt`.
- `PENDING_PAYMENT → CONFIRMED` after valid payment for `ROOM_ONLY`.
- `PENDING_PAYMENT → PENDING` after valid payment for `ASSISTED`.
- `PENDING → CONFIRMED` when an admin accepts an assisted booking.
- `PENDING → CANCELLED` when an admin rejects an assisted booking; refund handling remains manual and is tracked separately.
- `PENDING_PAYMENT | PENDING | CONFIRMED → CANCELLED` through an authorized cancellation that satisfies policy or an admin override.
- `CONFIRMED → COMPLETED` after service delivery, manually or by a later scheduled operation.

Transitions are compare-and-set/idempotent: repeating a successfully applied command returns the current resource without duplicating side effects. Invalid transitions return a domain conflict and create no partial updates.

### 9.3 Cancellation

A customer can cancel their own `PENDING` or `CONFIRMED` booking only when `startTime - now >= 24 hours`. Admins can cancel with an explicit reason at any time. Cancelling stores `cancelledAt`, `cancellationReason`, actor, and an audit entry. If money was paid, cancellation sets `refundStatus = REQUESTED`; the admin records later manual processing through `PROCESSING`, then `REFUNDED` or `REJECTED`. Booking cancellation is not rolled back if refund processing or email delivery fails.

An unpaid `PENDING_PAYMENT` booking may be abandoned and will expire; a customer-facing explicit cancellation can move it directly to `CANCELLED` without a refund request.

## 10. Payments

### 10.1 Provider boundary

`PaymentProvider` supports the application-level capabilities needed by booking:

- create or describe a payment request;
- verify and normalize a webhook;
- map provider events to provider-neutral payment outcomes;
- expose provider references for reconciliation.

The SePay adapter produces VietQR transfer data and verifies webhook authenticity according to SePay's supported credential/signature mechanism. Stripe is deferred and must not shape MVP UI or domain rules.

### 10.2 Webhook processing

- Verify authenticity before parsing an event into a trusted command.
- Validate the normalized payload with Zod.
- Build a provider-scoped idempotency key from the immutable provider event/reference.
- In a transaction, lock the payment/booking rows, insert or detect the event, verify booking reference, currency, and amount, then update `Payment` and `Booking` atomically.
- A duplicate event returns success without repeating transitions, emails, or audit effects.
- The deposit is considered paid only when the cumulative accepted amount for the payment reaches the exact required deposit. Underpayment remains pending for manual reconciliation; overpayment is flagged for admin review and does not change the booking total.
- Respond quickly; notification delivery occurs after the transaction and cannot cause webhook failure.

### 10.3 Late payment after hold expiry

If a valid payment arrives after `holdExpiresAt`, the handler reacquires the same room/date advisory lock and checks current overlap before restoring the booking:

- if the slot is still free, apply the normal paid transition (`CONFIRMED` or `PENDING`);
- if the slot is no longer free, record the payment as `PAID`, leave the booking `EXPIRED`, set `refundStatus = REQUESTED`, flag it for admin reconciliation, and notify the customer that payment requires manual resolution.

This avoids silently losing a real bank transfer while preserving the no-double-booking invariant.

## 11. Notifications and audit

Notification intents are created only after the relevant booking/payment transaction commits. MVP sends email for:

- booking created and payment instructions available;
- deposit payment successful;
- booking confirmed;
- booking cancelled.

Delivery failure is recorded in `NotificationLog`, reported to Sentry when appropriate, and may be retried with bounded attempts. It never rolls back a booking or payment. Idempotency is keyed by booking, notification event type, and causal transition/event so webhook retries do not send duplicates.

Audit logs cover privileged or sensitive changes: assisted confirm/reject, admin cancellation, refund-state changes, room/service/schedule edits, blocked-slot changes, role changes, and guest-booking claim. Audit metadata excludes secrets, raw authentication tokens, full webhook credentials, and unnecessary PII.

## 12. Error handling and security

### 12.1 Error contract

Expected application errors use stable codes and safe Vietnamese messages:

- validation error (`400`);
- unauthenticated (`401`);
- forbidden (`403`);
- resource not found (`404`);
- stale slot, invalid state transition, or idempotency conflict (`409`);
- rate limit (`429`);
- unexpected dependency/server failure (`500`/`503`).

Responses include `requestId` but no stack trace, SQL, secret, or raw provider payload. UI error states preserve recoverable wizard data and offer a concrete next action.

### 12.2 Security requirements

- Server-side RBAC and ownership checks on every protected read/mutation.
- Zod validation at all external boundaries.
- Parameterized queries for all raw SQL.
- Webhook authentication, idempotency, amount/reference verification, and replay-safe transitions.
- High-entropy guest access tokens; only hashes are stored; tokens are scoped to limited booking views/actions.
- CSRF-safe same-site mutation strategy and secure Supabase session cookies.
- Rate limits for availability abuse, booking creation, auth-sensitive actions, and webhook endpoints as appropriate.
- Secrets remain in platform secret stores and are never exposed through `NEXT_PUBLIC_*` unless intentionally public.
- Logs mask email, phone, tokens, payment data, and webhook credentials.
- Uploaded files, if later used for service media, use validated MIME/size and controlled Storage policies.

## 13. Observability and operations

### 13.1 MVP observability

- Sentry error reporting and performance tracing for server and browser paths with PII scrubbing.
- JSON structured server logs with timestamp, level, event, module, request ID, release SHA, and safe entity IDs.
- Request ID accepted from a trusted proxy header or generated at ingress, then propagated through logs, Sentry context, payment processing, notification logs, and audits.
- `/api/health`: liveness only; process responds without checking external dependencies.
- `/api/ready`: bounded PostgreSQL readiness check and release metadata; returns non-success when the app cannot safely serve database-backed traffic.
- External uptime monitoring of production health and a representative public page.
- Deployment release SHA exposed in health metadata and Sentry releases.

### 13.2 Data and migration operations

- Prisma schema and migrations are committed.
- Preview environments use an isolated or explicitly safe database strategy; they never run destructive migrations against production.
- Production deploy runs `prisma migrate deploy` once per release before routing normal traffic to incompatible code.
- Seed data creates the three rooms and representative services/schedules without production credentials or real customer PII.

## 14. Testing strategy

### 14.1 Unit tests — Vitest

- slot generation across multiple working windows;
- 15-minute grid, duration, and buffer boundaries;
- overlap semantics and blocking statuses;
- local-time/UTC conversion;
- pricing/deposit calculation;
- booking state transition matrix;
- cancellation eligibility;
- provider payload normalization and notification idempotency logic.

### 14.2 PostgreSQL integration tests

These run against real PostgreSQL, not SQLite or repository mocks:

- simultaneous booking creation for the same room/time yields exactly one success;
- non-overlapping room/time requests can succeed;
- expired holds stop blocking without relying on the sweeper;
- transaction rollback leaves no partial booking/payment records;
- webhook duplicate/replay processing is idempotent;
- valid payment atomically updates payment and booking;
- late payment with a newly occupied slot triggers manual refund resolution;
- repository raw SQL is correctly parameterized and lock keys are stable.

### 14.3 Playwright E2E

- guest/customer booking → payment simulation/webhook → ROOM_ONLY confirmation → customer status;
- ASSISTED payment → admin confirmation → customer status;
- two clients attempt the same slot and only one obtains it;
- non-admin access to admin UI and mutations is denied;
- eligible customer cancellation and ineligible under-24-hour cancellation;
- guest booking claim after verified sign-in.

External services are represented by controlled test adapters or authenticated test fixtures. At least the concurrency and webhook suites exercise the real database transaction boundaries.

## 15. Delivery phases and dependencies

This is a design-level sequence, not the implementation plan. Detailed milestones, files, tasks, tests, and acceptance criteria will be written only after this specification is approved.

1. **Foundation:** project/tooling, environment validation, Prisma/Supabase integration, core schema, seed data, CI baseline.
2. **Catalog and functional UI:** rooms/services, public routes, admin catalog basics, responsive wireframes.
3. **Availability and booking:** schedules, blocked slots, slot engine, wizard, atomic hold and guest access.
4. **Auth and dashboards:** Supabase providers, profiles, RBAC, ownership, guest claim, customer/admin booking views.
5. **Payments and lifecycle:** provider abstraction, SePay/VietQR, webhook, assisted confirmation, cancellation/refund tracking, notifications.
6. **Quality and production:** integration/E2E depth, Sentry/logging/health, accessibility/performance, Vercel production workflow.
7. **Visual polish:** distinctive visual system and optional lazy 3D marketing hero with fallbacks.
8. **Later DevOps phase:** DigitalOcean Ubuntu VM, Docker, Caddy, GHCR, GitHub Actions SSH deployment, health-check rollback, Cloudflare DNS/domain; optionally OpenTelemetry/Prometheus/Grafana.

Each phase depends on the stable domain/schema decisions of earlier phases. Payment begins only after the booking transaction and state machine are tested. Visual polish begins only after the functional booking journey works. The DigitalOcean credit should be activated roughly two to three months before the intended application window, not during the initial Vercel phase.

## 16. CI/CD and deployment

### 16.1 Initial delivery

GitHub Actions quality gates run formatting/linting, type checking, unit tests, relevant PostgreSQL integration tests, build, and selected E2E tests. Vercel provides Preview deployments and a controlled Production deployment. Production migration is a distinct guarded step using `prisma migrate deploy`.

No Jenkins is used. No MVP requirement depends on a permanently running worker that Vercel cannot support; scheduled expiry cleanup is an optimization and can use a scheduled HTTP job, while transactional checks preserve correctness.

### 16.2 Later VM delivery

The later runtime follows `mowstudio-vm-deployment.svg`: GitHub Actions builds a versioned image, publishes to GHCR, connects to the DigitalOcean Ubuntu VM through narrowly scoped SSH credentials, starts the new version behind Caddy, verifies health/readiness, and rolls back to the prior image on failure. Cloudflare manages DNS/domain edge concerns. Backups, firewalling, automatic security updates, non-root containers, log rotation, and restore testing are required parts of that phase.

## 17. Acceptance criteria for the product design

The implemented MVP is acceptable when:

- all listed public/admin routes have their intended guarded or public behavior;
- a guest can book and pay, and a verified customer can claim and track an eligible guest booking;
- room availability follows documented working-hour, buffer, blocked-slot, hold, and status rules;
- concurrency tests prove that overlapping bookings cannot both succeed;
- payment webhook authentication/idempotency and late-payment behavior are integration-tested;
- ROOM_ONLY and ASSISTED transitions match the state machine;
- customer cancellation honors the 24-hour boundary and records refund/audit state;
- notification failures do not undo domain transactions;
- non-admin denial is covered end to end;
- CI gates pass and a Vercel deployment reports health, readiness, request correlation, Sentry release, and release SHA;
- the repository documents enough operational context for another developer to run, test, migrate, and deploy it without private oral instructions.

## 18. Resolved design decisions

This specification makes the following previously implicit choices explicit:

- Guest booking detail uses a hash-stored high-entropy access token; booking IDs alone are not credentials.
- Guest claim requires a verified email match and is explicit/idempotent.
- Money uses integer minor units; MVP pricing is fixed per service.
- Half-open intervals include the service buffer and permit exact boundary adjacency.
- Active unexpired holds block availability even if the cleanup job has not run.
- Booking and blocked-slot intervals are single local-day in MVP so one room/date advisory lock is sufficient.
- A late real payment is never discarded: it either restores the free slot or enters manual refund resolution.
- Notifications are post-commit, idempotent side effects.
- The initial system has no correctness dependency on background workers.

