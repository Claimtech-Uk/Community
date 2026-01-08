# ARCHITECTURE.md

Copy this entire page content into a file named [`ARCHITECTURE.md`](http://ARCHITECTURE.md) in your project root.

---

# Architecture Decisions

## Overview

Self-hosted course platform replacing Skool. Demonstrates tech-builder credibility.

**Target:** £40k/month revenue (~800 subscribers at £49/month).

## Why Self-Hosted vs SaaS

| Decision | Reasoning |
| --- | --- |
| Own the stack | Demonstrate credibility for AI Systems Architect course |
| No per-user fees | Skool charges per member, self-hosted scales free |
| Full control | Custom paywall, email sequences, analytics |
| Learning asset | Course teaches building — should build the platform |

---

## Authentication: NextAuth.js

**Why NextAuth over Clerk/Auth0:**

- Self-hosted = no vendor lock-in
- No per-user pricing (critical at scale)
- Database sessions allow revocation
- Pattern familiarity from Total View AI project

**Session Strategy:**

- Database sessions, NOT JWT
- Allows immediate revocation
- Can attach subscription status to session

**Providers:**

- Email/password (credentials)
- Google OAuth
- (GitHub later if demand)

---

## Payments: Stripe

**Why Stripe Checkout over custom form:**

- PCI compliance handled
- Built-in fraud detection
- Customer Portal for self-service
- Subscription management included

**Pricing Structure:**

- Monthly: £49/month (4900 pence)
- Annual: £399/year (39900 pence, 2 months free)

**Webhook-First Architecture:**

- NEVER trust redirect success
- All subscription state from webhooks
- Idempotent handlers (webhooks can retry)

---

## Video: Mux

**Why Mux over alternatives:**

- HLS adaptive streaming (all devices)
- Signed URLs for content protection
- Simple upload API with webhooks
- Built-in analytics

**Content Protection:**

- Signed URLs expire after 1 hour
- Generate fresh URL on each lesson load
- No signed URL = no video (even if page renders)

---

## Email: Mailgun

**Why Mailgun over Resend/SendGrid:**

- Proven deliverability
- Good free tier for MVP
- Simple API
- Template support

**Email Strategy:**

- Immediate: Welcome, Payment Failed, Module Complete
- Queued: Abandonment sequence, Inactive nudge, Renewal reminder
- Transactional vs Marketing distinction (opt-out only affects marketing)

---

## Analytics: Custom Events

**Why custom over Mixpanel/Amplitude:**

- Own the data
- No third-party cost
- SQL queryable
- Privacy-friendly

**14 Must-Track Events:**

1. signup_started
2. signup_completed
3. onboarding_completed
4. video_1_started
5. video_1_completed
6. paywall_viewed
7. subscription_started
8. subscription_plan_selected
9. lesson_started
10. lesson_completed
11. module_completed
12. course_completed
13. subscription_cancelled
14. subscription_renewed

---

## Access Control Logic

### hasAccess(user)

1. If `user.accessOverride === true` → **GRANT** (admin override)
2. If `subscription.status === 'ACTIVE'` → **GRANT**
3. If `subscription.status === 'PAST_DUE'` → **GRANT** (grace period)
4. Else → **DENY**

### isModuleUnlocked(user, module)

1. If `module.order === 1` → **UNLOCKED** (always)
2. Find previous published module
3. If previous module complete → **UNLOCKED**
4. Else → **LOCKED**

---

## Content Strategy

**Free Content:**

- Video 1 only (founder intro)
- Marked with `isFree: true` on Lesson
- Available to all authenticated users

**Paid Content:**

- All other videos and lessons
- Requires active subscription OR accessOverride
- Structure visible when locked, content hidden

---

## Future Considerations (Phase 2)

- Community features (currently Discord)
- Team/seat pricing
- PreCursor agent integration
- Certificates/badges
- Multi-course expansion