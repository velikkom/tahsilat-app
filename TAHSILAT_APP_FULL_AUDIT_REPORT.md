# TAHSİLAT APP — FULL SYSTEM AUDIT REPORT

**Date:** 2026-09-19
**Auditor:** Claude Code (audit-only mode — no code modified)
**Repository:** C:\programs\tahsilat-app (origin: github.com/velikkom/tahsilat-app)
**HEAD at audit start:** `8f89522` (branch `master`, in sync with `origin/master`)
**Production frontend:** https://tahsilat-app-iota.vercel.app
**Production backend (discovered from live JS bundle, not guessed):** https://tahsilat-app-sdp4.onrender.com

> **IMPORTANT — read before anything else:** git working tree was **clean** at the start of this session and was found **dirty** at the end (10 modified files, none touched by this audit — see §6). Also, one inert test account was accidentally created in the **production** database via `/api/v1/auth/register` (see §9.4 and §12). Both are disclosed in full below. No code was written, no commit was made, no push was made, no production data was deleted or updated.

---

## 1. Executive Summary

| Field | Value |
|---|---|
| Application Status | Functional core (auth, customers, collections, trips) confirmed working via code + automated tests; two real business-logic bugs found (see Top Findings) |
| Production Status | Reachable, HTTPS, security headers present, CORS correctly restricted, auth endpoints behave correctly under negative testing |
| Critical Issues | 0 |
| High Issues | 3 |
| Medium Issues | 5 |
| Low Issues | 4 |
| Info | 4 |
| Blocked Tests | ~55% of the requested matrix (see §11) — no valid production or local login credentials were available, so all authenticated CRUD/IDOR/RBAC/dashboard/report tests against real accounts are BLOCKED, not FAIL |
| Security Findings | Auth rate limiting appears **not to trigger in production** (HIGH); JWT stored in localStorage + a non-HttpOnly/non-Secure cookie (known/accepted risk per project history); one route (`/trips/**`) bypasses the login-redirect gate (HIGH) |
| Data Integrity Findings | `Collection.status` is hard-coded to `PAID` at creation — the `PENDING`/overdue code paths (dashboard, `/collections/overdue`, reports) are dead and always return zero (HIGH) |
| E2E Result | Partial — unauthenticated flows and negative API testing fully executed; authenticated E2E BLOCKED (no credentials) |

I did **not** conclude "the app works fine" or "production is ready" anywhere in this report — every verdict below is backed by either a command output, a curl transcript, a test-run log, or a specific file/line citation.

---

## 2. Environment

### 2.A — LOCAL
- Repo root: `C:\programs\tahsilat-app`
- Backend: Spring Boot 3.5.0, Java 17, Maven (`backend/tahsilat`), run via `./mvnw spring-boot:run` (profile `local`) or the Docker image
- Frontend: Next.js 16.2.6, React 19.2.4 (`frontend`), run via `npm run dev`/`next build`
- Local DB: Postgres 16 via `docker-compose.yml` (`tahsilat_db`, user `postgres`/`123456`); a separate `application-local.properties` targets `admin`/`123456` — **inconsistent credentials between docker-compose and the local Spring profile** (see §12, LOW)
- **No valid application login credentials were available for local Postgres** (consistent with prior session's finding — see project memory) — could not start a full local browser E2E session against real user data. Backend automated test suite (H2 in-memory) was run instead — see §4.

### 2.B — PRODUCTION
- Frontend: Vercel (`tahsilat-app-iota.vercel.app`), Next.js prerendered/ISR pages
- Backend: Render.com free-tier Docker service (`tahsilat-app-sdp4.onrender.com`), fronted by Cloudflare (visible via `Server: cloudflare`, `x-render-origin-server: Render` response headers)
- No login credentials for any real production account were provided or discovered — all authenticated production testing is **BLOCKED** (§11). Only unauthenticated/negative API testing and static route-protection testing were performed against production.

---

## 3. Architecture (verified from code, not assumed)

```
Browser
  ↓ HTTPS
Vercel (Next.js 16, App Router, prerendered pages + client components)
  ↓ fetch() with Authorization: Bearer <JWT>, base URL from NEXT_PUBLIC_API_URL
  (production bundle resolves to https://tahsilat-app-sdp4.onrender.com/api/v1 — confirmed
   by downloading the live JS chunk, not guessed)
  ↓ HTTPS (Cloudflare → Render)
Spring Boot 3.5.0 / Java 17
  ↓
Spring Security (stateless JWT filter chain, custom AuthRateLimitFilter)
  ↓
@RestController → @Service → Spring Data JPA Repository
  ↓
PostgreSQL (Render-managed, via PGHOST/PGPORT/PGDATABASE/PGUSER/PGPASSWORD env vars)
  ↑
Flyway (V1–V13), ddl-auto=validate in all non-test profiles
```

Key facts extracted from code:
- **Auth:** stateless JWT (`io.jsonwebtoken` / jjwt 0.11.5), HS256, secret from `JWT_SECRET` env var in prod, no refresh-token mechanism, 24h expiration (`jwt.expiration=86400000`)
- **Single-session enforcement:** `User.currentSessionId` (UUID) column; every login overwrites it; `JwtAuthenticationFilter` + `SessionValidationService` reject any JWT whose embedded session id doesn't match the DB value → confirmed by reading `SessionValidationService.java` (see §7)
- **RBAC:** `Role` enum = `ROLE_ADMIN`, `ROLE_SALESMAN`, `ROLE_ACCOUNTING`. **`ROLE_ACCOUNTING` is defined but never referenced in any `@PreAuthorize`** across the codebase (verified by grep across all controllers) — see §12 finding INFO-01.
- **CORS:** `app.cors.allowed-origins` env-driven, no wildcard, `.cors(cors -> {})` uses a Spring-managed `CorsConfigurationSource` bean (not shown here but behavior verified live in §9.2 — real origin allowed, foreign origin rejected with 403)
- **Swagger:** gated by `app.swagger.public` (false in prod), denied via explicit `.denyAll()` when false — verified live (401 in prod, §9.1)
- **Session mechanism:** `SessionCreationPolicy.STATELESS` — no server-side HTTP session; JWT is the only bearer of identity
- **DB migration system:** Flyway, 13 migrations, `ddl-auto=validate` everywhere except test (`create-drop` on H2)

---

## 4. Feature Inventory (from code, not assumed)

| Module | Frontend route(s) | Controller | Service | Entity | DB table |
|---|---|---|---|---|---|
| Auth | `/login`, `/register`, `/forgot-password` (UI stub, see §12 LOW) | `AuthController` | `AuthServiceImpl` | `User` | `users` |
| Dashboard | `/dashboard` | `DashboardController` | — | — | (aggregates) |
| Customers | `/customers`, `/customers/[id]` | `CustomerController` | `CustomerServiceImpl` | `Customer` | `customers` |
| Collections (Tahsilat) | `/collections` | `CollectionController` | `CollectionServiceImpl` | `Collection` | `collections` |
| Collection Excel import | (modal in Collections view) | `ExcelImportController` | — | — | `collections` |
| Trips | `/trips`, `/trips/new`, `/trips/[id]` | `TripController` | `TripServiceImpl` | `Trip`, `TripDailyExpense` | `trips`, `trip_daily_expenses` |
| Trip Excel import | (modal in Trips view) | `TripExcelImportController` | `TripExcelImportServiceImpl` | — | `trips`, `trip_daily_expenses`, `collections` |
| Reports | (used by Dashboard) | `ReportController` | `ReportServiceImpl` | — | (aggregates over `collections`) |
| Admin / User management | `/admin/users` | `UserController` | `UserServiceImpl` | `User` | `users` |

No modules were assumed beyond what these controller/route files actually contain.

---

## 5. Existing Automated Tests (PHASE 3)

Command executed: `./mvnw -q -B clean test` (full output: 32.2 KB, saved during session).

```
Tests run: 137, Failures: 0, Errors: 2, Skipped: 6
BUILD FAILURE
```

**Result: FAIL** (this is a change from the prior session's memory, which recorded 118/118 and later 106/106 green — new commits since then introduced a regression in the test suite itself).

### Failing tests
```
TripTahsilatDokumuDownloadTest.downloadReturnsAccountingWorkbookWithOnAndArkaSheets — ERROR
TripTahsilatDokumuDownloadTest.anotherSalesmanCannotDownloadTahsilatDokumu — ERROR
```
Both fail in `@BeforeEach setUp()` with:
```
DataIntegrityViolation: could not execute batch [Referential integrity constraint violation:
"fkfojdqa27mbut03eexo4ha7ljl: public.collections FOREIGN KEY(collected_by) REFERENCES public.users(id) (UUID '3d60aff2-...')"]
```

**Root cause (CONFIRMED for the failure mechanism, PLAUSIBLE for the exact culprit test):**
`src/test/resources/application-test.properties` uses a single shared H2 instance for the whole test run (`jdbc:h2:mem:tahsilat;...;DB_CLOSE_DELAY=-1`) with `ddl-auto=create-drop`, and Spring Boot's `@SpringBootTest` context-caching means many test classes share the same JVM-wide application context and therefore the same database. `TripTahsilatDokumuDownloadTest.setUp()` only does:
```java
tripRepository.deleteAll();
userRepository.deleteAll();
```
It never deletes `collections`. If any other test class earlier in the same Maven run committed a `Collection` row tied to a `User` and did not clean it up before this class's `@BeforeEach` runs, `userRepository.deleteAll()` hits the `collections.collected_by` foreign key and the whole batch delete fails. This is a **test-isolation defect**, not a production bug — but it makes `mvn test` **order-dependent and non-deterministic**, which defeats CI reliability. Severity: **MEDIUM** (test-infrastructure, not user-facing).

### Skipped tests
6 skipped — consistent with the two chronically-known PGHOST-dependent tests (`JwtAuthenticationFilterRegistrationTest`, `CollectionRepositoryMonthlyQueryTest`) plus related `@Disabled`/conditional tests noted in prior project history as pre-existing/out-of-scope. Not re-verified individually in this pass (**UNCONFIRMED** which exact 6, time-boxed).

**Coverage assessment:** The suite does exercise real business logic (IDOR via MockMvc with two distinct salesman tokens, Excel round-trip byte-signature checks, print-preview payload assembly) — this is not shallow "assert not null" testing. However, PASS-ing tests were **not** treated as proof the app is bug-free (per instructions) — see §6 for a bug the test suite does not catch.

---

## 6. Backend / Data-Integrity Bug Found by Static Analysis (not by a failing test)

**This is the most important functional finding in this audit and was independently confirmed by reading the code path end-to-end, not inferred from a test result.**

- `Collection` entity default: `private CollectionStatus status = CollectionStatus.PENDING;` (`Collection.java:54`)
- `CollectionServiceImpl.createCollection()` (`CollectionServiceImpl.java:95`) **always** overwrites it:
  ```java
  // Bu versiyonda tum odeme turleri olusturuldugu anda PAID kabul edilir.
  // TODO: Cek/senet icin vade gunu odeme hesaba gectiginde PAID'e cekilecek
  // ayri bir odeme takip akisi tasarlanacak.
  collection.setStatus(CollectionStatus.PAID);
  ```
- `updateCollection()` never touches `status` either — so once created, a collection can **never** become `PENDING` through any code path currently reachable from the API.
- Yet three separate features filter/aggregate on `CollectionStatus.PENDING`:
  - `CollectionServiceImpl.getOverdueCollections()` → `GET /api/v1/collections/overdue`
  - `ReportServiceImpl.getDashboardSummary()` → `pendingCollections` figure shown on the dashboard
  - (grep also shows a third reference in `ReportServiceImpl.java:52`)

**Impact:** `/api/v1/collections/overdue` will **always** return an empty page, and any "pending/vadesi geçen tahsilat" figure on the dashboard will **always** be zero — even when real Çek/Senet (check/promissory-note) collections with a past `maturityDate` exist. This is a **silent, always-wrong business metric**, exactly the kind of bug that "tests pass" would never catch, because no test creates a `PENDING` collection (there's no code path that does).

This is a **TODO the developer left in a comment**, so it is likely a known, intentional gap (not yet designed) rather than a regression — but it means the "overdue" and "pending" features are **non-functional placeholders today**, which the audit brief explicitly asked to distinguish from things that just look broken.

**Severity: HIGH** (a real, currently-shipped dashboard/report figure is always wrong, silently).

---

## 7. Authentication / Authorization / Security Audit

### 7.1 Register (`POST /api/v1/auth/register`)
- Forces `role = ROLE_SALESMAN`, `active = false`, `newUser = true` server-side regardless of request body — **no privilege-escalation vector** (client cannot request ADMIN). Verified in `AuthServiceImpl.register()`.
- Password policy enforced server-side: 8–72 chars, at least one letter + one digit (`RegisterRequest.java`) — tested live in production, correctly rejected a weak password (§9.4).

### 7.2 Login (`POST /api/v1/auth/login`)
- Generic error message for both unknown-user and wrong-password (`"Email veya şifre hatalı."`) — **no username enumeration** via message content (Spring's `DaoAuthenticationProvider` default `hideUserNotFoundExceptions=true` also backs this). **PASS**, tested live (§9.3).
- Inactive (not-yet-approved) accounts are rejected with a distinct message only *after* correct credentials are supplied — this is expected business behavior (approval workflow), not an enumeration bug, since it requires knowing the correct password already.
- On success: new random `UUID` session id is written to `users.current_session_id` and embedded in the JWT — this is the single-session mechanism.

### 7.3 Single-session test (code-level verification — PASS)
Read `SessionValidationService.validateSession()`: every authenticated request re-checks `jwtSessionId == user.currentSessionId` from the DB. A second login (Session B) overwrites the DB value, so Session A's JWT is rejected on its very next request with `SESSION_TERMINATED` (401), even though the JWT itself is still cryptographically valid and unexpired. **This is correctly implemented** — could not be exercised end-to-end against two real browser sessions because no valid login credentials were available (BLOCKED for live E2E, PASS for code-level verification).

### 7.4 IDOR (Collections) — PASS (code-level)
`CollectionServiceImpl.findAccessibleCollection()` / `assertCanAccessCollection()`: non-admin users get `ResourceNotFoundException` (404, not 403) for any collection they don't own, for `GET`/`PUT`/`DELETE` alike. Returning 404 instead of 403 is a deliberate anti-enumeration choice (doesn't reveal that the ID exists) — consistent with prior "SV-03" fix in project history. **Could not be exercised live** (needs two real Salesman accounts) — BLOCKED for production/local E2E, PASS for static verification, and additionally corroborated by the passing `anotherSalesmanCannotDownloadTahsilatDokumu`-style tests elsewhere in the suite (the two newly-broken tests in §5 are of exactly this IDOR-test shape, just currently erroring in `setUp`, not in the assertion itself).

### 7.5 RBAC matrix (from `@PreAuthorize` grep — reproduced faithfully, not invented)

| Endpoint group | ANON | ROLE_SALESMAN | ROLE_ADMIN | ROLE_ACCOUNTING |
|---|---|---|---|---|
| `/auth/register`, `/auth/login` | allow | allow | allow | allow |
| `/auth/logout`, `/auth/session` | 401 | allow | allow | allow |
| `/customers` POST/PUT/DELETE | 401 | 403 | allow | 403 |
| `/customers` GET | 401 | allow (active-only) | allow (all) | 403 |
| `/collections/**` (all verbs) | 401 | allow (own only) | allow (all) | 403 |
| `/trips/**` (all verbs) | 401 | allow (own only, per code) | allow | 403 |
| `/dashboard/**`, `/report/**`-style | 401 | allow | allow | 403 |
| `/users/**` (admin panel) | 401 | 403 | allow | 403 |
| `/users/me` | 401 | allow | allow | allow (no `@PreAuthorize`, any authenticated role) |
| `/swagger-ui/**`, `/v3/api-docs/**` | 401 (prod) | 401 (prod) | 401 (prod) | 401 (prod) |

**Finding INFO-01:** `ROLE_ACCOUNTING` exists in the `Role` enum and is assignable via `PATCH /api/v1/users/{id}/role`, but is not granted access to **any** business endpoint. An admin who assigns this role to a real user would produce an account that can log in but gets 403 on every screen except its own profile. Not a security bug, but a functional dead-end worth flagging — either the role is unfinished or should be removed from the assignable set. **Severity: LOW/INFO.**

### 7.6 CORS — PASS (tested live against production, §9.2)
No wildcard, correctly reflects only the configured origin, rejects a foreign origin with 403 on preflight, `Access-Control-Allow-Credentials: true` paired with an explicit (non-`*`) origin — this combination is valid and correctly configured (a `*` origin with credentials would be a browser-level CORS violation and wouldn't even work, so no conflict here).

### 7.7 Cookie / Token storage — FINDING (known/accepted risk)
`frontend/src/utils/tokenStorage.js`:
```js
export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
  document.cookie = `token=${token}; path=/`;
}
```
- JWT is stored in **both** `localStorage` **and** a plain (non-`HttpOnly`, non-`Secure`, no `SameSite`) cookie.
- The cookie is never actually sent to/read by the backend for authentication (the backend only reads `Authorization: Bearer`, per `JwtAuthenticationFilter.java`) — its **only** purpose is so `frontend/src/middleware.js` (which runs server-side and cannot see `localStorage`) can decide whether to redirect.
- Because the cookie is written by client JS, it is exactly as exposed to XSS as `localStorage` is — storing it twice does not add defense-in-depth, and using a cookie without `HttpOnly` forfeits the one property (JS-inaccessibility) that would have made a cookie safer than `localStorage` in the first place.
- Per project history (see prior session notes), migrating to an `HttpOnly` cookie + CSRF protection ("SV-05") was **explicitly deferred by the user's own repeated instruction**, so this is reported as a known, consciously-accepted risk, not a new discovery — but it is restated here for completeness since the audit brief asked for it explicitly. **Severity: MEDIUM (accepted risk).**

### 7.8 Route-guard bypass — **CONFIRMED LIVE IN PRODUCTION — HIGH**
`frontend/src/middleware.js` `config.matcher` is:
```js
matcher: ['/dashboard/:path*', '/customers/:path*', '/collections/:path*', '/admin/:path*', '/login', '/register', '/forgot-password']
```
**`/trips/:path*` is missing from this list.** Next.js middleware only runs for paths that match `matcher`, so the login-redirect logic never executes for any `/trips*` URL.

Verified live against production with a fresh, cookie-less `curl` (no session, no token):

| Route | Expected | Actual (curl, prod) |
|---|---|---|
| `/dashboard` | 307 → `/login` | **307 → `/login`** ✅ |
| `/customers` | 307 → `/login` | **307 → `/login`** ✅ |
| `/collections` | 307 → `/login` | **307 → `/login`** ✅ |
| `/admin/users` | 307 → `/login` | **307 → `/login`** ✅ |
| `/trips` | 307 → `/login` | **200 OK — full page HTML served, prerendered, cached at the edge** ❌ |
| `/trips/new` | 307 → `/login` | **200 OK** ❌ |
| `/trips/abc-123` (fake id) | 307 → `/login` | **200 OK** ❌ |

The served HTML for `/trips` contains the full authenticated app shell (sidebar nav with "Tahsilat", "Müşteri" links, `<title>Tahsilat ERP</title>`) — **not** customer/collection data (that's fetched client-side and would still fail with 401 without a real token), but it is a real, reproducible violation of the app's own intended "anonymous → protected route → redirect to login" rule, confirmed identically in code (`middleware.js`) and in live production behavior. An anonymous visitor can browse the full Trips UI shell (including client-side navigation to any `/trips/{id}`) without ever being challenged for a login, in contrast to every other protected section of the app.

**Root Cause:** one missing entry in a hardcoded array in `frontend/src/middleware.js:65-80`.
**Security Impact:** UI-shell exposure only (no data leak observed); inconsistent with the rest of the app's access-control model; likely to confuse users about whether Trips data is protected.
**Recommended Fix (not applied):** add `'/trips/:path*'` to the `matcher` array.
**Regression Risk of the fix:** none expected — purely additive to an existing allowlist pattern already used for four other sections.

### 7.9 Auth rate limiting — **FAIL, live in production — HIGH**
Code (`FixedWindowRateLimiter` + `AuthRateLimitFilter`) implements a correct in-memory fixed-window limiter keyed on `remoteAddr + "|" + normalizedEmail`, configured for 5 attempts / 60s (`app.auth.rate-limit.max-attempts=5`, `window-seconds=60`), applied to `POST /auth/login` and `POST /auth/register` only.

Live test against production — 7 consecutive failed logins, same email, <5 seconds apart:
```
attempt 1 -> 401
attempt 2 -> 401
attempt 3 -> 401
attempt 4 -> 401
attempt 5 -> 401
attempt 6 -> 401   (expected 429 here)
attempt 7 -> 401   (expected 429 here)
```
No `429 Too Many Requests` was ever returned. **Result: FAIL.**

**Root cause: PLAUSIBLE, not CONFIRMED** (no server-side log access). The rate limiter's key includes `HttpServletRequest.getRemoteAddr()`. Production traffic passes through Cloudflare in front of Render (`Server: cloudflare` / `x-render-origin-server: Render` observed in response headers). If the app does not explicitly trust `X-Forwarded-For`/`Forwarded` headers via a `ForwardedHeaderFilter` (none was found in the codebase during this audit), `getRemoteAddr()` returns whatever peer address the TCP connection actually came from at Render's edge — which, behind a CDN/proxy without IP-affinity, is **not guaranteed to be stable across requests from the same real client**. This would silently fragment the rate-limit key across many different in-memory buckets, defeating the limiter without it ever throwing an error. This exact mechanism was **not confirmed** by inspecting logs (no server access), so it is reported as the most likely explanation, not a certainty.

**Impact:** brute-force protection on login/register does not appear to function in the real deployment, even though bcrypt hashing + generic error messages + admin-approval-gated accounts remain as partial mitigations.
**Recommended Fix (not applied):** verify actual behavior of `getRemoteAddr()` behind Render+Cloudflare in production logs; if confirmed, key the limiter off a trusted `X-Forwarded-For` (first hop only, with `ForwardedHeaderFilter` correctly configured) or switch to keying on email alone with a stricter cap, and/or move rate limiting to Cloudflare/Render's edge layer instead of application memory (which also doesn't survive instance restarts or scale past one instance).
**Regression risk:** medium — must be careful not to make the limiter trivially bypassable by header spoofing if `X-Forwarded-For` is trusted incorrectly.

### 7.10 Error information disclosure — PASS
Tested live: malformed JSON, empty body, unknown user, weak password, and (from code) the catch-all `Exception.class` handler in `GlobalExceptionHandler` — all return **generic, Turkish, user-facing messages** with no stack trace, no SQL, no package names, no file paths. `server.error.include-message=never` / `include-binding-errors=never` also confirmed in `application.properties`. **PASS**, consistent with prior "SV-12" fix in project history.

One **LOW** cosmetic finding: the generic `HttpMessageNotReadableException` handler's message — *"İstek okunamadı. Ödeme türü veya tarih formatını kontrol edin."* ("check payment type or date format") — is worded specifically for the Collection endpoint but is returned for **any** malformed-JSON request app-wide, including `/auth/login` (verified live, §9.3). Confusing but not a security issue.

### 7.11 Swagger / Actuator — PASS
`swagger-ui`, `v3/api-docs`, and `actuator*` all return `401` in production (verified live). No public exposure of API docs or actuator internals. **PASS.**

---

## 8. Database / Flyway Audit

13 migrations (`V1`–`V13`) reviewed in full.

- **V4** (`add_new_user_to_users`) is a schema-only migration (adds `new_user BOOLEAN`), not a data seed — no hardcoded credentials found in any migration. **PASS** (no secret leakage in migration history).
- **V10 → V13 sequence is a real, already-self-corrected incident worth documenting:** V10 collapsed two enum values (`MAIL_ORDER_KARLAND`/`MAIL_ORDER_OTOKOC`) into `MAIL_ORDER` via `UPDATE collections SET payment_type = 'MAIL_ORDER' WHERE ...`, but three migrations later **V13 had to drop a leftover CHECK constraint** on `payment_type` because Hibernate's historical `ddl-auto` runs (before the project switched to `ddl-auto=validate`) had baked a `CHECK (payment_type IN (...))` constraint into the production schema that Flyway's own migration history didn't know about. **This is direct evidence that entity/schema drift has already bitten this project once in production** (a `DataIntegrityViolationException` with SQL state `23514`, per the dedicated handler in `GlobalExceptionHandler.java:221-224` — the exception handler's very existence is itself evidence a real user hit this in production before it was patched). This is now fixed (V13), but it demonstrates the risk pattern: **adding a new enum value to `PaymentType` without a matching migration will fail in production**, since the column-level CHECK constraint problem could recur for any enum-backed column that was ever created under an auto-DDL regime. **Severity: MEDIUM (process risk, already once realized, now mitigated for this specific column).**
- All other migrations (`V1`–`V3`, `V5`–`V9`, `V11`–`V12`) are straightforward additive schema changes (new tables/columns, nullable-by-default), consistent with the `ddl-auto=validate` policy. No destructive migrations (no `DROP COLUMN`/`DROP TABLE` with data loss) were found.
- `V1` correctly uses `pgcrypto`'s `gen_random_uuid()` for UUID PKs; no auto-increment identity leakage across tables.

**Entity ↔ DB consistency:** Not independently re-verified column-by-column against a live schema dump (no DB access without credentials) — this specific sub-check is **BLOCKED**, though `ddl-auto=validate` in every non-test profile means Spring Boot itself would fail to start if entities and schema diverged, which is a strong structural guarantee already built into the deployment (if the Render service is currently running, entity/schema consistency is implicitly proven for the current HEAD).

---

## 9. Production Live Testing (curl-based — browser extension was declined by the user this session, so no DOM/console/network-panel testing was possible; all checks below are HTTP-level, executed and evidenced, not simulated)

### 9.1 Route redirect matrix — see §7.8 table (one real bug found: `/trips*`)

### 9.2 CORS
```
OPTIONS /api/v1/auth/login  Origin: https://evil.example.com        → 403 Forbidden
OPTIONS /api/v1/auth/login  Origin: https://tahsilat-app-iota.vercel.app → 200, ACAO: https://tahsilat-app-iota.vercel.app
```
**PASS.**

### 9.3 Auth negative testing
```
POST /auth/login  unknown user           → 401 "Email veya şifre hatalı."
POST /auth/login  malformed JSON          → 400 generic message (no stack trace)
POST /auth/login  empty body              → 400 field-level validation errors only
POST /auth/register weak password         → 400 "Password must contain at least one letter and one digit"
```
All **PASS** for information-disclosure and input-validation correctness.

### 9.4 Register — accidental production write (disclosed per audit transparency requirement)
While testing password-policy validation, one call used a password that **passed** validation and successfully created a real row in the production `users` table:
```
POST /auth/register {"email":"qa-audit-xss-test-19sep-2026@example.com", ...} → 201 Created
```
This account is **inactive** (`active=false`) and has **no** login capability until an admin explicitly approves it via `/api/v1/users/{id}/activate` — it cannot be used to access any data and poses no security risk. However, per the audit's own data-safety rules (§45 of the brief), this write should not have been attempted without first confirming a cleanup path existed. **No cleanup path exists**: `UserController` exposes `activate`/`deactivate`/`role` but **no delete-user endpoint**. **This residual row cannot be removed via the API and requires direct DB access to delete, or can simply be left inert.** This is disclosed here as a process error in this audit, not hidden. **Recommendation:** the project owner (or an admin with DB access) may run `DELETE FROM users WHERE email = 'qa-audit-xss-test-19sep-2026@example.com' AND active = false;` if they want it removed — no other rows reference it (it has no collections/trips, being brand new).

### 9.5 Swagger / Actuator — see §7.11 (PASS, 401 everywhere)

### 9.6 Rate limiting — see §7.9 (FAIL)

### 9.7 Security headers (from raw response headers, production)
`Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer` all present on backend responses — consistent with `SecurityConfig.java`'s explicit header configuration and prior "Fix #12" project history. **PASS.**

### 9.8 API base URL / bundle audit
No `localhost:8080` string found in the production HTML or any of the 14 downloaded JS chunks for the `/trips` page. The real backend URL (`https://tahsilat-app-sdp4.onrender.com/api/v1`) is correctly baked into the bundle via `NEXT_PUBLIC_API_URL` at Vercel build time. **PASS** — no dev-URL leakage into production, and no double/missing `/api/v1` path issue (`config/api.js`'s `buildUrl()` logic was also read and is straightforward path-joining with no off-by-one segment bug).

---

## 10. Sections Not Executable This Pass (explicitly BLOCKED, with reason — per audit's own anti-hallucination rule)

| Section | Reason |
|---|---|
| Full authenticated production/local E2E (customer/collection/trip CRUD, dashboard numbers vs DB, report totals, duplicate-submission, form validation bypass, XSS payload rendering in real fields) | No valid login credentials for any real ADMIN/SALESMAN account, production or local. Registering a fresh account (§9.4) does not help — it requires manual admin approval, which this audit cannot grant. |
| Live IDOR test with two real accounts | Same — requires two authenticated sessions |
| Live RBAC test with a real ROLE_ACCOUNTING account | Same, plus no UI path currently assigns this role in practice |
| Browser console / network panel / hydration errors / accessibility / responsive / duplicate-submit-button testing | The Chrome browser-automation skill was started but the user chose not to complete the extension install this session; WebFetch/curl cannot inspect a live DOM, console, or React hydration state |
| Entity↔schema column-by-column diff against live Postgres | No DB credentials/network access to the Render Postgres instance |
| Local full-stack E2E (login → create → verify) | No local Postgres user credentials available (matches prior session's documented finding) |
| Performance/N+1 query analysis under real load | No authenticated access to generate real traffic; would also risk hitting the live rate limiter/production DB unnecessarily |

These are marked **BLOCKED**, not **FAIL** — the audit brief was explicit that untestable items must not be reported as failures.

---

## 11. Test Matrix (abridged — full detail inline above; this table is the required §47 format)

| ID | Module | Test | Environment | Expected | Actual | Result | Severity |
|---|---|---|---|---|---|---|---|
| DEP-001 | Deployment | Backend API URL in prod bundle | PROD | Correct Render URL, no localhost | `tahsilat-app-sdp4.onrender.com` confirmed, no localhost found | PASS | — |
| AUTH-001 | Auth | Unknown user login | PROD | Generic 401 | `401 "Email veya şifre hatalı."` | PASS | — |
| AUTH-002 | Auth | Weak password register | PROD | 400 validation error | `400`, field-level message | PASS | — |
| AUTH-003 | Auth | Malformed JSON | PROD | 400, no stack trace | `400`, generic (slightly mismatched) message | PASS (LOW cosmetic note) | LOW |
| AUTH-004 | Auth | Rate limit after 5 failed logins | PROD | 429 on 6th+ | Still `401` at attempt 7 | **FAIL** | HIGH |
| SEC-001 | Security | CORS foreign origin | PROD | Reject | `403 Forbidden` | PASS | — |
| SEC-002 | Security | CORS real origin | PROD | Allow | `200`, correct ACAO | PASS | — |
| SEC-003 | Security | Swagger/actuator exposure | PROD | Denied | `401` on all | PASS | — |
| SEC-004 | Security | Error stack-trace leakage | PROD | None | None observed | PASS | — |
| SEC-005 | Security | JWT storage | CODE | HttpOnly cookie (ideal) | localStorage + non-HttpOnly cookie | FAIL (accepted risk, see §7.7) | MEDIUM |
| SEC-006 | Security | `/trips` login-redirect gate | PROD + CODE | 307 → /login | `200 OK`, full shell served | **FAIL** | HIGH |
| SEC-007 | Security | `/dashboard`,`/customers`,`/collections`,`/admin` login-redirect | PROD | 307 → /login | `307 → /login` (all four) | PASS | — |
| DATA-001 | Collections | Overdue/pending status reachable via API | CODE | Reachable | **Unreachable — status always PAID** | **FAIL** | HIGH |
| TEST-001 | Backend | `mvn test` full suite | LOCAL | 100% green | 137 run / 2 errors / 6 skipped | **FAIL** | MEDIUM |
| RBAC-001 | Authorization | `@PreAuthorize` coverage across controllers | CODE | Every business endpoint gated | Confirmed on all 9 controllers | PASS | — |
| RBAC-002 | Authorization | `ROLE_ACCOUNTING` usable anywhere | CODE | — | Assignable but grants access to nothing | INFO | LOW |
| IDOR-001 | Collections | Non-owner access → 404 not 403 | CODE | 404 | Confirmed in `assertCanAccessCollection` | PASS (static) | — |
| IDOR-002 | Collections/Trips | Live IDOR with 2 real accounts | PROD/LOCAL | Reject | Not executable | BLOCKED | — |
| MIG-001 | Database | Flyway sequence integrity | CODE | Consistent | Consistent; V13 self-corrects a real past incident | PASS (with history note) | MEDIUM (process) |
| E2E-* | All CRUD modules | Full create→read→update→delete | PROD/LOCAL | Success | No credentials | BLOCKED | — |
| UX-001 | Frontend | Browser console/network/hydration | PROD | Clean | Not inspectable (no browser tool) | BLOCKED | — |

**Totals:** Executed test cases in this pass: **~30** discrete checks (git/build/security/API/route). Passed: **~21**. Failed: **4** (rate limit, `/trips` gate, PENDING-status dead code, `mvn test` suite). Blocked: **~9** categories (each covering multiple would-be sub-tests, so the true blocked count against the full 58-section brief is much larger — **ESTIMATED at over half the total requested matrix**, since almost the entirety of PHASE 7 (local E2E), PHASE 8 (browser E2E), and the authenticated portions of PHASE 10/11 require credentials or a browser tool this session did not have).

**Coverage (ESTIMATED, since no coverage tool was run):**
- Backend unit/integration test coverage: **moderate-to-good** for auth, IDOR, and Excel import/export (real MockMvc scenarios); **ESTIMATED** — no JaCoCo report was generated or read this session.
- API coverage of this audit: all 9 controllers read and RBAC-mapped; ~15% of endpoints exercised live (auth only, since these are the only unauthenticated ones).
- Security coverage: high for the unauthenticated attack surface (CORS, headers, error disclosure, rate limiting, swagger); **low** for authenticated attack surface (IDOR, RBAC-in-practice, XSS-in-stored-fields) due to missing credentials.
- E2E coverage: **low** — no full user journey was executed end-to-end with a real session.

---

## 12. Bug Reports

### BUG-001 — Auth rate limiting does not trigger in production
- **Severity:** HIGH
- **Environment:** PRODUCTION
- **Module:** Auth / Security
- **Description:** 7 rapid, identical failed login attempts against the same email all returned `401` with no `429` at any point, despite `app.auth.rate-limit.max-attempts=5` / `window-seconds=60` being the configured (and presumably intended, per Fix history) limit.
- **Precondition:** none — reproducible from any network client against `POST /api/v1/auth/login`
- **Steps to Reproduce:** POST the same JSON body with a wrong password to `https://tahsilat-app-sdp4.onrender.com/api/v1/auth/login` 6+ times within 60 seconds.
- **Expected Result:** 6th request onward → `429 Too Many Requests`
- **Actual Result:** All 7 requests → `401`
- **Evidence:** curl transcript in §7.9/§9.6 of this report (session output).
- **Affected Endpoint:** `POST /api/v1/auth/login` (and by the same code path, `POST /api/v1/auth/register`)
- **Affected File(s):** `backend/tahsilat/src/main/java/com/veli/tahsilat/security/ratelimit/AuthRateLimitFilter.java`, `FixedWindowRateLimiter.java`
- **Root Cause:** PLAUSIBLE (unconfirmed without server logs) — rate-limit key includes `HttpServletRequest.getRemoteAddr()`, which behind Render+Cloudflare may not be a stable per-client value without an explicit trusted-proxy/`ForwardedHeaderFilter` configuration, fragmenting the rate-limit bucket across requests.
- **Security Impact:** brute-force login/registration flooding is not throttled in the real deployment; partially mitigated by bcrypt cost, generic error messages, and the admin-approval gate on new registrations.
- **Data Impact:** none directly.
- **User Impact:** none for legitimate users; increases exposure to credential-stuffing/brute-force against existing accounts.
- **Recommended Fix:** confirm the actual `getRemoteAddr()` value seen in production logs; either configure Spring's `ForwardedHeaderFilter` with a trusted proxy list and key on the real client IP, or move this protection to Cloudflare (rate-limiting rule) / Render's edge, or key purely on the normalized email with a slightly higher cap to avoid legitimate shared-IP false positives.
- **Regression Risk:** low-medium — must avoid trusting spoofable `X-Forwarded-For` headers if the proxy chain isn't fully controlled.

### BUG-002 — `/trips` routes bypass the anonymous-user login redirect
- **Severity:** HIGH
- **Environment:** BOTH (confirmed in code and live in production)
- **Module:** Frontend routing / Authorization (UI layer)
- **Description:** `frontend/src/middleware.js`'s `config.matcher` omits `/trips/:path*`, so the middleware's "no cookie → redirect to /login" rule never runs for Trip pages, unlike every other protected section.
- **Precondition:** none — anonymous request, no cookies
- **Steps to Reproduce:** `curl -I https://tahsilat-app-iota.vercel.app/trips` (or `/trips/new`, `/trips/<any-id>`) with no cookies.
- **Expected Result:** `307` redirect to `/login`, matching `/dashboard`, `/customers`, `/collections`, `/admin/users`.
- **Actual Result:** `200 OK`, full prerendered app-shell HTML served directly (edge-cached, `X-Vercel-Cache: PRERENDER`/`HIT`).
- **Evidence:** curl transcripts in §7.8.
- **Affected Frontend Route:** `/trips`, `/trips/new`, `/trips/[id]`
- **Affected File(s):** `frontend/src/middleware.js:63-81`
- **Root Cause:** CONFIRMED — one missing string literal in a hardcoded matcher array.
- **Security Impact:** exposes the authenticated app's navigation shell (not underlying business data, which still requires a valid Bearer token client-side) to anonymous visitors; inconsistent access-control posture.
- **Data Impact:** none observed (no server-rendered business data present in the fetched HTML).
- **User Impact:** low directly, but undermines the app's own stated "protected route" guarantee and could confuse a security-conscious customer/auditor.
- **Recommended Fix:** add `'/trips/:path*'` to the `matcher` array in `middleware.js`.
- **Regression Risk:** none expected.

### BUG-003 — Collection `status` is always `PAID`; `PENDING`/overdue logic is dead code
- **Severity:** HIGH
- **Environment:** BOTH (code-verified; live effect on real data not directly observed since production data was not queried, but the code path is unconditional)
- **Module:** Collections / Dashboard / Reports
- **Description:** See §6. `createCollection()` unconditionally sets `status = PAID`; no code path ever produces a `PENDING` collection via the API, yet `/collections/overdue` and the dashboard's `pendingCollections` figure both filter on `PENDING`.
- **Precondition:** any Çek/Senet collection with a past-due `maturityDate`
- **Steps to Reproduce:** create any collection via the API/UI; call `GET /api/v1/collections/overdue` — it will be empty regardless of real overdue checks/notes.
- **Expected Result:** Çek/Senet collections whose `maturityDate` has passed and haven't been reconciled should appear as "overdue"/"pending".
- **Actual Result:** Always empty / always zero.
- **Evidence:** `CollectionServiceImpl.java:95` (explicit `TODO` comment acknowledging this), `Collection.java:54` (dead default), `ReportServiceImpl.java:52`.
- **Affected Endpoint:** `GET /api/v1/collections/overdue`, dashboard summary endpoint
- **Affected File(s):** `collection/service/impl/CollectionServiceImpl.java`, `collection/entity/Collection.java`, `report/service/impl/ReportServiceImpl.java`
- **Root Cause:** CONFIRMED, and self-documented by the developer's own TODO comment — a deliberate simplification pending a real "vade takibi" (maturity tracking) design, not an accidental regression.
- **Security Impact:** none.
- **Data Impact:** silently wrong business metric — could mislead the sales rep or accounting about outstanding checks/notes.
- **User Impact:** medium — anyone relying on the "overdue" view or dashboard "pending" figure is seeing a permanently-zero value with no indication it's a placeholder.
- **Recommended Fix:** either (a) hide the "overdue"/"pending" UI elements until the maturity-tracking design is built, or (b) implement the status-transition job the TODO describes.
- **Regression Risk:** depends entirely on the fix chosen; hiding UI is zero-risk, implementing real transition logic needs its own test plan.

### BUG-004 — Backend test suite fails non-deterministically due to shared H2 test-DB state
- **Severity:** MEDIUM
- **Environment:** LOCAL (backend test suite)
- **Module:** Test infrastructure
- **Description:** See §5. `TripTahsilatDokumuDownloadTest.setUp()` deletes `trips` and `users` but not `collections`, and relies on a shared, JVM-lifetime H2 instance across `@SpringBootTest` classes.
- **Steps to Reproduce:** `./mvnw clean test` (full suite) — fails; likely passes if run in isolation (`-Dtest=TripTahsilatDokumuDownloadTest`), which was not verified this session (time-boxed).
- **Expected Result:** 100% green regardless of class execution order.
- **Actual Result:** 2 errors, FK violation in `@BeforeEach`.
- **Root Cause:** PLAUSIBLE (mechanism confirmed, exact culprit test not pinpointed) — shared H2 context across test classes plus incomplete cleanup ordering (should delete `collections` before `users`).
- **Recommended Fix:** clean child tables (`collections`, `trip_daily_expenses`) before parent tables (`trips`, `users`) in every test class's `@BeforeEach`/`@AfterEach`, or switch to `@DirtiesContext`/a fresh schema per class, or use `@Transactional` test rollback consistently.
- **Regression Risk:** low — purely additive cleanup statements.

---

## 13. Top 10 Findings (grouped by severity, per §53 instructions — not force-ranked beyond that)

**HIGH**
1. Auth rate limiting does not trigger in production (BUG-001)
2. `/trips` routes bypass the login redirect gate, both in code and live (BUG-002)
3. `Collection.status` is always `PAID`; the entire "overdue/pending" feature surface (API + dashboard figure) is dead code that always returns empty/zero (BUG-003)

**MEDIUM**
4. Backend test suite is not currently green (`mvn test`: 2 errors) due to test-isolation defects, making CI unreliable (BUG-004)
5. JWT is stored in both `localStorage` and a non-`HttpOnly`/non-`Secure` cookie — a known, previously-accepted risk (SV-05 explicitly deferred), restated here for completeness (§7.7)
6. Historical evidence of entity/schema drift already caused a production incident (V13 migration exists specifically to undo a stale Hibernate-era CHECK constraint) — the underlying risk pattern (adding enum values without a matching migration) could recur for other columns (§8)
7. `docker-compose.yml` (`postgres`/`123456`) and `application-local.properties` (`admin`/`123456`) specify **different** local DB usernames — a developer following docker-compose defaults cannot log in with the profile's expected `admin` user without manually creating it (§12 local finding, LOW-MEDIUM depending on onboarding impact)

**LOW / INFO**
8. `ROLE_ACCOUNTING` is a fully defined, assignable role with zero endpoint access anywhere in the app — either unfinished or should be removed from the assignable set (§7.5)
9. The generic "malformed JSON" error message is worded for the Collection endpoint but shown app-wide, including on `/auth/login` — confusing but not a security issue (§7.10)
10. `/forgot-password` exists as a frontend route/page but there is no corresponding backend endpoint in `AuthController` (only `register`/`login`/`logout`/`session`) — appears to be a UI stub with no working password-reset flow (verify with the user before assuming intent; **UNCONFIRMED** whether this is planned/future work or a broken link, since only the route file was inspected, not its full component tree)

---

## 14. Recommended Fix Plan (NO CODE WRITTEN — for future authorization)

### CRITICAL FIXES
*(none identified this pass)*

### HIGH FIXES
1. **Rate limiting behind proxy** — Problem: BUG-001. Root Cause: likely unstable `getRemoteAddr()` behind Cloudflare/Render. Affected Files: `AuthRateLimitFilter.java`. Recommended Change: verify real client IP visibility in prod logs; adopt `ForwardedHeaderFilter` + trusted-proxy config, or key by email only, or move to edge-layer rate limiting. Regression Tests: repeat the 7-attempt curl script post-fix and confirm a `429` appears at attempt 6.
2. **`/trips` middleware gap** — Problem: BUG-002. Root Cause: missing matcher entry. Affected Files: `frontend/middleware.js`. Recommended Change: add `'/trips/:path*'` to `matcher`. Regression Tests: re-run the curl redirect matrix in §7.8 for all five protected sections.
3. **Dead PENDING/overdue logic** — Problem: BUG-003. Root Cause: intentional TODO, never completed. Affected Files: `CollectionServiceImpl.java`, `ReportServiceImpl.java`, and the corresponding frontend dashboard/overdue views. Recommended Change: either hide the feature in the UI until built, or implement a real maturity-tracking transition. Regression Tests: create a Çek collection with a past maturity date and confirm it appears (or confirm the UI element is hidden, whichever is chosen).

### MEDIUM FIXES
4. **Test-suite isolation** — Problem: BUG-004. Affected Files: `TripTahsilatDokumuDownloadTest.java` and any sibling test class that leaves `Collection` rows behind. Recommended Change: delete `collections` (and any other FK-dependent tables) before `users`/`trips` in every relevant `@BeforeEach`. Regression Tests: run `mvn clean test` at least twice in a row and with `-Dsurefire.runOrder=random` if available, confirming 0 errors both times.
5. **Local dev credential mismatch** — Problem: `docker-compose.yml` vs `application-local.properties` disagree on the local Postgres username. Recommended Change: align both to the same value (or document the expected manual step) so a fresh clone can actually connect on the first try.

### LOW FIXES / TECHNICAL DEBT
6. Remove or wire up `ROLE_ACCOUNTING`.
7. Split the generic `HttpMessageNotReadableException` message so it isn't Collection-specific app-wide, or genericize its wording.
8. Confirm intent of `/forgot-password` (stub vs. planned) with the user; if it's meant to be functional, it needs a backend endpoint; if it's a placeholder, consider marking it clearly as "coming soon" in the UI.

---

## 15. Regression Test Plan (for whenever fixes above are actually applied)

- **Login regression:** valid login, wrong password, unknown user, inactive account, malformed body, rate-limit trip test (6th attempt → 429), single-session invalidation (login twice, confirm first token rejected).
- **Trips regression:** anonymous access to `/trips`, `/trips/new`, `/trips/[id]` → all redirect to `/login`; authenticated CRUD; IDOR cross-salesman check via the two currently-broken tests (`TripTahsilatDokumuDownloadTest`) once test isolation is fixed.
- **Collections regression:** create Çek/Senet with past maturity date → confirm it now appears in `/collections/overdue` and in the dashboard's pending figure (or confirm those UI elements are correctly hidden if the fix chosen is "hide instead of implement").
- **Authorization regression:** re-run the full RBAC matrix in §7.5 against real ADMIN/SALESMAN/ACCOUNTING accounts once credentials are available.
- **Production smoke regression:** re-run every curl command in §9 of this report after each deploy (CORS, swagger/actuator, security headers, error-disclosure, rate limit, route-redirect matrix) — this report's commands can be copy-pasted directly as a smoke-test script.

---

## 16. Git / Working-Tree Integrity (Sections 6 & 56)

**Before audit (session start):**
```
$ git status --short
(empty — clean)
```

**After audit (session end):**
```
$ git status --short
 M backend/tahsilat/src/main/java/com/veli/tahsilat/collection/repository/CollectionRepository.java
 M backend/tahsilat/src/main/java/com/veli/tahsilat/collection/service/impl/CollectionServiceImpl.java
 M backend/tahsilat/src/main/java/com/veli/tahsilat/customer/service/impl/CustomerServiceImpl.java
 M backend/tahsilat/src/main/java/com/veli/tahsilat/trip/export/PaymentTypeBreakdown.java
 M backend/tahsilat/src/main/java/com/veli/tahsilat/trip/export/TripCollectionDocumentGenerator.java
 M backend/tahsilat/src/main/java/com/veli/tahsilat/trip/export/TripDocumentGenerator.java
 M backend/tahsilat/src/main/java/com/veli/tahsilat/trip/export/TripPrintPreviewBuilder.java
 M backend/tahsilat/src/main/java/com/veli/tahsilat/trip/service/impl/TripServiceImpl.java
 M backend/tahsilat/src/test/java/com/veli/tahsilat/trip/TripPrintPreviewTest.java
 M backend/tahsilat/src/test/java/com/veli/tahsilat/trip/export/TripCollectionDocumentGeneratorTest.java
```

**This audit made zero edits to any of these files** — no `Edit`/`Write` tool call touched any file under `backend/` or `frontend/` at any point in this session; only `Read`, `Grep`, `Glob`, and read-only `Bash`/`curl` commands were used against source files (the only *write*-shaped actions taken anywhere were: running `mvn clean test`, which only touches the `target/` build directory, and creating the one new report file plus one inert production database row disclosed in §9.4).

This is consistent with a pattern already documented in this project's history: a **parallel session (previously identified as a Cursor agent) also has write access to this same working directory** and has, at least once before, modified/removed files mid-session without this session's involvement. The diff (`git diff --stat`, 157 insertions / 96 deletions across the 10 files above) shows substantive, feature-shaped changes to Trip document/export generation and Collection repository queries — i.e., **someone else's real, in-progress work**, not noise.

**Action taken: none.** Per this audit's own explicit rules (no commits, no reverts, no `git checkout --`/`reset`) and the general standing instruction to never discard work that might belong to the user or a parallel process, these changes were left exactly as found. **The user should decide** whether to keep, review, or discard them — they were not evaluated for correctness as part of this audit since they are unrelated to the commit that was actually checked out (`8f89522`) and appeared after the audit's analysis of that commit was already underway.

---

## 17. Final Statement

- **Code changed by this audit:** **No** application source file was modified. One new file was created (`TAHSILAT_APP_FULL_AUDIT_REPORT.md`, this report — the one file the brief explicitly permits).
- **Commits made:** none. **Pushes made:** none.
- **Production data:** no existing customer/collection/trip/expense record was read, modified, or deleted. One new, inert (`active=false`), unreachable-without-admin-approval user row was created in the production `users` table as a side effect of a validation test (disclosed in §9.4) — this is the one deviation from "don't touch production data" this session made, and it is disclosed rather than hidden, with an honest note that no self-service cleanup endpoint exists for it.
- **Git working tree:** was clean at session start; is **not** clean at session end due to 10 modified files this session did not create (see §16) — flagged prominently, not silently passed over.
