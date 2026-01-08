# Build Chunks — Batch 2 (Modules 5-8)

<aside>
✅

**Generated:** 23 Dec 2025 — Progress, Email, Admin, Polish

</aside>

## Chunk Sequence Overview

| Chunk | Name | Category | Duration | Prerequisites |
| --- | --- | --- | --- | --- |
| 16 | Progress Data Layer | 📊 | 2-3 hrs | Module 2 + 4 complete |
| 17 | Lesson Completion UI | 🎨 | 3-4 hrs | Chunk 16 |
| 18 | Module Gating & Unlocks | ⚙️ | 3-4 hrs | Chunk 17 |
| 19 | Celebrations & Resume | ✨ | 2-3 hrs | Chunk 18 |
| 20 | Email Infrastructure | 🏗️ | 3-4 hrs | Module 1 complete |
| 21 | Email Queue & Processor | ⚙️ | 3-4 hrs | Chunk 20 |
| 22 | Email Triggers & Sequences | ⚙️ | 4-5 hrs | Chunk 21 |
| 23 | Unsubscribe & Logs | ✨ | 2-3 hrs | Chunk 22 |
| 24 | Admin Dashboard Metrics | 📊 | 3-4 hrs | All modules 1-6 |
| 25 | User Management | 🎨 | 3-4 hrs | Chunk 24 |
| 26 | Access Override & Email Logs | ⚙️ | 2-3 hrs | Chunk 25 |
| 27 | Event Verification | 📊 | 2-3 hrs | All modules |
| 28 | Error Boundaries & Loading States | ✨ | 2-3 hrs | Chunk 27 |
| 29 | Mobile & Final QA | ✨ | 3-4 hrs | Chunk 28 |

**Batch 2 Total:** 14 chunks, 34-48 hours (~4-6 days)

---

# Module 5: Progress & Engagement

---

## Chunk 16: 📊 Progress Data Layer

**Duration:** 2-3 hours | **Prerequisites:** Module 2 (lessons exist) + Module 4 (access control works)

### Quick Reference

|  |  |
| --- | --- |
| **Builds** | LessonProgress table operations and progress calculation utilities |
| **Connects** | Lesson data → Progress service → Dashboard/UI components |
| **Pattern** | Follow existing Prisma query patterns from Module 2 |
| **Watch For** | Race conditions on rapid completion clicks, unique constraint handling |

### Context

**User Problem:** Users need their progress saved reliably so they can resume where they left off across sessions.

**From Module Brief:**

- Binary completion tracking (complete/not complete)
- Module completion derived from all lessons complete
- Course completion derived from all modules complete
- Progress must persist across sessions

### What's Changing

**New Additions:**

- `LessonProgress` Prisma operations: create, update, findMany by user
- `getModuleProgress(userId, moduleId)` — returns { completed: number, total: number }
- `getCourseProgress(userId)` — returns { completedModules: number, totalModules: number, completedLessons: number, totalLessons: number }
- `isModuleComplete(userId, moduleId)` — boolean helper
- `getNextIncompleteLesson(userId)` — for "resume where you left off"

**Modifications to Existing:**

- None yet — this is pure data layer

**No Changes To:**

- Lesson or Module models (schema already supports this)
- Authentication or access control

### Data Flow

**Mark Lesson Complete:**

1. User clicks "Mark as complete" (UI triggers API call)
2. API receives lessonId from authenticated user
3. Check: Does LessonProgress record exist for user+lesson?
    - If no → Create new record with `completed: true`, `completedAt: now()`
    - If yes, not completed → Update to `completed: true`, `completedAt: now()`
    - If yes, already completed → Return existing (idempotent)
4. Return updated progress state
5. Track `lesson_completed` event

**Get Module Progress:**

1. Query all lessons in module (published only)
2. Query all LessonProgress records for user in this module
3. Count completed vs total
4. Return progress object

### Things to Watch For

**Race Conditions:**

- Issue: User rapidly clicks complete button multiple times
- Manifests: Duplicate records attempted, unique constraint violation
- Prevention: Use `upsert` with unique constraint on [userId, lessonId], debounce on frontend

**Unique Constraint Errors:**

- Issue: Prisma throws on duplicate [userId, lessonId]
- Manifests: 500 error to user on second click
- Prevention: Use `upsert` not `create`, catch P2002 error code gracefully

**Unpublished Lessons in Progress Calc:**

- Issue: Including unpublished lessons skews progress percentage
- Manifests: "3 of 5 complete" when user only sees 3 lessons
- Prevention: Always filter `published: true` in lesson queries

**Module Completion Edge Case:**

- Issue: Module with zero published lessons
- Manifests: Division by zero or undefined behavior
- Prevention: Return `{ completed: 0, total: 0, isComplete: true }` for empty modules

**Cascade Deletion:**

- Issue: Deleting a lesson should clean up progress records
- Manifests: Orphaned progress records, incorrect counts
- Prevention: Schema has `onDelete: Cascade` — verify in tests

**Timestamp Accuracy:**

- Issue: `completedAt` not reflecting actual completion time
- Manifests: Analytics/email triggers use wrong timing
- Prevention: Set `completedAt` in API, not just `updatedAt`

**N+1 Queries:**

- Issue: Fetching progress for each lesson individually
- Manifests: Slow dashboard load with many lessons
- Prevention: Batch fetch all user's progress in single query, then filter in memory

**Type Safety:**

- Issue: Progress calculations returning wrong types
- Manifests: UI shows "NaN%" or "undefined/5 complete"
- Prevention: Explicit return types on all progress functions

### Testing Verification

**Existing Features Still Work:**

- [ ]  Lessons load correctly (Module 2)
- [ ]  Access control still enforced (Module 4)

**New Functionality Works:**

- [ ]  Create progress record for new user+lesson
- [ ]  Upsert handles duplicate gracefully
- [ ]  Module progress calculates correctly
- [ ]  Course progress calculates correctly
- [ ]  `getNextIncompleteLesson` returns correct lesson

**Edge Cases:**

- [ ]  Empty module returns sensible progress
- [ ]  All lessons complete → module marked complete
- [ ]  Unpublished lessons excluded from counts
- [ ]  Deleting lesson cascades to progress

---

## Chunk 17: 🎨 Lesson Completion UI

**Duration:** 3-4 hours | **Prerequisites:** Chunk 16 complete (progress data layer works)

### Quick Reference

|  |  |
| --- | --- |
| **Builds** | "Mark as complete" button, progress indicators on lesson/module views |
| **Connects** | Progress API → UI state → Visual feedback |
| **Pattern** | Follow existing button patterns from shadcn/ui |
| **Watch For** | Optimistic UI vs server state, loading states, re-render performance |

### Context

**User Problem:** Users need clear visual feedback when they complete lessons and see their progress through the course.

**From Module Brief:**

- "Mark as complete" button on lessons
- Module shows X/Y lessons complete
- Dashboard shows overall course progress
- Completion status persists across sessions

### What's Changing

**New Additions:**

- `MarkCompleteButton` component: Toggle button with loading/complete states
- `LessonProgressIndicator`: Checkmark or empty circle per lesson
- `ModuleProgressBar`: "3 of 5 complete" with visual bar
- `CourseProgressCard`: Dashboard widget showing overall progress
- API route: `POST /api/lessons/[id]/complete`
- API route: `GET /api/progress` (user's full progress)

**Modifications to Existing:**

- Lesson page: Add MarkCompleteButton
- Module view: Add progress indicators per lesson
- Dashboard: Add CourseProgressCard

**No Changes To:**

- Lesson content rendering
- Video player
- Navigation structure

### Data Flow

**Mark Complete Flow:**

1. User clicks "Mark as complete" button
2. Button shows loading spinner (optimistic: immediately show complete)
3. POST to `/api/lessons/[id]/complete`
4. Server creates/updates LessonProgress
5. Server returns new completion state
6. If success → Confirm optimistic state, track event
7. If error → Revert optimistic state, show error toast
8. Parent components re-fetch or update via cache invalidation

**Progress Display Flow:**

1. Page loads (lesson, module, or dashboard)
2. Fetch progress data (server component or client query)
3. Calculate percentages/counts
4. Render appropriate indicators
5. Subscribe to updates (if using React Query/SWR)

### Things to Watch For

**Optimistic UI Rollback:**

- Issue: User sees "complete" but server failed
- Manifests: State reverts after delay, confusing UX
- Prevention: Use React Query mutation with `onMutate`/`onError` rollback, clear error toast

**Button Spam:**

- Issue: User clicks rapidly, multiple API calls
- Manifests: Race conditions, flickering UI
- Prevention: Disable button during pending state, debounce clicks

**Stale Progress Data:**

- Issue: Dashboard shows old progress after completing lesson
- Manifests: User completes lesson, navigates to dashboard, sees old count
- Prevention: Invalidate progress queries on mutation success, or use shared state

**Loading State Flash:**

- Issue: Brief loading flash on fast networks
- Manifests: Button flickers between states
- Prevention: Minimum loading duration (200ms) or optimistic-only update

**Progress Bar Overflow:**

- Issue: Progress > 100% if data inconsistent
- Manifests: Visual bar extends beyond container
- Prevention: Clamp percentage to 0-100, investigate if exceeded

**Accessibility:**

- Issue: Completion state not announced to screen readers
- Manifests: A11y audit failures
- Prevention: Use aria-pressed on button, aria-live for progress updates

**Re-render Performance:**

- Issue: Every completion re-renders entire lesson list
- Manifests: Jank on module page with many lessons
- Prevention: Memoize lesson items, only update changed progress

**Server/Client Hydration:**

- Issue: Server-rendered progress differs from client state
- Manifests: Flash of incorrect content
- Prevention: Fetch progress on server for initial render, hydrate correctly

### Testing Verification

**Existing Features Still Work:**

- [ ]  Lesson content displays correctly
- [ ]  Video plays (if present)
- [ ]  Navigation between lessons works

**New Functionality Works:**

- [ ]  Mark as complete button appears on lessons
- [ ]  Clicking complete → Button shows complete state
- [ ]  Progress persists after page refresh
- [ ]  Module view shows correct X/Y count
- [ ]  Dashboard shows overall progress

**Edge Cases:**

- [ ]  Mark complete while offline → Appropriate error
- [ ]  Already completed lesson → Button shows complete state
- [ ]  Complete all lessons in module → Count shows full

---

## Chunk 18: ⚙️ Module Gating & Unlocks

**Duration:** 3-4 hours | **Prerequisites:** Chunk 17 complete (completion tracking works)

### Quick Reference

|  |  |
| --- | --- |
| **Builds** | Sequential module unlocking based on completion |
| **Connects** | Module progress → Access check → UI lock state |
| **Pattern** | Middleware-style check before lesson access |
| **Watch For** | First module always unlocked, admin bypass, edge case with empty modules |

### Context

**User Problem:** Users should progress sequentially through modules to get the full learning experience, but shouldn't feel arbitrarily blocked.

**From Module Brief:**

- Must complete all lessons in Module N to unlock Module N+1
- Module 1 always accessible (contains Video 1 which is free)
- Locked modules show locked state, not hidden
- Dramatic "unlock" animation when module becomes available

### What's Changing

**New Additions:**

- `isModuleUnlocked(userId, moduleId)` — checks if previous module complete
- `getUnlockedModules(userId)` — returns array of accessible module IDs
- `ModuleLockOverlay` component: Visual lock state with "Complete Module X to unlock"
- Module unlock check in lesson access API

**Modifications to Existing:**

- Module card component: Add locked/unlocked state
- Lesson page: Check module unlock before rendering content
- Dashboard: Visual differentiation for locked modules

**No Changes To:**

- Video 1 / isFree logic (handled separately in Module 4)
- Admin access (admins see everything)
- Subscription access (handled in Module 4)

### Data Flow

**Module Unlock Check:**

1. Determine module's order position
2. If order === 1 → Always unlocked
3. Find previous module (order - 1)
4. Check if previous module is complete for user
5. Return locked/unlocked status

**Access Lesson in Locked Module:**

1. User navigates to lesson URL directly
2. Server checks: Is user's module unlocked?
3. If no → Return 403 or redirect to module page with lock message
4. If yes → Proceed to normal access checks (subscription, etc.)

**Module Just Unlocked:**

1. User completes final lesson in Module N
2. Module N marked complete
3. Module N+1 unlock status changes
4. If user on dashboard/module list → Show unlock animation
5. Track `module_completed` event

### Things to Watch For

**Module Order Gaps:**

- Issue: Modules with order 1, 2, 5 (gap at 3, 4)
- Manifests: Module 5 never unlocks because "Module 4" doesn't exist
- Prevention: Use sequential check (previous published module), not order - 1

**First Module Edge Case:**

- Issue: Module 1 incorrectly shows as locked
- Manifests: New user can't access anything
- Prevention: Explicit check: if first module, always return unlocked

**Empty Previous Module:**

- Issue: Previous module has no published lessons
- Manifests: Can't complete it, so next module stuck locked
- Prevention: Empty modules count as "complete" (nothing to do)

**Admin Bypass:**

- Issue: Admin should see all modules unlocked for testing
- Manifests: Admin can't preview locked module experience
- Prevention: Add optional `?preview=locked` param for admins to see lock state

**Race Condition on Unlock:**

- Issue: User completes module, quickly navigates before state updates
- Manifests: Next module still shows locked briefly
- Prevention: Optimistic unlock on client, confirm with server

**URL Direct Access:**

- Issue: User bookmarks locked lesson URL
- Manifests: Confusing error when they return later
- Prevention: Friendly redirect to module overview with clear message

**Unpublished Module in Sequence:**

- Issue: Module 2 unpublished, Module 3 exists
- Manifests: What is "previous" module for Module 3?
- Prevention: Skip unpublished modules in sequence calculation

**Cache Invalidation:**

- Issue: Unlock status cached, doesn't update on completion
- Manifests: User completes module but next still shows locked
- Prevention: Invalidate unlock cache on any progress update

### Testing Verification

**Existing Features Still Work:**

- [ ]  Marking lessons complete still works
- [ ]  Progress tracking accurate
- [ ]  Subscription access unaffected

**New Functionality Works:**

- [ ]  Module 1 always accessible
- [ ]  Module 2 locked for new user
- [ ]  Complete all Module 1 lessons → Module 2 unlocks
- [ ]  Locked module shows lock overlay
- [ ]  Direct URL to locked lesson → Appropriate redirect/error

**Edge Cases:**

- [ ]  Admin can access locked modules
- [ ]  Empty module in sequence handled
- [ ]  Unpublished module skipped in sequence

---

## Chunk 19: ✨ Celebrations & Resume

**Duration:** 2-3 hours | **Prerequisites:** Chunk 18 complete (module gating works)

### Quick Reference

|  |  |
| --- | --- |
| **Builds** | Celebration animations, share prompts, "resume where you left off" |
| **Connects** | Completion events → Celebration triggers → Social share |
| **Pattern** | Event-driven UI with confetti library |
| **Watch For** | Celebration timing, share URL construction, mobile performance |

### Context

**User Problem:** Course completion can feel like a slog without dopamine hits. Celebrations create emotional moments that drive completion and organic sharing.

**From Module Brief:**

- Confetti/animation on module completion
- "Share your progress" prompt (Twitter/LinkedIn)
- Dramatic "unlock" animation for next module
- "Continue where you left off" on dashboard

### What's Changing

**New Additions:**

- `Confetti` component: Canvas-based confetti animation
- `CelebrationModal`: "You completed Module X!" with share options
- `UnlockAnimation`: Next module reveal animation
- `ResumeCard`: Dashboard component showing next lesson to continue
- Share URL generators for Twitter/LinkedIn
- Track `module_completed` and `course_completed` events with properties

**Modifications to Existing:**

- Module completion flow: Trigger celebration after last lesson
- Dashboard: Add ResumeCard prominently
- Lesson completion: Check if module now complete

**No Changes To:**

- Core progress tracking logic
- Module gating rules
- Email triggers (Module 6)

### Data Flow

**Module Completion Celebration:**

1. User marks final lesson in module as complete
2. API returns { lessonComplete: true, moduleComplete: true, nextModuleId: '...' }
3. Client receives moduleComplete flag
4. Trigger confetti animation (canvas overlay)
5. After 1.5s, show CelebrationModal
6. Modal offers: "Share on Twitter" / "Share on LinkedIn" / "Continue"
7. If share clicked → Open share URL in new tab, track event
8. If continue → Navigate to next module, show unlock animation
9. Track `module_completed` event

**Resume Where You Left Off:**

1. Dashboard loads
2. Query `getNextIncompleteLesson(userId)`
3. If found → Show ResumeCard with lesson title and "Continue" button
4. If all complete → Show "Course Complete" card
5. If not started → Show "Start Learning" card pointing to Lesson 1

### Things to Watch For

**Confetti Performance:**

- Issue: Canvas animation drops frames on low-end devices
- Manifests: Janky animation, page unresponsive
- Prevention: Use lightweight library (canvas-confetti), limit particle count, stop after 3s

**Modal Timing:**

- Issue: Modal appears before confetti starts or after it ends
- Manifests: Disconnected experience
- Prevention: Sequence: confetti starts → 1.5s delay → modal fades in → confetti continues behind

**Share URL Encoding:**

- Issue: Special characters in course name break share URLs
- Manifests: Broken links, weird text on Twitter
- Prevention: Use encodeURIComponent for all dynamic text in share URLs

**Share Tracking:**

- Issue: Can't tell if user actually shared or just opened modal
- Manifests: Inflated share metrics
- Prevention: Track "share_clicked" not "share_completed" (can't track completion)

**Double Celebration:**

- Issue: User completes module, navigates away, comes back, sees celebration again
- Manifests: Annoying repeated popup
- Prevention: One-time flag (sessionStorage or server-side "celebrated" field)

**Course Complete Edge:**

- Issue: Final module completion needs extra-special celebration
- Manifests: Same celebration as every other module
- Prevention: Detect course completion, show enhanced "You did it!" experience

**Resume Logic Edge Cases:**

- Issue: Multiple modules started but incomplete
- Manifests: Which lesson to show?
- Prevention: Show first incomplete lesson in first incomplete module (sequential)

**Mobile Share:**

- Issue: Share dialogs work differently on mobile
- Manifests: Twitter app not opening, weird behavior
- Prevention: Use Web Share API where available, fall back to URLs

**Accessibility:**

- Issue: Confetti is motion, modal traps focus
- Manifests: A11y violations
- Prevention: Respect prefers-reduced-motion, proper focus trap in modal

### Testing Verification

**Existing Features Still Work:**

- [ ]  Lesson completion tracking
- [ ]  Module gating/unlocking
- [ ]  Dashboard displays correctly

**New Functionality Works:**

- [ ]  Complete final lesson → Confetti plays
- [ ]  Celebration modal appears after confetti
- [ ]  Share buttons generate correct URLs
- [ ]  Continue button navigates to next module
- [ ]  Unlock animation plays on next module
- [ ]  Resume card shows on dashboard
- [ ]  Resume card links to correct next lesson

**Edge Cases:**

- [ ]  Course completion triggers enhanced celebration
- [ ]  Celebration only shows once per module
- [ ]  prefers-reduced-motion disables confetti
- [ ]  All lessons complete → Resume card shows "Course Complete"

### Module 5 Acceptance Tests

- [ ]  User can mark lesson as complete → Progress saved, UI updates
- [ ]  Complete all lessons in module → Module marked complete, celebration shown
- [ ]  Complete Module 1 → Module 2 unlocks with animation
- [ ]  Return to dashboard → Correct progress shown, resume card accurate
- [ ]  Click "Continue" → Goes to next incomplete lesson
- [ ]  Try to access locked module → Redirect or locked message
- [ ]  Complete final module → Course complete event, enhanced celebration

---

# Module 6: Email System

---

## Chunk 20: 🏗️ Email Infrastructure

**Duration:** 3-4 hours | **Prerequisites:** Module 1 complete (users exist)

### Quick Reference

|  |  |
| --- | --- |
| **Builds** | Mailgun integration, email service abstraction, template rendering |
| **Connects** | Email service → Mailgun API → User inbox |
| **Pattern** | Service abstraction pattern for external APIs |
| **Watch For** | API key security, sandbox vs production, template variable escaping |

### Context

**User Problem:** Users need to receive timely, relevant emails for onboarding, engagement, and transactional purposes.

**From Module Brief:**

- Mailgun integration
- 10 email templates
- Service abstraction for testability
- Immediate emails (welcome, payment failed) + scheduled emails (abandonment, nudges)

### What's Changing

**New Additions:**

- `EmailService` class with `send()` and `sendBatch()` methods
- Mailgun client configuration
- Email template definitions (subject, body template)
- Template rendering function (variable substitution)
- `EmailLog` creation on every send

**Modifications to Existing:**

- None — pure infrastructure

**No Changes To:**

- User model (already has marketingOptOut)
- Authentication flows

### Data Flow

**Send Email Flow:**

1. Caller invokes `emailService.send(userId, template, data)`
2. Fetch user by ID (get email, name, optOut status)
3. If marketing email and user opted out → Skip, log as CANCELLED
4. Render template with data (subject + body)
5. Call Mailgun API with rendered content
6. If success → Create EmailLog with SENT status
7. If failure → Create EmailLog with FAILED status + error
8. Return success/failure to caller

### Things to Watch For

**API Key Exposure:**

- Issue: Mailgun API key in client bundle or logs
- Manifests: Key leaked, spam sent from your domain
- Prevention: Server-side only, use MAILGUN_API_KEY env var, never log

**Sandbox Mode:**

- Issue: Development sends to real users
- Manifests: Test emails hitting production users
- Prevention: Use Mailgun sandbox domain in dev, only verified recipients

**Template Injection:**

- Issue: User-provided data in template not escaped
- Manifests: XSS in email clients, broken formatting
- Prevention: Escape all dynamic content, use text-based templates

**Missing Template Variables:**

- Issue: Template expects name but data doesn't include it
- Manifests: Email shows "name" literally or empty
- Prevention: Validate required variables before render, fallback values

**Mailgun Rate Limits:**

- Issue: Burst sending hits rate limits
- Manifests: 429 errors, emails not sent
- Prevention: Use batch sending for bulk, implement retry with backoff

**Email Validation:**

- Issue: Invalid email format causes Mailgun rejection
- Manifests: API error, email not sent
- Prevention: Validate email format before sending, handle gracefully

**From Address Configuration:**

- Issue: From address not authorized in Mailgun
- Manifests: Emails rejected or go to spam
- Prevention: Use verified domain, consistent from address

**HTML vs Text:**

- Issue: Only HTML version sent, text clients show nothing
- Manifests: Blank emails in some clients
- Prevention: Always include both HTML and plain text versions

### Testing Verification

**New Functionality Works:**

- [ ]  EmailService initializes with Mailgun client
- [ ]  Template rendering substitutes variables
- [ ]  send() calls Mailgun API correctly
- [ ]  EmailLog created on successful send
- [ ]  EmailLog created with error on failure
- [ ]  Opted-out user skipped for marketing emails

**Edge Cases:**

- [ ]  Missing template variable → Fallback or error
- [ ]  Invalid email address → Graceful failure
- [ ]  Mailgun API down → Appropriate error handling

---

## Chunk 21: ⚙️ Email Queue & Processor

**Duration:** 3-4 hours | **Prerequisites:** Chunk 20 complete (can send emails)

### Quick Reference

|  |  |
| --- | --- |
| **Builds** | EmailQueue table operations, cron job processor, scheduling logic |
| **Connects** | Triggers → Queue → Cron → EmailService |
| **Pattern** | Job queue pattern with database-backed persistence |
| **Watch For** | Timezone handling, duplicate prevention, cron reliability |

### Context

**User Problem:** Some emails need to be sent at specific times after events (abandonment sequences), not immediately.

**From Module Brief:**

- Email queue table + cron job processor
- Scheduled emails: abandonment (1hr, 24hr, 3 days), inactive nudge (7 days)
- Cancel scheduled emails when user converts

### What's Changing

**New Additions:**

- `queueEmail(userId, template, scheduledFor, data)` — adds to queue
- `cancelQueuedEmails(userId, templates[])` — cancels pending emails
- `processEmailQueue()` — cron job handler
- API route: `POST /api/cron/process-emails` (protected)
- Vercel cron configuration

**Modifications to Existing:**

- None — builds on email infrastructure

**No Changes To:**

- Immediate email sending (still direct)
- EmailLog structure

### Data Flow

**Queue Email Flow:**

1. Trigger event occurs (Video 1 complete without subscription)
2. Calculate scheduledFor times (now + 1hr, now + 24hr, now + 3 days)
3. Insert EmailQueue records for each scheduled email
4. Records sit in queue with PENDING status

**Process Queue Flow (Cron):**

1. Cron triggers every 5 minutes
2. Query: EmailQueue where status = PENDING and scheduledFor <= now
3. For each queued email:
    - Check if should still send (user hasn't converted, hasn't unsubscribed)
    - If should send → Call emailService.send()
    - Update status to SENT or FAILED
    - Set processedAt timestamp
4. Log batch completion

**Cancel Emails Flow:**

1. User subscribes (conversion event)
2. Call `cancelQueuedEmails(userId, ['ABANDONMENT_1', 'ABANDONMENT_2', 'ABANDONMENT_3'])`
3. Update matching PENDING records to CANCELLED

### Things to Watch For

**Timezone Confusion:**

- Issue: scheduledFor stored in wrong timezone
- Manifests: Emails sent at wrong time (3am instead of 3pm)
- Prevention: Always use UTC in database, convert for display only

**Duplicate Queue Entries:**

- Issue: Same email queued twice for same user
- Manifests: User receives duplicate emails
- Prevention: Check for existing PENDING entry before insert, or use unique constraint

**Cron Overlap:**

- Issue: Cron job runs longer than interval, next run starts
- Manifests: Same emails processed twice
- Prevention: Mark records as PROCESSING before sending, or use mutex

**Stale Queue Entries:**

- Issue: PENDING emails from weeks ago still in queue
- Manifests: Irrelevant emails sent late
- Prevention: Add expiry check (skip if scheduledFor > 7 days ago)

**Cron Authentication:**

- Issue: Anyone can trigger the cron endpoint
- Manifests: Queue processed unexpectedly, potential abuse
- Prevention: Verify Vercel cron secret header

**Large Queue Batches:**

- Issue: Thousands of emails to process in one run
- Manifests: Timeout, partial processing
- Prevention: Limit batch size (100), process more in next run

**Failed Email Retry:**

- Issue: Email fails once, stays FAILED forever
- Manifests: User never receives email
- Prevention: Implement retry count (max 3), only mark FAILED after retries exhausted

**Subscription State Check:**

- Issue: User subscribed between queue and process time
- Manifests: Abandonment email sent to paying customer
- Prevention: Re-check subscription status at send time, not just queue time

### Testing Verification

**New Functionality Works:**

- [ ]  queueEmail creates EmailQueue record
- [ ]  scheduledFor is correctly calculated
- [ ]  processEmailQueue finds due emails
- [ ]  Processing sends email and updates status
- [ ]  cancelQueuedEmails updates matching records

**Edge Cases:**

- [ ]  Duplicate queue entry prevented
- [ ]  Expired queue entry skipped
- [ ]  Cron endpoint rejects unauthenticated requests
- [ ]  User subscribed → Abandonment emails cancelled

---

## Chunk 22: ⚙️ Email Triggers & Sequences

**Duration:** 4-5 hours | **Prerequisites:** Chunk 21 complete (queue system works)

### Quick Reference

|  |  |
| --- | --- |
| **Builds** | All 10 email triggers wired to appropriate events |
| **Connects** | User actions → Event handlers → Email service/queue |
| **Pattern** | Event-driven triggers, composition over inheritance |
| **Watch For** | Trigger timing, duplicate triggers, state dependencies |

### Context

**User Problem:** Users need the right emails at the right times to stay engaged and recover from issues.

**From Module Brief:**

- 10 email templates with specific triggers
- Immediate: Welcome, Module Complete, Payment Failed
- Scheduled: Start Journey, Abandonment 1-3, Inactive Nudge, Renewal Reminder, Payment Failed Final

### What's Changing

**New Additions:**

- `triggerWelcomeEmail(userId)` — immediate on signup
- `triggerStartJourneyEmail(userId)` — queue for 24hr if no Video 1 start
- `triggerAbandonmentSequence(userId)` — queue 1hr, 24hr, 3 days after Video 1
- `triggerModuleCompleteEmail(userId, moduleId)` — immediate
- `triggerInactiveNudge(userId)` — queue for 7 days after last activity
- `triggerRenewalReminder(userId)` — queue for 3 days before renewal
- `triggerPaymentFailedEmail(userId)` — immediate
- `triggerPaymentFailedFinalEmail(userId)` — queue for 3 days after first failure
- Integration points in auth, payment, progress flows

**Modifications to Existing:**

- Signup flow: Call triggerWelcomeEmail + triggerStartJourneyEmail
- Video 1 completion: Call triggerAbandonmentSequence
- Subscription created: Cancel abandonment emails
- Module completion: Call triggerModuleCompleteEmail
- Stripe webhook (invoice.payment_failed): Call triggerPaymentFailedEmail
- lastLoginAt update: Reset inactive nudge timer

**No Changes To:**

- Core business logic
- Email rendering

### Data Flow

**Signup → Email Triggers:**

1. User completes signup
2. Call `triggerWelcomeEmail(userId)` → Sends immediately
3. Call `triggerStartJourneyEmail(userId)` → Queues for createdAt + 24hr
4. If user starts Video 1 before 24hr → Start Journey email auto-skipped (check at send time)

**Video 1 Complete → Abandonment Sequence:**

1. User completes Video 1
2. Check: Does user have active subscription?
3. If no → Call `triggerAbandonmentSequence(userId)`
4. Queue 3 emails: +1hr, +24hr, +3 days
5. Each email checks subscription status at send time
6. If user subscribes → `cancelQueuedEmails` for abandonment templates

**Payment Failed → Recovery Sequence:**

1. Stripe webhook: invoice.payment_failed
2. Update subscription status to PAST_DUE
3. Set paymentFailedAt timestamp
4. Call `triggerPaymentFailedEmail(userId)` → Immediate
5. Call `triggerPaymentFailedFinalEmail(userId)` → Queue for +3 days
6. If payment succeeds before final → Cancel final email

### Things to Watch For

**Duplicate Welcome Emails:**

- Issue: OAuth callback fires multiple times
- Manifests: User gets 2-3 welcome emails
- Prevention: Check EmailLog before sending, idempotent trigger

**Abandonment for Existing Subscribers:**

- Issue: User already subscribed, completes Video 1
- Manifests: Subscriber gets "subscribe now" email
- Prevention: Always check subscription status before triggering sequence

**Video 1 Completion Detection:**

- Issue: Which lesson is "Video 1"?
- Manifests: Wrong lesson triggers abandonment
- Prevention: Explicit check for `isFree: true` lesson, or first lesson in first module

**Module Complete vs Course Complete:**

- Issue: Same email for all module completions, including final
- Manifests: Generic email for course completion
- Prevention: Detect if final module, use different template or enhanced content

**Inactive Nudge Reset:**

- Issue: User logs in but nudge still sent
- Manifests: "Haven't seen you" email right after login
- Prevention: Cancel/reschedule nudge on every login

**Payment Failed Timing:**

- Issue: paymentFailedAt not set, final email timing wrong
- Manifests: Final warning sent immediately or never
- Prevention: Always set paymentFailedAt on first failure

**Renewal Reminder Timing:**

- Issue: Scheduled based on stale currentPeriodEnd
- Manifests: Reminder after renewal already happened
- Prevention: Check current period at send time, skip if already renewed

**Event Handler Failures:**

- Issue: Email trigger throws, breaks main flow
- Manifests: Signup fails because email service is down
- Prevention: Try-catch around triggers, log errors, don't block main flow

**Template Variable Context:**

- Issue: Module complete email needs module name, not passed
- Manifests: Email says "You completed {moduleName}"
- Prevention: Ensure all trigger functions pass required context data

### Testing Verification

**New Functionality Works:**

- [ ]  Signup → Welcome email sent immediately
- [ ]  Signup → Start Journey queued for 24hr
- [ ]  Video 1 complete (no sub) → 3 abandonment emails queued
- [ ]  Subscribe → Abandonment emails cancelled
- [ ]  Module complete → Congratulations email sent
- [ ]  Payment failed → Payment failed email sent
- [ ]  Payment failed → Final warning queued for 3 days

**Edge Cases:**

- [ ]  Video 1 complete WITH subscription → No abandonment emails
- [ ]  Already welcomed user → No duplicate welcome
- [ ]  User subscribes, then Video 1 → No abandonment emails
- [ ]  Payment succeeds before final warning → Final cancelled

---

## Chunk 23: ✨ Unsubscribe & Logs

**Duration:** 2-3 hours | **Prerequisites:** Chunk 22 complete (email triggers work)

### Quick Reference

|  |  |
| --- | --- |
| **Builds** | Unsubscribe flow, email preference management, admin email logs view |
| **Connects** | Unsubscribe link → User preference → Email checks |
| **Pattern** | Signed token for secure unsubscribe |
| **Watch For** | Transactional vs marketing distinction, signed URL security |

### Context

**User Problem:** Users need to control what emails they receive, and admins need visibility into email history.

**From Module Brief:**

- Unsubscribe handling (marketingOptOut flag)
- Transactional emails always send (payment related)
- Email logs viewable in admin

### What's Changing

**New Additions:**

- Unsubscribe URL generator (signed token)
- Unsubscribe landing page: `/unsubscribe?token=...`
- `unsubscribeUser(token)` — validates token, sets marketingOptOut
- Email preference page in user settings
- Admin: Email logs table with filters

**Modifications to Existing:**

- All marketing email templates: Add unsubscribe link in footer
- Email send logic: Check marketingOptOut for non-transactional
- User settings: Add email preferences section

**No Changes To:**

- Transactional email sending (payment, auth)
- Email queue processing logic

### Data Flow

**One-Click Unsubscribe:**

1. User receives marketing email with unsubscribe link
2. Link contains signed token (userId + expiry)
3. User clicks link → Lands on unsubscribe page
4. Token validated
5. If valid → Set user.marketingOptOut = true
6. Show confirmation message
7. Future marketing emails skipped for this user

**Email Classification:**

1. Before sending any email, classify as TRANSACTIONAL or MARKETING
2. Transactional: Welcome, Payment Failed, Payment Failed Final, Renewal Reminder
3. Marketing: Start Journey, Abandonment 1-3, Module Complete, Inactive Nudge
4. If marketing and user.marketingOptOut → Skip send, log as CANCELLED

**Admin Email Logs:**

1. Admin navigates to email logs page
2. Query EmailLog table with pagination
3. Display: timestamp, user, template, status, error
4. Filter by: user email, template, status, date range
5. Click row → Show full email details

### Things to Watch For

**Unsigned Unsubscribe URLs:**

- Issue: Anyone can unsubscribe any user by guessing URL
- Manifests: Malicious unsubscribe attacks
- Prevention: Sign URL with HMAC, include userId + expiry, validate on use

**Token Expiry:**

- Issue: Old unsubscribe links stop working
- Manifests: User clicks old email link, gets error
- Prevention: Long expiry (90 days) or no expiry, tokens are low risk

**Marketing vs Transactional Classification:**

- Issue: Payment email classified as marketing, not sent to opted-out user
- Manifests: User doesn't know payment failed
- Prevention: Explicit TRANSACTIONAL constant, always send those

**Unsubscribe Feedback:**

- Issue: User unsure if unsubscribe worked
- Manifests: User clicks again, contacts support
- Prevention: Clear success message, maybe optional reason capture

**Re-subscribe Flow:**

- Issue: User wants to re-enable marketing emails
- Manifests: No way to opt back in
- Prevention: Email preferences page with toggle

**Log Data Privacy:**

- Issue: Email content stored in logs, privacy concern
- Manifests: GDPR issues
- Prevention: Store template ID and subject only, not full body

**Log Pagination Performance:**

- Issue: Millions of logs, query times out
- Manifests: Admin page fails to load
- Prevention: Proper indexes, limit query scope, require date filter

**CAN-SPAM Compliance:**

- Issue: Unsubscribe doesn't work within 10 days
- Manifests: Legal issues
- Prevention: Immediate effect, no "processing" delay

### Testing Verification

**Existing Features Still Work:**

- [ ]  All email triggers function
- [ ]  Queue processing works
- [ ]  Transactional emails always send

**New Functionality Works:**

- [ ]  Unsubscribe link in marketing emails
- [ ]  Click unsubscribe → Sets marketingOptOut
- [ ]  Opted-out user skipped for marketing emails
- [ ]  Opted-out user still gets transactional emails
- [ ]  User settings shows email preferences
- [ ]  User can toggle preferences
- [ ]  Admin can view email logs
- [ ]  Admin can filter logs by user/template/status

**Edge Cases:**

- [ ]  Invalid unsubscribe token → Error message
- [ ]  Already unsubscribed → Idempotent success
- [ ]  Re-subscribe via settings → Works

### Module 6 Acceptance Tests

- [ ]  Sign up → Welcome email received
- [ ]  24hr no Video 1 → Start Journey email received
- [ ]  Complete Video 1, no sub → Abandonment emails at 1hr, 24hr, 3 days
- [ ]  Subscribe after Video 1 → Abandonment emails cancelled
- [ ]  Complete module → Congratulations email received
- [ ]  7 days inactive → Nudge email received
- [ ]  Payment fails → Payment failed email immediately
- [ ]  Payment still failed → Final warning at 3 days
- [ ]  Unsubscribe from marketing → No more nudge/abandonment
- [ ]  Unsubscribe → Still receives payment emails
- [ ]  Admin can view email logs per user
- [ ]  Cron job processes queue correctly

---

# Module 7: Admin Dashboard

---

## Chunk 24: 📊 Admin Dashboard Metrics

**Duration:** 3-4 hours | **Prerequisites:** All modules 1-6 complete (data exists)

### Quick Reference

|  |  |
| --- | --- |
| **Builds** | Admin dashboard with key business metrics |
| **Connects** | Event data + Subscription data → Aggregation queries → Dashboard UI |
| **Pattern** | Server-side aggregation, cached metrics |
| **Watch For** | Query performance, MRR calculation accuracy, metric freshness |

### Context

**User Problem:** Admin needs at-a-glance visibility into business health without digging through data.

**From Module Brief:**

- Dashboard: User count, active subscribers, MRR, conversion metrics
- Analytics queries from Event table

### What's Changing

**New Additions:**

- Admin dashboard page: `/admin`
- Metric cards: Total Users, Active Subscribers, MRR, Conversion Rate
- Conversion funnel visualization: Signups → Activated → Converted
- Time period selector (7d, 30d, 90d, all time)
- Aggregation queries for each metric

**Modifications to Existing:**

- Admin layout: Add dashboard as landing page

**No Changes To:**

- Event tracking (already in place)
- Subscription management
- User data structures

### Data Flow

**Dashboard Load:**

1. Admin navigates to /admin
2. Server fetches aggregated metrics:
    - COUNT users
    - COUNT subscriptions WHERE status = ACTIVE
    - SUM MRR (monthly + annual/12)
    - Conversion funnel from events
3. Render metric cards
4. Render funnel chart

**MRR Calculation:**

1. Query all ACTIVE subscriptions
2. For each: Monthly = £49, Annual = £399/12 = £33.25
3. Sum all values
4. Return total MRR

**Conversion Funnel:**

1. Query events in time period
2. Count: signup_completed
3. Count: video_1_completed (activated)
4. Count: subscription_started (converted)
5. Calculate percentages: activated/signups, converted/activated

### Things to Watch For

**MRR Calculation Precision:**

- Issue: Annual = 399/12 = 33.25, floating point issues
- Manifests: MRR shows £1,233.749999
- Prevention: Round to 2 decimal places for display

**Past Due Subscriptions:**

- Issue: Including PAST_DUE in MRR
- Manifests: Overstated MRR (money not yet collected)
- Prevention: Only count ACTIVE status for MRR

**Query Timeout:**

- Issue: Event table has millions of rows, aggregation slow
- Manifests: Dashboard takes 10+ seconds to load
- Prevention: Proper indexes on event + createdAt, cache results

**Time Period Filtering:**

- Issue: Timezone mismatch in date filters
- Manifests: "Last 7 days" shows wrong data
- Prevention: Use UTC for all queries, convert for display

**Funnel Drop-off Calculation:**

- Issue: More conversions than activations (data issue)
- Manifests: Impossible percentages (>100%)
- Prevention: Validate data, handle gracefully in UI

**Cancelled but Active Subs:**

- Issue: cancelAtPeriodEnd = true, but currentPeriodEnd in future
- Manifests: Should this count in MRR?
- Prevention: Include in MRR until actually expired (money is coming)

**Zero State:**

- Issue: New install with no data
- Manifests: Errors or blank dashboard
- Prevention: Handle zeros gracefully, show "No data yet" states

**Currency Display:**

- Issue: MRR shows as "1234.5" without currency symbol
- Manifests: Unclear what currency
- Prevention: Format as £X,XXX.XX consistently

### Testing Verification

**New Functionality Works:**

- [ ]  Dashboard loads for admin users
- [ ]  Total user count accurate
- [ ]  Active subscriber count accurate
- [ ]  MRR calculation correct
- [ ]  Conversion funnel shows correct numbers
- [ ]  Time period filter changes results

**Edge Cases:**

- [ ]  Zero users → Shows 0, no errors
- [ ]  Mixed monthly/annual subs → MRR correct
- [ ]  Past due subs excluded from MRR
- [ ]  Large dataset → Page loads in <3s

---

## Chunk 25: 🎨 User Management

**Duration:** 3-4 hours | **Prerequisites:** Chunk 24 complete (admin dashboard exists)

### Quick Reference

|  |  |
| --- | --- |
| **Builds** | User list, search, filters, user detail view |
| **Connects** | User data → List view → Detail view → Actions |
| **Pattern** | Server-side pagination, search, filtering |
| **Watch For** | Search performance, pagination state, filter combinations |

### Context

**User Problem:** Admin needs to find specific users and view their full history for support and management.

**From Module Brief:**

- User list with search and filter by status
- User detail: Progress, subscription status, email logs

### What's Changing

**New Additions:**

- User list page: `/admin/users`
- User search (by email, name)
- User filters (subscription status: all, active, free, past_due, cancelled)
- User detail page: `/admin/users/[id]`
- User detail sections: Profile, Progress, Subscription, Email History
- Pagination component

**Modifications to Existing:**

- Admin navigation: Add Users link

**No Changes To:**

- User model
- Subscription model
- Core authentication

### Data Flow

**User List Load:**

1. Admin navigates to /admin/users
2. Query users with default sort (createdAt desc)
3. Apply pagination (20 per page)
4. Render table with: Name, Email, Status, Progress, Joined

**User Search:**

1. Admin types in search box
2. Debounce input (300ms)
3. Query users WHERE email ILIKE %search% OR name ILIKE %search%
4. Combine with existing filters
5. Reset to page 1
6. Render results

**User Detail Load:**

1. Admin clicks user row
2. Navigate to /admin/users/[id]
3. Fetch user with relations: subscription, progress, emailLogs
4. Calculate derived data: course progress %, subscription age
5. Render detail sections

### Things to Watch For

**Search Injection:**

- Issue: Search term used directly in query
- Manifests: SQL injection vulnerability
- Prevention: Use Prisma parameterized queries (automatic)

**Search Performance:**

- Issue: ILIKE %term% can't use index
- Manifests: Slow search with many users
- Prevention: For MVP this is fine, add full-text search later if needed

**Pagination State Loss:**

- Issue: User navigates to detail, back button loses page number
- Manifests: Always returns to page 1
- Prevention: Store pagination in URL params, use back navigation

**Filter + Search Combination:**

- Issue: Active filters not visible when searching
- Manifests: Confusing results
- Prevention: Show active filter badges, clear button

**Empty Search Results:**

- Issue: No matching users, blank screen
- Manifests: Admin thinks it's broken
- Prevention: "No users found" message with suggestion

**User Detail 404:**

- Issue: User deleted but admin has old link
- Manifests: Error page
- Prevention: Graceful "User not found" message, back link

**Progress Calculation N+1:**

- Issue: Calculating progress for each user in list
- Manifests: Slow list load
- Prevention: Don't show detailed progress in list, only on detail page

**Subscription Status Mapping:**

- Issue: User with no subscription record vs cancelled subscription
- Manifests: Both show as "Free" but different history
- Prevention: Distinguish "Never subscribed" vs "Cancelled"

### Testing Verification

**New Functionality Works:**

- [ ]  User list shows all users
- [ ]  Pagination works (next/prev pages)
- [ ]  Search finds user by email
- [ ]  Search finds user by name
- [ ]  Filter by subscription status works
- [ ]  Click user → Opens detail page
- [ ]  Detail shows profile info
- [ ]  Detail shows subscription status
- [ ]  Detail shows progress
- [ ]  Detail shows email history

**Edge Cases:**

- [ ]  Search with no results → Message shown
- [ ]  User with no subscription → Shows "Free" status
- [ ]  User with no progress → Shows 0%
- [ ]  User not found → 404 handling

---

## Chunk 26: ⚙️ Access Override & Email Logs

**Duration:** 2-3 hours | **Prerequisites:** Chunk 25 complete (user detail exists)

### Quick Reference

|  |  |
| --- | --- |
| **Builds** | Access override toggle, email log detail view |
| **Connects** | Admin action → User update → Access check uses override |
| **Pattern** | Admin action with confirmation, audit trail |
| **Watch For** | Override vs subscription priority, audit logging |

### Context

**User Problem:** Admin needs to grant free access to specific users (partners, reviewers, comp accounts) and investigate email issues.

**From Module Brief:**

- Access override toggle (grants immediate access)
- Email logs viewable per user

### What's Changing

**New Additions:**

- Access override toggle on user detail page
- Override confirmation modal: "Grant free access to [name]?"
- Override API: `PATCH /api/admin/users/[id]/override`
- Email log expansion: Click to see full details
- Track `access_override_granted` and `access_override_revoked` events

**Modifications to Existing:**

- User detail page: Add override toggle in subscription section
- hasAccess() utility: Check accessOverride first

**No Changes To:**

- Subscription logic (override is additive)
- Email sending

### Data Flow

**Grant Override:**

1. Admin clicks "Grant Free Access" toggle
2. Confirmation modal appears
3. Admin confirms
4. PATCH to /api/admin/users/[id]/override with { accessOverride: true }
5. Update user.accessOverride = true
6. Track `access_override_granted` event with adminId
7. User immediately has full course access

**Access Check (Updated):**

1. User requests protected content
2. hasAccess(user) called
3. Check order:
    - If user.accessOverride === true → Return true (bypass subscription)
    - If subscription.status === ACTIVE → Return true
    - If subscription.status === PAST_DUE → Return true (grace period)
    - Else → Return false

### Things to Watch For

**Override Priority:**

- Issue: User has override but also expired subscription
- Manifests: Confusing state, does override still work?
- Prevention: Override always wins, clear in UI: "Access: Override (subscription expired)"

**Override Revocation:**

- Issue: Revoking override from user who relies on it
- Manifests: User suddenly locked out mid-lesson
- Prevention: Confirmation modal with warning

**Audit Trail:**

- Issue: No record of who granted override and when
- Manifests: Can't investigate access issues
- Prevention: Track events with adminId, timestamp

**Override Without Confirmation:**

- Issue: Accidental toggle click grants access
- Manifests: Unauthorized free access
- Prevention: Always require confirmation modal

**Email Log Loading:**

- Issue: User has thousands of emails, slow to load
- Manifests: Detail page slow or timeout
- Prevention: Paginate email logs, show recent 20 by default

**Email Error Details:**

- Issue: Error message too technical for admin
- Manifests: Admin can't diagnose issue
- Prevention: Show user-friendly error message, full error in expandable section

**Self-Override:**

- Issue: Admin gives themselves override
- Manifests: Admin testing, then forgets to remove
- Prevention: Allow it (useful for testing), but log it prominently

### Testing Verification

**Existing Features Still Work:**

- [ ]  Subscription-based access works
- [ ]  User detail loads correctly
- [ ]  Email logs display

**New Functionality Works:**

- [ ]  Override toggle visible on user detail
- [ ]  Click toggle → Confirmation modal
- [ ]  Confirm → Override granted, UI updates
- [ ]  User with override can access paid content
- [ ]  Revoke override → Confirmation, access removed
- [ ]  Override event logged
- [ ]  Email log rows expandable
- [ ]  Full email details visible

**Edge Cases:**

- [ ]  User with override + active subscription → Works
- [ ]  User with override + cancelled subscription → Still works
- [ ]  Revoke override from user with subscription → Still has access via subscription

### Module 7 Acceptance Tests

- [ ]  Dashboard shows user count correctly
- [ ]  Dashboard shows active subscriber count correctly
- [ ]  Dashboard shows MRR correctly (monthly + annual)
- [ ]  Dashboard shows conversion funnel (signups → activated → converted)
- [ ]  Search users → Results match query
- [ ]  Filter by subscription status → Correct users shown
- [ ]  View user detail → All data displayed
- [ ]  Toggle access override ON → User gains access immediately
- [ ]  Toggle access override OFF → User loses access (if no subscription)
- [ ]  User with no subscription or progress → Shows empty states
- [ ]  MRR calculation with mixed monthly/annual → Correct math

---

# Module 8: Polish & Launch

---

## Chunk 27: 📊 Event Verification

**Duration:** 2-3 hours | **Prerequisites:** All modules 1-7 complete

### Quick Reference

|  |  |
| --- | --- |
| **Builds** | Verification that all 14 analytics events fire correctly |
| **Connects** | User flows → Event tracking → Event table |
| **Pattern** | Integration testing, event audit |
| **Watch For** | Missing events, duplicate events, wrong properties |

### Context

**User Problem:** Analytics are only useful if the data is accurate. Missing or duplicate events lead to wrong decisions.

**From Module Brief:**

- Verify all 14 events track correctly
- Ensure event properties are populated

### What's Changing

**New Additions:**

- Event audit checklist page (internal/dev only)
- Event verification tests
- Missing event identification and fixes

**Modifications to Existing:**

- Add any missing track() calls identified during audit
- Fix any incorrect event properties

**No Changes To:**

- Event schema
- Core user flows

### Data Flow

**Event Audit Process:**

1. List all 14 required events
2. For each event, trace code path where it should fire
3. Verify track() call exists with correct event name
4. Verify properties object includes required fields
5. Test manually: Perform action, query database, verify event
6. Fix any gaps

**Required Events Checklist:**

1. `signup_started` — When signup form shown
2. `signup_completed` — After successful signup (method property)
3. `onboarding_completed` — After onboarding flow done (userType, experience)
4. `video_1_started` — When Video 1 begins playing (lessonId)
5. `video_1_completed` — When Video 1 marked complete (lessonId)
6. `paywall_viewed` — When paywall screen shown
7. `subscription_started` — After successful payment (plan)
8. `lesson_started` — When any lesson viewed (lessonId, moduleId)
9. `lesson_completed` — When lesson marked complete (lessonId, moduleId)
10. `module_completed` — When all lessons in module done (moduleId)
11. `course_completed` — When all modules done
12. `subscription_cancelled` — When user cancels (reason if captured)
13. `subscription_renewed` — When recurring payment succeeds (plan)
14. `subscription_plan_selected` — When user chooses plan at paywall (plan)

### Things to Watch For

**Event Name Typos:**

- Issue: `signup_complete` vs `signup_completed`
- Manifests: Event not counted in analytics queries
- Prevention: Use constants for event names, not strings

**Missing Properties:**

- Issue: Event fired but properties empty
- Manifests: Can't analyze by plan type, module, etc.
- Prevention: Verify each track() call includes required properties

**Duplicate Events:**

- Issue: Same event fired twice for one action
- Manifests: Inflated metrics
- Prevention: Check for multiple track() calls, React strict mode double-firing

**Server vs Client Events:**

- Issue: Sensitive events (payment) tracked on client only
- Manifests: Events missed if client JS fails
- Prevention: Payment events MUST be server-side (webhooks)

**User ID Missing:**

- Issue: Event tracked without userId
- Manifests: Can't attribute events to users
- Prevention: Always pass userId for authenticated events

**Subscription Events from Webhooks:**

- Issue: subscription_started tracked on redirect, not webhook
- Manifests: Event fires even if payment failed
- Prevention: Track subscription events only in webhook handlers

**Event Timing:**

- Issue: Event fired at wrong point in flow
- Manifests: Funnel analysis shows impossible paths
- Prevention: Map exact trigger points, test sequences

**Development Events:**

- Issue: Test events in production data
- Manifests: Skewed analytics
- Prevention: Filter by environment, or use separate DB

### Testing Verification

**All 14 Events Fire:**

- [ ]  signup_started fires on signup page load
- [ ]  signup_completed fires after successful signup
- [ ]  onboarding_completed fires after onboarding
- [ ]  video_1_started fires when Video 1 plays
- [ ]  video_1_completed fires when Video 1 marked complete
- [ ]  paywall_viewed fires when paywall shown
- [ ]  subscription_started fires from webhook only
- [ ]  lesson_started fires when lesson opens
- [ ]  lesson_completed fires when marked complete
- [ ]  module_completed fires when all lessons done
- [ ]  course_completed fires when all modules done
- [ ]  subscription_cancelled fires from webhook
- [ ]  subscription_renewed fires from webhook
- [ ]  subscription_plan_selected fires at paywall

**Properties Correct:**

- [ ]  signup_completed includes method
- [ ]  subscription events include plan
- [ ]  lesson events include lessonId and moduleId

---

## Chunk 28: ✨ Error Boundaries & Loading States

**Duration:** 2-3 hours | **Prerequisites:** Chunk 27 complete (events verified)

### Quick Reference

|  |  |
| --- | --- |
| **Builds** | Global error handling, loading skeletons, user-friendly error messages |
| **Connects** | Component errors → Error boundary → Fallback UI |
| **Pattern** | React error boundaries, Suspense loading states |
| **Watch For** | Error recovery, loading state consistency, error logging |

### Context

**User Problem:** Users should never see a blank screen or cryptic error. Every failure state should have a graceful fallback.

**From Module Brief:**

- Error boundaries and fallback UI
- Loading states throughout
- User-friendly error messages

### What's Changing

**New Additions:**

- Global error boundary component
- Page-level error boundaries
- Error fallback UI: "Something went wrong" with retry button
- Loading skeleton components for: Dashboard, Lesson, Module list, User list
- Toast notification system for action errors
- Error logging to console/service

**Modifications to Existing:**

- Wrap main layout in error boundary
- Add Suspense boundaries around async components
- Add loading skeletons to data-fetching pages
- Replace console.error with structured logging

**No Changes To:**

- Core business logic
- API routes (already have try-catch)

### Data Flow

**Error Boundary Catch:**

1. Component throws error during render
2. Error propagates to nearest error boundary
3. Error boundary catches, logs error
4. Renders fallback UI instead of broken component
5. User sees friendly message + retry option
6. Retry resets error boundary, attempts re-render

**Loading State Flow:**

1. Page with async data starts loading
2. Suspense boundary shows skeleton/spinner
3. Data loads successfully
4. Suspense reveals actual content
5. If data fails → Error boundary catches

### Things to Watch For

**Error Boundary Placement:**

- Issue: Single global boundary, entire app crashes on one error
- Manifests: User can't access any page after one component fails
- Prevention: Granular boundaries per page/section

**Error Information Leakage:**

- Issue: Stack trace shown to users
- Manifests: Security/privacy concern
- Prevention: Generic user message, detailed logging server-side only

**Loading Skeleton Mismatch:**

- Issue: Skeleton layout doesn't match actual content
- Manifests: Content "jumps" when loading completes
- Prevention: Match skeleton dimensions to actual layout

**Infinite Loading:**

- Issue: Loading state never resolves
- Manifests: User stuck on spinner forever
- Prevention: Timeout fallback, show error after X seconds

**Error Recovery:**

- Issue: Retry button doesn't actually retry
- Manifests: User keeps seeing error
- Prevention: Reset error boundary state on retry

**Toast Spam:**

- Issue: Multiple errors trigger multiple toasts
- Manifests: Screen filled with toast notifications
- Prevention: Deduplicate similar errors, queue/limit toasts

**Async Error Handling:**

- Issue: Promise rejection not caught by error boundary
- Manifests: Unhandled rejection, no fallback UI
- Prevention: Error boundaries don't catch async errors; use try-catch in data fetching

**Development vs Production:**

- Issue: Verbose errors in development, nothing in production
- Manifests: Can't debug production issues
- Prevention: Consistent logging in both, different verbosity levels

### Testing Verification

**New Functionality Works:**

- [ ]  Throw error in component → Error boundary catches
- [ ]  Error boundary shows friendly message
- [ ]  Retry button resets and re-renders
- [ ]  Loading skeletons appear during data fetch
- [ ]  Skeletons replaced when data loads
- [ ]  API error → Toast notification
- [ ]  Errors logged appropriately

**Edge Cases:**

- [ ]  Error in root component → App doesn't fully crash
- [ ]  Network timeout → Loading state resolves eventually
- [ ]  Multiple rapid errors → Doesn't spam notifications

---

## Chunk 29: ✨ Mobile & Final QA

**Duration:** 3-4 hours | **Prerequisites:** Chunk 28 complete (error handling done)

### Quick Reference

|  |  |
| --- | --- |
| **Builds** | Mobile responsiveness fixes, final QA pass, production deployment |
| **Connects** | All features → Mobile testing → Launch checklist |
| **Pattern** | Systematic QA, responsive testing, launch checklist |
| **Watch For** | Touch targets, viewport issues, production config |

### Context

**User Problem:** Users access courses on phones and tablets. The experience must work seamlessly across devices.

**From Module Brief:**

- All pages mobile responsive
- No console errors in production
- Production deployment successful
- Initial course content seeded

### What's Changing

**New Additions:**

- Mobile-specific styles where needed
- Touch-friendly adjustments
- Production environment configuration
- Initial content seeding script
- Launch checklist verification

**Modifications to Existing:**

- Fix any responsive issues found
- Remove console.log statements
- Update production environment variables

**No Changes To:**

- Core functionality (bug fixes only)
- Database schema

### Data Flow

**Mobile QA Process:**

1. Test each main flow on mobile viewport (375px)
2. Test on tablet viewport (768px)
3. Identify issues: touch targets, overflow, readability
4. Fix CSS/layout issues
5. Re-test fixed items

**Launch Checklist:**

1. All environment variables set in Vercel
2. Database migrations run on production
3. Stripe webhooks configured for production URL
4. Mailgun domain verified
5. Mux credentials set
6. Admin user created
7. Initial course content seeded
8. Custom domain configured (if applicable)
9. SSL working
10. No console errors on any page

### Things to Watch For

**Touch Target Size:**

- Issue: Buttons too small to tap accurately
- Manifests: Users mis-tap, frustration
- Prevention: Minimum 44x44px touch targets

**Horizontal Scroll:**

- Issue: Content overflows viewport width
- Manifests: Horizontal scroll on mobile
- Prevention: max-width: 100%, overflow-x: hidden on containers

**Video Player Mobile:**

- Issue: Player doesn't resize properly
- Manifests: Video cut off or tiny
- Prevention: Responsive video container (aspect-ratio or padding-bottom trick)

**Form Inputs on iOS:**

- Issue: iOS zooms in on input focus
- Manifests: Jarring zoom effect
- Prevention: font-size: 16px minimum on inputs

**Navigation Menu:**

- Issue: Desktop nav doesn't work on mobile
- Manifests: Can't navigate
- Prevention: Hamburger menu or bottom nav for mobile

**Production Environment Variables:**

- Issue: Using test keys in production
- Manifests: Payments don't work, webhooks fail
- Prevention: Double-check all keys, especially Stripe

**Webhook URL:**

- Issue: Stripe webhooks pointing to [localhost](http://localhost)
- Manifests: Payments succeed but no subscription created
- Prevention: Update webhook URL in Stripe dashboard

**Database Connection:**

- Issue: Production DB string not set
- Manifests: App crashes on load
- Prevention: Verify DATABASE_URL in Vercel environment

**Seeding Script:**

- Issue: Seed script creates duplicate content
- Manifests: Multiple Module 1s
- Prevention: Idempotent seed (check existence before create)

**Console Errors:**

- Issue: Leftover console.error from development
- Manifests: Red errors in user's console
- Prevention: Search codebase for console., remove or wrap in dev check

### Testing Verification

**Mobile Responsive:**

- [ ]  Landing page works on mobile
- [ ]  Auth pages work on mobile
- [ ]  Dashboard works on mobile
- [ ]  Lesson page works on mobile (video plays)
- [ ]  Admin pages work on mobile (or tablet minimum)
- [ ]  No horizontal scroll on any page

**Full Happy Path:**

- [ ]  New user: signup → onboarding → Video 1 → paywall → subscribe → unlock → complete lesson → complete module → celebration
- [ ]  Returning user: login → dashboard → resume → complete course
- [ ]  Payment: subscribe → billing page → update payment → cancel
- [ ]  Admin: dashboard → user list → user detail → toggle override

**Production Ready:**

- [ ]  All env vars set in Vercel
- [ ]  Production deploy successful
- [ ]  No console errors
- [ ]  Stripe webhook endpoint working
- [ ]  First email sends successfully
- [ ]  Video plays in production

### Module 8 Acceptance Tests

- [ ]  All 14 analytics events fire correctly with properties
- [ ]  No console errors in production
- [ ]  All pages mobile responsive
- [ ]  Error states show user-friendly messages
- [ ]  Loading states present where needed
- [ ]  Full happy path: signup → course complete works
- [ ]  Full payment path: subscribe → cancel → resubscribe works
- [ ]  Admin path: manage content → manage users → view analytics works
- [ ]  Production deployment successful
- [ ]  Initial course content seeded and visible

---

# Batch 2 Summary

| Module | Chunks | Hours | Acceptance Tests |
| --- | --- | --- | --- |
| 5: Progress & Engagement | 4 | 10-14 | 7 tests |
| 6: Email System | 4 | 12-16 | 12 tests |
| 7: Admin Dashboard | 3 | 8-11 | 11 tests |
| 8: Polish & Launch | 3 | 7-10 | 10 tests |
| **Total** | **14** | **34-48** | **40 tests** |

---

**Next Step:** Review chunks → Run Cursor Docs Generator → Build in Cursor