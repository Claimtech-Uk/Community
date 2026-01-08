# Schema Design

<aside>
✅

**Status:** Confirmed — 24 Dec 2025

</aside>

## Overview

Prisma schema for PostgreSQL (Neon). Covers all MVP features:

- NextAuth.js authentication
- User profiles & onboarding
- Stripe subscriptions
- Course content (modules, lessons, assets)
- Progress tracking
- Email queue & logs
- Custom analytics events

---

## Entity Relationship Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Account   │────▶│    User     │◀────│   Session   │
└─────────────┘     └──────┬──────┘     └─────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
┌─────────────┐     ┌─────────────┐   ┌─────────────┐
│ Subscription│     │  Progress   │   │    Event    │
└─────────────┘     └─────────────┘   └─────────────┘
                           │
                           ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Module    │────▶│   Lesson    │◀────│    Asset    │
└─────────────┘     └─────────────┘     └─────────────┘
```

---

## 1. Authentication (NextAuth)

*Standard NextAuth models with Prisma adapter.*

```
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

---

## 2. User & Onboarding

```
enum UserRole {
  USER
  ADMIN
}

enum UserType {
  SOLO_BUILDER
  EXPERIENCED_DEV
  TECH_TEAM
}

enum ExperienceLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  name          String?
  image         String?
  role          UserRole  @default(USER)

  // Onboarding
  onboardingComplete Boolean         @default(false)
  userType           UserType?
  buildGoal          String?         @db.Text
  experienceLevel    ExperienceLevel?

  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  lastLoginAt DateTime?

  // Email preferences
  marketingOptOut Boolean @default(false)

  // Relations
  accounts      Account[]
  sessions      Session[]
  subscription  Subscription?
  progress      LessonProgress[]
  events        Event[]
  emailLogs     EmailLog[]
}
```

---

## 3. Subscription (Stripe)

```
enum SubscriptionStatus {
  ACTIVE
  PAST_DUE
  CANCELLED
  TRIALING
  INCOMPLETE
}

enum SubscriptionPlan {
  MONTHLY
  ANNUAL
}

model Subscription {
  id                   String             @id @default(cuid())
  userId               String             @unique
  stripeCustomerId     String             @unique
  stripeSubscriptionId String             @unique
  status               SubscriptionStatus
  plan                 SubscriptionPlan
  
  // Billing
  currentPeriodStart DateTime
  currentPeriodEnd   DateTime
  cancelAtPeriodEnd  Boolean  @default(false)
  cancelledAt        DateTime?

  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([stripeCustomerId])
  @@index([stripeSubscriptionId])
}
```

---

## 4. Course Content

```
model Module {
  id          String  @id @default(cuid())
  title       String
  description String? @db.Text
  order       Int
  published   Boolean @default(false)

  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  lessons Lesson[]

  @@index([order])
}

model Lesson {
  id        String  @id @default(cuid())
  moduleId  String
  title     String
  order     Int
  published Boolean @default(false)
  isFree    Boolean @default(false)  // Video 1 = true

  // Video (Mux)
  muxAssetId    String?
  muxPlaybackId String?
  videoDuration Int?     // seconds

  // Content
  content Json?  // TipTap JSON

  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  module   Module           @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  assets   Asset[]
  progress LessonProgress[]

  @@index([moduleId])
  @@index([order])
}

model Asset {
  id       String @id @default(cuid())
  lessonId String
  title    String
  fileName String
  fileUrl  String  // Vercel Blob URL
  fileSize Int?    // bytes
  mimeType String?
  order    Int     @default(0)

  // Timestamps
  createdAt DateTime @default(now())

  // Relations
  lesson Lesson @relation(fields: [lessonId], references: [id], onDelete: Cascade)

  @@index([lessonId])
}
```

---

## 5. Progress Tracking

```
model LessonProgress {
  id          String   @id @default(cuid())
  userId      String
  lessonId    String
  completed   Boolean  @default(false)
  completedAt DateTime?

  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  lesson Lesson @relation(fields: [lessonId], references: [id], onDelete: Cascade)

  @@unique([userId, lessonId])
  @@index([userId])
  @@index([lessonId])
}
```

### Progress Queries

```sql
-- Get user's course progress
SELECT 
  [m.id](http://m.id) as module_id,
  m.title as module_title,
  COUNT([l.id](http://l.id)) as total_lessons,
  COUNT([lp.id](http://lp.id)) FILTER (WHERE lp.completed = true) as completed_lessons
FROM "Module" m
LEFT JOIN "Lesson" l ON l."moduleId" = [m.id](http://m.id) AND l.published = true
LEFT JOIN "LessonProgress" lp ON lp."lessonId" = [l.id](http://l.id) AND lp."userId" = $1
GROUP BY [m.id](http://m.id)
ORDER BY m.order;

-- Get next incomplete lesson
SELECT l.* FROM "Lesson" l
LEFT JOIN "LessonProgress" lp ON lp."lessonId" = [l.id](http://l.id) AND lp."userId" = $1
WHERE l.published = true AND (lp.completed IS NULL OR lp.completed = false)
ORDER BY (SELECT "order" FROM "Module" WHERE id = l."moduleId"), l.order
LIMIT 1;
```

---

## 6. Email System

```
enum EmailTemplate {
  WELCOME
  START_JOURNEY
  ABANDONMENT_1
  ABANDONMENT_2
  ABANDONMENT_3
  MODULE_COMPLETE
  INACTIVE_NUDGE
  RENEWAL_REMINDER
  PAYMENT_FAILED
  PAYMENT_FAILED_FINAL
}

enum EmailStatus {
  PENDING
  SENT
  FAILED
  CANCELLED
}

model EmailQueue {
  id         String        @id @default(cuid())
  userId     String
  template   EmailTemplate
  scheduledFor DateTime
  status     EmailStatus   @default(PENDING)
  
  // Context data for template
  data       Json?

  // Timestamps
  createdAt  DateTime @default(now())
  processedAt DateTime?

  @@index([status, scheduledFor])
  @@index([userId])
}

model EmailLog {
  id        String        @id @default(cuid())
  userId    String
  template  EmailTemplate
  to        String
  subject   String
  status    EmailStatus
  error     String?

  // Timestamps
  sentAt    DateTime @default(now())

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([sentAt])
}
```

### Email Trigger Logic

| Trigger | Template | Schedule Logic |
| --- | --- | --- |
| Signup | `WELCOME` | Immediate |
| 24hr no Video 1 | `START_JOURNEY` | `created_at + 24hr` if no `video_1_started` event |
| Video 1 done, no sub | `ABANDONMENT_1` | `video_1_completed_at + 1hr` if no subscription |
| Video 1 done, no sub | `ABANDONMENT_2` | `video_1_completed_at + 24hr` if no subscription |
| Video 1 done, no sub | `ABANDONMENT_3` | `video_1_completed_at + 3 days` if no subscription |
| Module complete | `MODULE_COMPLETE` | Immediate |
| 7 days inactive | `INACTIVE_NUDGE` | `last_login_at + 7 days` |
| 3 days before renewal | `RENEWAL_REMINDER` | `current_period_end - 3 days` |
| Payment failed | `PAYMENT_FAILED` | Immediate (Stripe webhook) |
| Still failed after 3 days | `PAYMENT_FAILED_FINAL` | `first_failure + 3 days` |

---

## 7. Analytics (Custom Events)

```
model Event {
  id        String   @id @default(cuid())
  userId    String?  // Nullable for anonymous events
  sessionId String?
  event     String
  properties Json?

  // Timestamps
  createdAt DateTime @default(now())

  // Relations
  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([event])
  @@index([userId])
  @@index([createdAt])
  @@index([event, createdAt])
}
```

### Analytics Queries

```sql
-- 30-day conversion funnel
SELECT 
  COUNT(*) FILTER (WHERE event = 'signup_completed') as signups,
  COUNT(*) FILTER (WHERE event = 'onboarding_completed') as onboarded,
  COUNT(*) FILTER (WHERE event = 'video_1_completed') as activated,
  COUNT(*) FILTER (WHERE event = 'paywall_viewed') as saw_paywall,
  COUNT(*) FILTER (WHERE event = 'subscription_started') as converted
FROM "Event"
WHERE "createdAt" > NOW() - INTERVAL '30 days';

-- Monthly vs Annual split
SELECT 
  (properties->>'plan') as plan,
  COUNT(*) as count
FROM "Event"
WHERE event = 'subscription_started'
  AND "createdAt" > NOW() - INTERVAL '30 days'
GROUP BY properties->>'plan';

-- MRR calculation (from subscriptions, not events)
SELECT 
  SUM(CASE WHEN plan = 'MONTHLY' THEN 49 ELSE 399/12 END) as mrr
FROM "Subscription"
WHERE status = 'ACTIVE';

-- Completion rate by module
SELECT 
  m.title,
  COUNT(DISTINCT lp."userId") as users_started,
  COUNT(DISTINCT lp."userId") FILTER (WHERE lp.completed = true) as users_completed
FROM "Module" m
JOIN "Lesson" l ON l."moduleId" = [m.id](http://m.id)
LEFT JOIN "LessonProgress" lp ON lp."lessonId" = [l.id](http://l.id)
GROUP BY [m.id](http://m.id)
ORDER BY m.order;
```

---

## 8. Full Schema File

```
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// ENUMS
// ============================================

enum UserRole {
  USER
  ADMIN
}

enum UserType {
  SOLO_BUILDER
  EXPERIENCED_DEV
  TECH_TEAM
}

enum ExperienceLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
}

enum SubscriptionStatus {
  ACTIVE
  PAST_DUE
  CANCELLED
  TRIALING
  INCOMPLETE
}

enum SubscriptionPlan {
  MONTHLY
  ANNUAL
}

enum EmailTemplate {
  WELCOME
  START_JOURNEY
  ABANDONMENT_1
  ABANDONMENT_2
  ABANDONMENT_3
  MODULE_COMPLETE
  INACTIVE_NUDGE
  RENEWAL_REMINDER
  PAYMENT_FAILED
  PAYMENT_FAILED_FINAL
}

enum EmailStatus {
  PENDING
  SENT
  FAILED
  CANCELLED
}

// ============================================
// NEXTAUTH MODELS
// ============================================

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ============================================
// USER
// ============================================

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  name          String?
  image         String?
  role          UserRole  @default(USER)

  // Onboarding
  onboardingComplete Boolean          @default(false)
  userType           UserType?
  buildGoal          String?          @db.Text
  experienceLevel    ExperienceLevel?

  // Timestamps
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  lastLoginAt DateTime?

  // Email preferences
  marketingOptOut Boolean @default(false)

  // Relations
  accounts     Account[]
  sessions     Session[]
  subscription Subscription?
  progress     LessonProgress[]
  events       Event[]
  emailLogs    EmailLog[]
}

// ============================================
// SUBSCRIPTION
// ============================================

model Subscription {
  id                   String             @id @default(cuid())
  userId               String             @unique
  stripeCustomerId     String             @unique
  stripeSubscriptionId String             @unique
  status               SubscriptionStatus
  plan                 SubscriptionPlan

  currentPeriodStart DateTime
  currentPeriodEnd   DateTime
  cancelAtPeriodEnd  Boolean   @default(false)
  cancelledAt        DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([stripeCustomerId])
  @@index([stripeSubscriptionId])
}

// ============================================
// COURSE CONTENT
// ============================================

model Module {
  id          String  @id @default(cuid())
  title       String
  description String? @db.Text
  order       Int
  published   Boolean @default(false)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  lessons Lesson[]

  @@index([order])
}

model Lesson {
  id        String  @id @default(cuid())
  moduleId  String
  title     String
  order     Int
  published Boolean @default(false)
  isFree    Boolean @default(false)

  muxAssetId    String?
  muxPlaybackId String?
  videoDuration Int?

  content Json?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  module   Module           @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  assets   Asset[]
  progress LessonProgress[]

  @@index([moduleId])
  @@index([order])
}

model Asset {
  id       String  @id @default(cuid())
  lessonId String
  title    String
  fileName String
  fileUrl  String
  fileSize Int?
  mimeType String?
  order    Int     @default(0)

  createdAt DateTime @default(now())

  lesson Lesson @relation(fields: [lessonId], references: [id], onDelete: Cascade)

  @@index([lessonId])
}

// ============================================
// PROGRESS
// ============================================

model LessonProgress {
  id          String    @id @default(cuid())
  userId      String
  lessonId    String
  completed   Boolean   @default(false)
  completedAt DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  lesson Lesson @relation(fields: [lessonId], references: [id], onDelete: Cascade)

  @@unique([userId, lessonId])
  @@index([userId])
  @@index([lessonId])
}

// ============================================
// EMAIL
// ============================================

model EmailQueue {
  id           String        @id @default(cuid())
  userId       String
  template     EmailTemplate
  scheduledFor DateTime
  status       EmailStatus   @default(PENDING)
  data         Json?

  createdAt   DateTime  @default(now())
  processedAt DateTime?

  @@index([status, scheduledFor])
  @@index([userId])
}

model EmailLog {
  id       String        @id @default(cuid())
  userId   String
  template EmailTemplate
  to       String
  subject  String
  status   EmailStatus
  error    String?

  sentAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([sentAt])
}

// ============================================
// ANALYTICS
// ============================================

model Event {
  id         String  @id @default(cuid())
  userId     String?
  sessionId  String?
  event      String
  properties Json?

  createdAt DateTime @default(now())

  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([event])
  @@index([userId])
  @@index([createdAt])
  @@index([event, createdAt])
}
```

---

## 9. Schema Additions (Post-Review)

*Added after Master Spec validation — 24 Dec 2025*

### User Model — Add:

```jsx
// After image field:
hashedPassword String?   // For email/password auth (null for OAuth users)

// After experienceLevel field:
accessOverride Boolean @default(false)  // Grant free access (bypasses subscription check)
```

### Subscription Model — Add:

```jsx
// After cancelledAt field:
paymentFailedAt DateTime?  // For "3 days after failure" email timing
```

### Access Check Logic

```tsx
function hasAccess(user: User): boolean {
  // Free access override
  if (user.accessOverride) return true;
  
  // Active subscription
  if (user.subscription?.status === 'ACTIVE') return true;
  
  // Past due but within grace period
  if (user.subscription?.status === 'PAST_DUE') return true;
  
  return false;
}
```

### Refund Eligibility (Derived)

```tsx
function isRefundEligible(subscription: Subscription): boolean {
  const daysSinceCreated = differenceInDays(new Date(), subscription.createdAt);
  return daysSinceCreated <= 90;
}
```

---

## Index Strategy

| Table | Index | Purpose |
| --- | --- | --- |
| `User` | `email` (unique) | Auth lookup |
| `Session` | `userId` | Session lookup |
| `Subscription` | `stripeCustomerId`, `stripeSubscriptionId` | Webhook matching |
| `Module` | `order` | Sorted queries |
| `Lesson` | `moduleId`, `order` | Content navigation |
| `LessonProgress` | `userId`, `lessonId`, `[userId, lessonId]` (unique) | Progress lookup |
| `EmailQueue` | `[status, scheduledFor]` | Cron job queries |
| `Event` | `event`, `createdAt`, `[event, createdAt]` | Analytics queries |

---

## Migration Notes

1. **Initial migration:** `npx prisma migrate dev --name init`
2. **Seed admin user:** Create via script with `role: ADMIN`
3. **Seed sample content:** 1 module, 2 lessons (lesson 1 = free)

---

**Next Step:** Build Roadmap