# Technical Stack Decisions

<aside>
✅

**Status:** Confirmed — 24 Dec 2025

</aside>

## Stack Overview

| Layer | Technology | Why |
| --- | --- | --- |
| **Framework** | Next.js 14 (App Router) | SSR, API routes, aligned with other projects |
| **Language** | TypeScript | Type safety, better DX |
| **Styling** | Tailwind + shadcn/ui | Rapid UI development, consistent design |
| **Database** | PostgreSQL (Neon) | Serverless, scales with Vercel |
| **ORM** | Prisma | Type-safe queries, migrations |
| **Auth** | NextAuth.js | Self-hosted, flexible, already used in Total View |
| **Payments** | Stripe | Industry standard, Checkout + Billing Portal |
| **Video** | Mux | HLS streaming, signed URLs, analytics |
| **Email** | Mailgun | Reliable delivery, good pricing, templates |
| **Analytics** | Custom events | Own the data, simple table-based tracking |
| **Deployment** | Vercel | Zero-config, edge functions, preview deploys |

---

## 1. Authentication — NextAuth.js

### Why NextAuth

- Already used in Total View AI — pattern familiarity
- Self-hosted — no vendor lock-in, no per-user pricing
- Flexible providers — start with email/password + Google, add more later
- Database sessions — full control over session data

### Configuration

```tsx
// Providers
- Email (magic link or credentials)
- Google OAuth

// Session strategy
- Database sessions (not JWT) — allows revocation

// Callbacks
- signIn: Create user record, trigger welcome email
- session: Attach user role + subscription status
```

### User Model Extensions

```tsx
User {
  id
  email
  name
  role: "USER" | "ADMIN"
  onboardingComplete: boolean
  createdAt
  updatedAt
}
```

### Protected Routes

| Route Pattern | Access |
| --- | --- |
| `/` | Public |
| `/auth/*` | Public |
| `/dashboard/*` | Authenticated |
| `/course/*` | Authenticated (Video 1 free, rest requires subscription) |
| `/admin/*` | Admin only |

---

## 2. Email — Mailgun

### Why Mailgun

- Reliable deliverability
- Good free tier (1,000 emails/month for 3 months, then pay-as-you-go)
- Simple API — `mailgun.js` SDK
- Template support with variables
- Webhook support for bounces/complaints

### Implementation

```tsx
// Email service abstraction
interface EmailService {
  send(to: string, template: string, data: object): Promise<void>
  sendBatch(emails: BatchEmail[]): Promise<void>
}

// Templates stored in code or Mailgun dashboard
const templates = {
  WELCOME: 'welcome',
  ABANDONMENT_1: 'abandonment-1',
  ABANDONMENT_2: 'abandonment-2',
  ABANDONMENT_3: 'abandonment-3',
  MODULE_COMPLETE: 'module-complete',
  INACTIVE_NUDGE: 'inactive-nudge',
  PAYMENT_FAILED: 'payment-failed',
  RENEWAL_REMINDER: 'renewal-reminder'
}
```

### Email Queue Strategy

- **Immediate emails** (welcome, payment failed): Send directly via API
- **Scheduled emails** (abandonment, nudges): Cron job checks `email_queue` table
- **Unsubscribe handling**: Store preference in user record, check before sending

---

## 3. Analytics — Custom Events

### Why Custom

- Own the data — no third-party dependency
- Simple — just a database table
- Queryable — SQL for any analysis
- No cost — included in existing DB
- Privacy-friendly — no external tracking pixels

### Implementation

```tsx
// Event tracking table
Event {
  id
  userId (nullable for anonymous)
  sessionId
  event: string
  properties: JSON
  createdAt
}

// Client-side helper
track('video_1_completed', { lessonId: '...' })

// Server-side helper (for sensitive events)
trackServer(userId, 'subscription_started', { plan: 'annual' })
```

### Events Schema

| Event | Properties |
| --- | --- |
| `signup_started` | `{}` |
| `signup_completed` | `{ method: 'email' \ |
| `onboarding_completed` | `{ userType, experience }` |
| `video_1_started` | `{ lessonId }` |
| `video_1_completed` | `{ lessonId, watchTimeSeconds }` |
| `paywall_viewed` | `{}` |
| `subscription_started` | `{ plan: 'monthly' \ |
| `lesson_started` | `{ lessonId, moduleId }` |
| `lesson_completed` | `{ lessonId, moduleId }` |
| `module_completed` | `{ moduleId }` |
| `course_completed` | `{}` |
| `subscription_cancelled` | `{ reason? }` |
| `subscription_renewed` | `{ plan }` |

### Admin Dashboard Queries

```sql
-- Conversion funnel
SELECT 
  COUNT(*) FILTER (WHERE event = 'signup_completed') as signups,
  COUNT(*) FILTER (WHERE event = 'video_1_completed') as activated,
  COUNT(*) FILTER (WHERE event = 'subscription_started') as converted
FROM events
WHERE created_at > NOW() - INTERVAL '30 days';

-- MRR calculation
SELECT SUM(amount) FROM subscriptions WHERE status = 'active';
```

---

## 4. Video — Mux

### Why Mux

- HLS adaptive streaming (works on all devices)
- Signed URLs for content protection
- Built-in analytics (watch time, quality)
- Simple upload API

### Configuration

```tsx
// Upload flow (admin)
1. Get upload URL from Mux
2. Direct upload from browser
3. Webhook on 'video.asset.ready'
4. Store playbackId + assetId in database

// Playback flow (user)
1. Generate signed playback URL (expires in 1 hour)
2. Return URL to client
3. Client uses Mux Player or native HLS
```

### Content Protection

| User State | Video Access |
| --- | --- |
| Not logged in | None |
| Logged in, no subscription | Video 1 only (signed URL) |
| Active subscription | All videos (signed URLs) |
| Cancelled/failed payment | Structure visible, videos locked |

---

## 5. Payments — Stripe

### Products & Prices

| Product | Price ID | Amount | Interval |
| --- | --- | --- | --- |
| AI Systems Architect | `price_monthly` | £49 | Monthly |
| AI Systems Architect | `price_annual` | £399 | Yearly |

### Integration Points

```tsx
// Checkout
- Stripe Checkout Session
- Success/cancel redirect URLs
- Metadata: userId

// Webhooks
- checkout.session.completed → Create subscription record
- invoice.paid → Extend access
- invoice.payment_failed → Soft lock + email
- customer.subscription.deleted → Revoke access

// Billing Portal
- Stripe Customer Portal for self-service
- Update payment method
- View invoices
- Cancel subscription
```

### Subscription Model

```tsx
Subscription {
  id
  userId
  stripeCustomerId
  stripeSubscriptionId
  status: 'active' | 'past_due' | 'cancelled' | 'trialing'
  plan: 'monthly' | 'annual'
  currentPeriodEnd
  cancelAtPeriodEnd
  createdAt
  updatedAt
}
```

---

## 6. Rich Text — TipTap

### Why TipTap

- Headless — full control over UI
- ProseMirror-based — robust and extensible
- Markdown-ish — familiar authoring
- Extensions for code blocks, images, embeds

### Admin CMS Features

```tsx
// Extensions
- StarterKit (headings, lists, bold, italic, etc.)
- CodeBlock (syntax highlighting)
- Image (upload to Vercel Blob or Mux)
- Link
- Placeholder
```

### Content Storage

- Store as JSON (TipTap native format)
- Render server-side with `generateHTML()`
- Cacheable — content rarely changes

---

## 7. File Storage

| Content Type | Storage | Reason |
| --- | --- | --- |
| Videos | Mux | Streaming, protection |
| Downloadable assets | Vercel Blob | Simple, integrated |
| User uploads | N/A (not in MVP) | — |

---

## 8. Environment Variables

```bash
# Database
DATABASE_URL=

# Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Mux
MUX_TOKEN_ID=
MUX_TOKEN_SECRET=
MUX_SIGNING_KEY=
MUX_SIGNING_KEY_PRIVATE=

# Mailgun
MAILGUN_API_KEY=
MAILGUN_DOMAIN=

# App
NEXT_PUBLIC_APP_URL=
```

---

## Open Decisions (Minor)

- [ ]  **OAuth providers:** Google only for now, add GitHub later if demand
- [ ]  **Email templates:** Build in Mailgun dashboard or code-based?
- [ ]  **Mux Player vs native:** Test both, decide based on bundle size

---

**Next Step:** Schema Design