# DATABASE_SCHEMA.md

Copy this entire page content into a file named `DATABASE_[SCHEMA.md](http://SCHEMA.md)` in your project root.

---

# Database Schema

PostgreSQL via Neon, managed with Prisma.

## Entity Relationships

```
User ─┬─ Account (OAuth)
      ├─ Session
      ├─ Subscription (1:1)
      ├─ LessonProgress (1:many)
      ├─ Event (1:many)
      └─ EmailLog (1:many)

Module ─── Lesson ─── Asset
                 └── LessonProgress

EmailQueue (standalone job queue)
```

---

## User Model

| Field | Type | Constraints | Notes |
| --- | --- | --- | --- |
| id | cuid | PK |  |
| email | string | UNIQUE, required |  |
| hashedPassword | string? |  | null for OAuth users |
| name | string? |  |  |
| role | enum | USER \ | ADMIN |
| onboardingComplete | boolean |  | default false |
| userType | enum? | SOLO_BUILDER \ | EXPERIENCED_DEV \ |
| buildGoal | text? |  | freeform |
| experienceLevel | enum? | BEGINNER \ | INTERMEDIATE \ |
| accessOverride | boolean |  | default false — grants free access |
| marketingOptOut | boolean |  | default false |
| lastLoginAt | datetime? |  | for inactive nudge |

**Constraints:**

- Email must be valid format
- Role change requires admin action
- accessOverride bypasses ALL subscription checks

---

## Subscription Model

| Field | Type | Constraints | Notes |
| --- | --- | --- | --- |
| id | cuid | PK |  |
| userId | string | UNIQUE, FK→User | 1:1 relationship |
| stripeCustomerId | string | UNIQUE |  |
| stripeSubscriptionId | string | UNIQUE |  |
| status | enum | ACTIVE \ | PAST_DUE \ |
| plan | enum | MONTHLY \ | ANNUAL |
| currentPeriodStart | datetime |  |  |
| currentPeriodEnd | datetime |  |  |
| cancelAtPeriodEnd | boolean |  | default false |
| cancelledAt | datetime? |  |  |
| paymentFailedAt | datetime? |  | for 3-day final warning timing |

**Constraints:**

- Only ONE subscription per user
- Status ONLY updated via Stripe webhooks
- MRR calculation: ACTIVE only, Monthly=4900, Annual=39900/12

---

## Module Model

| Field | Type | Constraints | Notes |
| --- | --- | --- | --- |
| id | cuid | PK |  |
| title | string | required |  |
| description | text? |  |  |
| order | int | indexed | for sequential gating |
| published | boolean |  | default false |

---

## Lesson Model

| Field | Type | Constraints | Notes |
| --- | --- | --- | --- |
| id | cuid | PK |  |
| moduleId | string | FK→Module |  |
| title | string | required |  |
| order | int | indexed |  |
| published | boolean |  | default false |
| isFree | boolean |  | default false — Video 1 = true |
| muxAssetId | string? |  |  |
| muxPlaybackId | string? |  |  |
| videoDuration | int? |  | seconds |
| content | json? |  | TipTap JSON |

---

## LessonProgress Model

| Field | Type | Constraints | Notes |
| --- | --- | --- | --- |
| id | cuid | PK |  |
| userId | string | FK→User |  |
| lessonId | string | FK→Lesson |  |
| completed | boolean |  | default false |
| completedAt | datetime? |  |  |

**Constraints:**

- UNIQUE(userId, lessonId) — one record per user per lesson
- Use UPSERT to handle duplicates
- Binary completion only (no partial progress)

---

## EmailQueue Model

| Field | Type | Constraints | Notes |
| --- | --- | --- | --- |
| id | cuid | PK |  |
| userId | string | FK→User |  |
| template | enum | see templates |  |
| scheduledFor | datetime | indexed |  |
| status | enum | PENDING \ | SENT \ |
| data | json? |  | template variables |
| processedAt | datetime? |  |  |

**Constraints:**

- Cron processes PENDING where scheduledFor <= now
- Re-check user state at send time (may have converted)
- Expired entries (>7 days old) should be skipped

---

## Event Model

| Field | Type | Constraints | Notes |
| --- | --- | --- | --- |
| id | cuid | PK |  |
| userId | string? | FK→User | nullable for anonymous |
| sessionId | string? |  |  |
| event | string | indexed | event name |
| properties | json? |  | event data |
| createdAt | datetime | indexed |  |

**Constraints:**

- Payment events MUST have userId (server-side)
- Compound index on (event, createdAt) for analytics
- Properties should include required fields per event type

---

## Key Indexes

- [User.email](http://User.email) (unique)
- Subscription.stripeCustomerId (unique)
- Subscription.stripeSubscriptionId (unique)
- Module.order
- Lesson.moduleId + order
- LessonProgress (userId, lessonId) unique compound
- EmailQueue (status, scheduledFor) compound
- Event (event, createdAt) compound