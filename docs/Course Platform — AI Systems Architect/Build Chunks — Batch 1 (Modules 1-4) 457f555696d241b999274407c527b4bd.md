# Build Chunks — Batch 1 (Modules 1-4)

<aside>
🚧

**Status:** Generated — 23 Dec 2025

</aside>

## Overview

Implementation chunks for the foundation layer of the Course Platform.

| Module | Chunks | Est. Duration |
| --- | --- | --- |
| 1: Foundation & Auth | 4 chunks | 10-14 hrs |
| 2: Course Content CMS | 4 chunks | 10-14 hrs |
| 3: Video Integration | 2 chunks | 6-10 hrs |
| 4: Payments & Access | 5 chunks | 12-16 hrs |
| **Total** | **15 chunks** | **38-54 hrs** |

---

# Module 1: Foundation & Auth

**Feature:** Foundation & Auth

**Core Problem:** Establish database, authentication, and basic app structure

**Total Chunks:** 4

**Total Duration:** 10-14 hours

## Chunk Sequence

| Chunk | Name | Category | Duration | Prerequisites |
| --- | --- | --- | --- | --- |
| 1.1 | Database & Project Setup | 🏗️ | 2-3 hrs | None |
| 1.2 | NextAuth Integration | 🔐 | 3-4 hrs | Chunk 1.1 |
| 1.3 | Onboarding Flow | 🎨 | 3-4 hrs | Chunk 1.2 |
| 1.4 | Protected Routes & Roles | 🔐 | 2-3 hrs | Chunk 1.3 |

---

## Chunk 1.1: 🏗️ Database & Project Setup

**Duration:** 2-3 hours | **Prerequisites:** None

### Quick Reference

**Builds:** Next.js project with Prisma, PostgreSQL connection, and base schema

**Connects:** Nothing → Foundation → All future chunks

**Pattern:** Standard Next.js 14 App Router setup

**Watch For:** Neon connection pooling, Prisma generate in build, env var setup

### Context

**User Problem:** Need a working development environment before any features can be built.

**From Module Brief:**

- Database: PostgreSQL via Neon (serverless)
- ORM: Prisma with type-safe queries
- Framework: Next.js 14 with App Router

### What's Changing

**New Additions:**

- Next.js 14 project with TypeScript, Tailwind, shadcn/ui
- Prisma schema with User, Account, Session, VerificationToken, Event models
- Database connection to Neon
- Base layout and providers

**No Changes To:**

- Nothing exists yet

### Data Flow

**Project Initialisation:**

1. Create Next.js project with App Router
2. Install dependencies (Prisma, NextAuth, etc.)
3. Configure Tailwind + shadcn/ui
4. Set up Prisma schema
5. Connect to Neon database
6. Run initial migration
7. Verify connection with test query

### Things to Watch For

**Neon Connection String:**

- Issue: Using wrong connection string format
- Manifests: "Connection refused" or timeout errors
- Solution: Use pooled connection string for serverless (`?pgbouncer=true&connect_timeout=15`)

**Prisma Generate in Production:**

- Issue: Prisma Client not generated in Vercel builds
- Manifests: "PrismaClient is not defined" in production
- Solution: Add `prisma generate` to build script: `"build": "prisma generate && next build"`

**Environment Variables:**

- Issue: Missing or malformed DATABASE_URL
- Manifests: Build fails or runtime connection errors
- Solution: Verify `.env.local` has correct format, add to Vercel env vars

**Schema Enum Sync:**

- Issue: TypeScript enums don't match Prisma enums
- Manifests: Type errors when using enum values
- Solution: Import enums from `@prisma/client`, don't redefine

**Migration Naming:**

- Issue: Unclear migration names make rollbacks hard
- Manifests: Migration history is confusing
- Solution: Use descriptive names: `npx prisma migrate dev --name add_user_onboarding_fields`

**Prisma Studio Access:**

- Issue: Can't inspect data during development
- Manifests: Debugging is slow
- Solution: Run `npx prisma studio` for visual database browser

**Type Generation After Schema Changes:**

- Issue: Types out of sync after schema edits
- Manifests: TypeScript errors that don't match schema
- Solution: Always run `npx prisma generate` after schema changes

**Index Strategy:**

- Issue: Missing indexes on frequently queried fields
- Manifests: Slow queries as data grows
- Solution: Add indexes per schema design (userId, email, etc.)

### Testing Verification

**New Functionality Works:**

- [ ]  `npm run dev` starts without errors
- [ ]  Prisma connects to Neon database
- [ ]  Migration creates all tables
- [ ]  `npx prisma studio` shows tables
- [ ]  shadcn/ui components render correctly

---

## Chunk 1.2: 🔐 NextAuth Integration

**Duration:** 3-4 hours | **Prerequisites:** Chunk 1.1 (database connected, schema migrated)

### Quick Reference

**Builds:** Full authentication system with email/password and Google OAuth

**Connects:** Database → NextAuth → Session available app-wide

**Pattern:** NextAuth.js with Prisma adapter, database sessions

**Watch For:** Callback URLs, session strategy, Google OAuth setup, password hashing

### Context

**User Problem:** Users need to create accounts and log in securely.

**From Module Brief:**

- Email + password authentication
- Google OAuth provider
- Database sessions (not JWT) for revocation capability
- Session includes user role and basic info

### What's Changing

**New Additions:**

- NextAuth route handler (`/api/auth/[...nextauth]`)
- Prisma adapter configuration
- Credentials provider (email/password)
- Google OAuth provider
- Sign up page with form
- Sign in page with form
- Session provider wrapper
- Password hashing utility (bcrypt)

**Modifications:**

- User model: Add `hashedPassword` field

**No Changes To:**

- Database connection
- Base layout structure

### Data Flow

**Email/Password Sign Up:**

1. User submits email + password
2. Validate email format and password strength
3. Check if email already exists
    - If exists → Error: "Account already exists"
    - If new → Continue
4. Hash password with bcrypt (12 rounds)
5. Create User record
6. Create Session record
7. Redirect to onboarding

**Google OAuth Sign Up:**

1. User clicks "Sign in with Google"
2. Redirect to Google consent screen
3. Google returns with code
4. Exchange code for tokens
5. Get user profile from Google
6. Check if Account exists for this provider
    - If exists → Sign in, create session
    - If new → Create User + Account, create session
7. Redirect to onboarding (if new) or dashboard (if returning)

**Sign In:**

1. User submits credentials
2. Find user by email
3. Compare password hash
    - If match → Create session, redirect
    - If no match → Error: "Invalid credentials"

### Things to Watch For

**NEXTAUTH_SECRET Missing:**

- Issue: Auth fails silently or with cryptic errors
- Manifests: Sessions don't persist, OAuth callbacks fail
- Solution: Generate with `openssl rand -base64 32`, add to env

**NEXTAUTH_URL Mismatch:**

- Issue: Callback URLs don't match configured URL
- Manifests: OAuth redirect errors, especially in production
- Solution: Set to exact production URL including protocol

**Google OAuth Callback URL:**

- Issue: Google rejects callback
- Manifests: "redirect_uri_mismatch" error
- Solution: Add exact callback URL in Google Console: [`https://yourdomain.com/api/auth/callback/google`](https://yourdomain.com/api/auth/callback/google)

**Password Hashing on Wrong Layer:**

- Issue: Hashing in API route instead of before DB save
- Manifests: Passwords stored in plaintext or double-hashed
- Solution: Hash in credentials provider authorize function

**Session Strategy Confusion:**

- Issue: Using JWT when database sessions expected
- Manifests: Session data not persisting correctly
- Solution: Explicitly set `session: { strategy: "database" }`

**Credentials Provider Session Creation:**

- Issue: Credentials provider doesn't auto-create session
- Manifests: Login succeeds but user not authenticated
- Solution: Return user object from authorize, let NextAuth handle session

**OAuth Account Linking:**

- Issue: Same email, different providers creates duplicate users
- Manifests: User can't access their account
- Solution: Check email first, link account to existing user if found

**useSession on Server Components:**

- Issue: Calling useSession in server component
- Manifests: Hydration errors or undefined session
- Solution: Use `getServerSession` in server components, `useSession` in client

**Sign Out Not Clearing Session:**

- Issue: Session cookie persists after sign out
- Manifests: User appears logged in after signing out
- Solution: Use NextAuth `signOut()` function, not manual cookie clear

**bcrypt in Edge Runtime:**

- Issue: bcrypt doesn't work in Edge runtime
- Manifests: Build errors or runtime failures
- Solution: Use Node.js runtime for auth routes, or use `bcryptjs`

### Testing Verification

**New Functionality Works:**

- [ ]  Sign up with email/password creates user
- [ ]  Password is hashed in database (not plaintext)
- [ ]  Sign in with correct password succeeds
- [ ]  Sign in with wrong password fails with error
- [ ]  Google OAuth redirects to Google
- [ ]  Google OAuth callback creates user
- [ ]  Session persists across page refreshes
- [ ]  Sign out clears session

**Edge Cases:**

- [ ]  Sign up with existing email shows error
- [ ]  Google OAuth with existing email links account
- [ ]  Invalid email format rejected
- [ ]  Weak password rejected (if enforced)

---

## Chunk 1.3: 🎨 Onboarding Flow

**Duration:** 3-4 hours | **Prerequisites:** Chunk 1.2 (auth working, user can sign up)

### Quick Reference

**Builds:** Multi-step onboarding wizard capturing user context

**Connects:** Auth complete → Onboarding → Dashboard redirect

**Pattern:** Multi-step form with state persistence

**Watch For:** Partial completion handling, redirect logic, enum values

### Context

**User Problem:** Capture user context (type, goals, experience) for personalisation and analytics.

**From Module Brief:**

- 4 fields: name, userType, buildGoal, experienceLevel
- Can skip but reminded on next login
- Redirect to dashboard on completion
- Track `onboarding_completed` event

### What's Changing

**New Additions:**

- Onboarding page (`/onboarding`)
- Multi-step form component
- Step 1: Name input
- Step 2: User type selection (Solo builder / Experienced dev / Tech team)
- Step 3: Build goal (freeform text)
- Step 4: Experience level (Beginner / Intermediate / Advanced)
- API route to save onboarding data
- Onboarding completion redirect logic

**Modifications:**

- Auth callbacks: Check `onboardingComplete` on sign in, redirect if needed

**No Changes To:**

- Sign up/sign in pages
- Session structure

### Data Flow

**New User Onboarding:**

1. User completes sign up
2. Check `onboardingComplete` flag
    - If false → Redirect to `/onboarding`
    - If true → Redirect to `/dashboard`
3. User progresses through steps
4. Each step saves to local state (not DB yet)
5. On final step submit:
    - API call to update User record
    - Set `onboardingComplete = true`
    - Track `onboarding_completed` event
    - Redirect to dashboard

**Returning User (Incomplete):**

1. User signs in
2. Check `onboardingComplete` flag
3. If false → Show reminder banner on dashboard
4. User can click to resume onboarding
5. Pre-fill any previously saved fields

**Skip Onboarding:**

1. User clicks "Skip for now"
2. Redirect to dashboard
3. `onboardingComplete` stays false
4. Reminder shown on next login

### Things to Watch For

**Form State Lost on Refresh:**

- Issue: User refreshes mid-onboarding, loses progress
- Manifests: Frustration, abandonment
- Solution: Persist steps to localStorage or save each step to DB

**Enum Value Mismatch:**

- Issue: Form sends string, DB expects enum
- Manifests: Prisma throws "Invalid enum value"
- Solution: Map form values to exact Prisma enum values

**Redirect Loop:**

- Issue: Dashboard redirects to onboarding, onboarding redirects to dashboard
- Manifests: Infinite redirect, browser error
- Solution: Check `onboardingComplete` once in middleware, not in both places

**OAuth Users Missing Name:**

- Issue: Google provides name, but form still asks
- Manifests: Redundant UX
- Solution: Pre-fill name from OAuth profile, allow editing

**buildGoal Text Validation:**

- Issue: Users submit empty or very long text
- Manifests: Poor data quality or DB errors
- Solution: Set min/max length, show character count

**Step Navigation Without Validation:**

- Issue: User can skip to end without filling fields
- Manifests: Incomplete onboarding data
- Solution: Validate current step before allowing next

**Mobile Layout Issues:**

- Issue: Multi-step form looks broken on mobile
- Manifests: Buttons off-screen, text overflow
- Solution: Test responsive design, use mobile-first approach

**Event Not Tracking:**

- Issue: `onboarding_completed` event not firing
- Manifests: Analytics missing this funnel step
- Solution: Await event tracking before redirect

### Testing Verification

**New Functionality Works:**

- [ ]  New user redirected to onboarding after signup
- [ ]  All 4 steps display correctly
- [ ]  Form validation works on each step
- [ ]  Completing all steps saves to database
- [ ]  `onboardingComplete` set to true
- [ ]  User redirected to dashboard after completion
- [ ]  `onboarding_completed` event tracked

**Edge Cases:**

- [ ]  Skip onboarding → Dashboard with reminder
- [ ]  Return with incomplete → Can resume
- [ ]  OAuth user → Name pre-filled
- [ ]  Refresh mid-flow → Progress preserved (if implemented)

---

## Chunk 1.4: 🔐 Protected Routes & Roles

**Duration:** 2-3 hours | **Prerequisites:** Chunk 1.3 (onboarding complete, users exist)

### Quick Reference

**Builds:** Route protection middleware and role-based access control

**Connects:** Session → Middleware → Protected pages

**Pattern:** Next.js middleware + server-side session checks

**Watch For:** Middleware matcher config, admin role check, redirect chains

### Context

**User Problem:** Prevent unauthorized access to course content and admin areas.

**From Module Brief:**

- Public routes: `/`, `/auth/*`
- Protected routes: `/dashboard/*`, `/course/*`
- Admin-only routes: `/admin/*`
- Role stored on User model

### What's Changing

**New Additions:**

- Next.js middleware for route protection
- Admin role check utility
- Admin layout with role verification
- Unauthorized page (403)
- Basic dashboard page (placeholder)
- Basic admin page (placeholder)

**Modifications:**

- Session callback: Include user role

**No Changes To:**

- Auth configuration
- Onboarding flow

### Data Flow

**Protected Route Access:**

1. User navigates to `/dashboard`
2. Middleware intercepts request
3. Check for valid session
    - If no session → Redirect to `/auth/signin`
    - If session → Continue
4. Page renders with user context

**Admin Route Access:**

1. User navigates to `/admin`
2. Middleware checks session exists
3. Server component checks role
    - If role !== ADMIN → Redirect to `/dashboard` or show 403
    - If role === ADMIN → Render admin page

### Things to Watch For

**Middleware Running on Static Assets:**

- Issue: Middleware checks auth for images, CSS, etc.
- Manifests: Slow page loads, broken assets
- Solution: Configure matcher to exclude `/_next`, `/static`, `/favicon.ico`

**Middleware vs Server Component Checks:**

- Issue: Duplicating auth checks causes confusion
- Manifests: Inconsistent behavior, redirect loops
- Solution: Middleware for "is logged in", server components for role checks

**Session Not Available in Middleware:**

- Issue: Using wrong method to get session
- Manifests: Session always null in middleware
- Solution: Use `getToken()` from `next-auth/jwt` in middleware

**Admin Check in Client Component:**

- Issue: Role check in client component is bypassable
- Manifests: Security vulnerability
- Solution: Always verify role server-side, client check is UX only

**Redirect After Login Not Working:**

- Issue: User sent to dashboard instead of intended page
- Manifests: Poor UX on deep links
- Solution: Store `callbackUrl` in auth flow, redirect after success

**Role Not in Session:**

- Issue: Session doesn't include role by default
- Manifests: Can't check role without DB query
- Solution: Add role to session in NextAuth callbacks

**Stale Session Role:**

- Issue: User promoted to admin but session still shows USER
- Manifests: New admin can't access admin pages
- Solution: Refresh session after role change, or check DB in admin routes

**Public Pages Showing Auth UI:**

- Issue: Landing page shows loading state while checking auth
- Manifests: Flash of loading content
- Solution: Don't wrap public pages in session checks

### Testing Verification

**Existing Features Still Work:**

- [ ]  Sign up flow unchanged
- [ ]  Sign in flow unchanged
- [ ]  Onboarding flow unchanged

**New Functionality Works:**

- [ ]  Unauthenticated user can access `/`
- [ ]  Unauthenticated user redirected from `/dashboard`
- [ ]  Authenticated user can access `/dashboard`
- [ ]  USER role redirected from `/admin`
- [ ]  ADMIN role can access `/admin`

**Edge Cases:**

- [ ]  Deep link to protected page → Redirect to signin → Return to original URL
- [ ]  Session expires → Redirected to signin on next navigation

---

## Module 1 Acceptance Tests

*From Module Brief QA Criteria:*

- [ ]  Sign up with email → Account created, session active
- [ ]  Sign up with Google → Account linked, session active
- [ ]  Complete onboarding → All fields saved, redirected to dashboard
- [ ]  Skip onboarding → Reminder shown on next login
- [ ]  Login with existing account → Session restored
- [ ]  Access /admin as USER → Redirected to dashboard
- [ ]  Sign up with existing email → Error shown, redirect to login
- [ ]  Google OAuth cancelled → Return to login with message
- [ ]  Invalid password format → Validation error shown

---

---

# Module 2: Course Content CMS

**Feature:** Course Content CMS

**Core Problem:** Enable admin to create/manage course structure and display content to users

**Total Chunks:** 4

**Total Duration:** 10-14 hours

## Chunk Sequence

| Chunk | Name | Category | Duration | Prerequisites |
| --- | --- | --- | --- | --- |
| 2.1 | Content Data Layer | 📊 | 2-3 hrs | Module 1 complete |
| 2.2 | Admin CMS Interface | 🎨 | 3-4 hrs | Chunk 2.1 |
| 2.3 | User Course Display | 🎨 | 3-4 hrs | Chunk 2.2 |
| 2.4 | Asset Management | ⚙️ | 2-3 hrs | Chunk 2.3 |

---

## Chunk 2.1: 📊 Content Data Layer

**Duration:** 2-3 hours | **Prerequisites:** Module 1 complete (auth, database working)

### Quick Reference

**Builds:** CRUD operations for Module, Lesson, Asset models

**Connects:** Database → Data layer → API routes

**Pattern:** Prisma queries with server actions or API routes

**Watch For:** Ordering logic, cascade deletes, published state filtering

### Context

**User Problem:** Need a data foundation for course content before building UI.

**From Module Brief:**

- Module: title, description, order, published
- Lesson: title, content (TipTap JSON), order, published, isFree
- Asset: file metadata, attached to lesson

### What's Changing

**New Additions:**

- Module CRUD functions (create, read, update, delete, reorder)
- Lesson CRUD functions (create, read, update, delete, reorder)
- Asset CRUD functions (create, read, delete)
- Query functions: getPublishedModules, getModuleWithLessons, getLessonWithAssets
- Reorder utility for drag-drop

**No Changes To:**

- User/auth models
- Existing API routes

### Data Flow

**Create Module:**

1. Admin submits module data
2. Get current max order value
3. Create module with order = max + 1
4. Return created module

**Reorder Modules:**

1. Admin drags module to new position
2. Receive array of module IDs in new order
3. Update each module's order field in transaction
4. Return success

**Get Published Content (User):**

1. Query modules where published = true
2. Order by order field
3. For each module, include lessons where published = true
4. Order lessons by order field
5. Return nested structure

### Things to Watch For

**Order Gaps After Delete:**

- Issue: Deleting item leaves gaps in order sequence
- Manifests: Ordering logic breaks or looks wrong
- Solution: Resequence remaining items after delete, or accept gaps

**Cascade Delete Not Working:**

- Issue: Deleting module leaves orphan lessons
- Manifests: Foreign key errors or orphan data
- Solution: Configure `onDelete: Cascade` in Prisma schema

**Transaction for Reorder:**

- Issue: Partial reorder if one update fails
- Manifests: Items in wrong order, data inconsistent
- Solution: Wrap all order updates in `prisma.$transaction`

**N+1 Queries:**

- Issue: Querying lessons separately for each module
- Manifests: Slow page loads as content grows
- Solution: Use Prisma `include` for eager loading

**Published Filter Leaking:**

- Issue: Admin queries accidentally filtering by published
- Manifests: Admin can't see unpublished content
- Solution: Separate queries for admin (all) vs user (published only)

**TipTap JSON Validation:**

- Issue: Invalid JSON stored in content field
- Manifests: Render errors on lesson page
- Solution: Validate JSON structure before save

### Testing Verification

**New Functionality Works:**

- [ ]  Create module → Returns module with ID
- [ ]  Create lesson in module → Lesson linked to module
- [ ]  Update module title → Change persisted
- [ ]  Delete module → Module and lessons removed
- [ ]  Reorder modules → New order persisted
- [ ]  Get published modules → Only returns published

---

## Chunk 2.2: 🎨 Admin CMS Interface

**Duration:** 3-4 hours | **Prerequisites:** Chunk 2.1 (data layer complete)

### Quick Reference

**Builds:** Admin UI for managing modules and lessons

**Connects:** Data layer → Admin pages → CRUD operations

**Pattern:** Server components with client interactivity for forms/drag-drop

**Watch For:** Optimistic updates, form validation, TipTap integration

### Context

**User Problem:** Admin needs to create and organize course content without touching code.

**From Module Brief:**

- CRUD for modules and lessons
- Drag-drop reordering
- TipTap rich text editor for lesson content
- Preview before publish

### What's Changing

**New Additions:**

- Admin content page (`/admin/content`)
- Module list with create/edit/delete
- Lesson list within module view
- Module form (create/edit)
- Lesson form with TipTap editor
- Drag-drop reorder component
- Publish/unpublish toggle
- Preview mode

**No Changes To:**

- Data layer functions
- Public routes

### Data Flow

**Create Lesson with Rich Content:**

1. Admin opens lesson form
2. Fills title, sets isFree flag
3. Types content in TipTap editor
4. Clicks save
5. TipTap exports JSON
6. API saves lesson with content JSON
7. UI updates with new lesson

**Drag-Drop Reorder:**

1. Admin drags lesson to new position
2. Client updates UI immediately (optimistic)
3. Send new order to API
    - If success → Done
    - If error → Revert UI, show error

### Things to Watch For

**TipTap Bundle Size:**

- Issue: TipTap adds significant JS to bundle
- Manifests: Slow page load in admin
- Solution: Dynamic import TipTap only on lesson edit page

**TipTap Extensions:**

- Issue: Missing extensions for needed formatting
- Manifests: Can't add code blocks, images, etc.
- Solution: Install required extensions upfront: StarterKit, CodeBlock, Image, Link

**Drag-Drop Library Choice:**

- Issue: Some libraries don't work well with React 18
- Manifests: Hydration errors, janky animations
- Solution: Use `@dnd-kit/core` (modern, React 18 compatible)

**Optimistic Update Rollback:**

- Issue: UI updated but API fails, no rollback
- Manifests: UI shows wrong state until refresh
- Solution: Implement proper rollback on error

**Form Submission Without Validation:**

- Issue: Empty titles or invalid content saved
- Manifests: Broken content display
- Solution: Validate required fields before submit

**Unsaved Changes Warning:**

- Issue: Admin navigates away with unsaved edits
- Manifests: Lost work, frustration
- Solution: Prompt before navigation if form is dirty

**Long Content Performance:**

- Issue: Very long lessons slow down editor
- Manifests: Typing lag in TipTap
- Solution: Test with realistic content, consider pagination

### Testing Verification

**New Functionality Works:**

- [ ]  Admin can create new module
- [ ]  Admin can edit module title/description
- [ ]  Admin can delete module
- [ ]  Admin can create lesson in module
- [ ]  Admin can edit lesson with TipTap
- [ ]  Drag-drop reorders modules
- [ ]  Drag-drop reorders lessons within module
- [ ]  Publish toggle changes published state
- [ ]  Preview shows lesson as user would see it

**Edge Cases:**

- [ ]  Long TipTap content saves correctly
- [ ]  Delete module with lessons shows confirmation
- [ ]  Reorder with only one item (no crash)

---

## Chunk 2.3: 🎨 User Course Display

**Duration:** 3-4 hours | **Prerequisites:** Chunk 2.2 (content exists to display)

### Quick Reference

**Builds:** User-facing course dashboard, module view, lesson view

**Connects:** Published content → User pages → Display

**Pattern:** Server components fetching published content

**Watch For:** Gating logic placeholders, empty states, TipTap render

### Context

**User Problem:** Users need to browse and view course content.

**From Module Brief:**

- Course dashboard with all modules
- Module view with lesson list
- Lesson view with text content
- Video 1 (isFree) accessible to all
- Module gating (skeleton only — enforced in Module 5)

### What's Changing

**New Additions:**

- Course dashboard page (`/dashboard`)
- Module list component
- Module detail page (`/course/[moduleId]`)
- Lesson list component
- Lesson detail page (`/course/[moduleId]/[lessonId]`)
- TipTap content renderer
- Empty states for no content
- isFree indicator on lessons

**Modifications:**

- Dashboard page: Replace placeholder with real content

**No Changes To:**

- Admin CMS
- Auth flow

### Data Flow

**View Course Dashboard:**

1. User navigates to `/dashboard`
2. Fetch all published modules with lesson counts
3. Render module cards with progress placeholder (0%)
4. User clicks module → Navigate to module page

**View Lesson:**

1. User navigates to lesson page
2. Fetch lesson with content
3. Check if lesson isFree or user has access (placeholder: always allow for now)
    - If allowed → Render content
    - If not → Show paywall placeholder
4. Render TipTap JSON to HTML
5. Show video placeholder (actual player in Module 3)

### Things to Watch For

**TipTap JSON to HTML:**

- Issue: Using wrong renderer for TipTap JSON
- Manifests: Content doesn't display or looks wrong
- Solution: Use `generateHTML` from `@tiptap/html` with same extensions

**Missing Extensions in Renderer:**

- Issue: Editor has extensions renderer doesn't
- Manifests: Some content blocks don't render
- Solution: Same extension list for editor and renderer

**Empty Module Handling:**

- Issue: Module with no published lessons
- Manifests: Blank page or error
- Solution: Show "Content coming soon" message

**URL Structure:**

- Issue: Using IDs vs slugs in URLs
- Manifests: URLs aren't shareable or SEO-friendly
- Solution: Use IDs for MVP, add slugs in Phase 2

**Access Check Placeholder:**

- Issue: Forgetting to add real access checks later
- Manifests: Content accessible without subscription
- Solution: Add clear TODO comments, check in Module 4

**Layout Shift:**

- Issue: Content pops in after load
- Manifests: Jarring UX, layout shift
- Solution: Use loading skeletons with correct dimensions

### Testing Verification

**Existing Features Still Work:**

- [ ]  Auth flow unchanged
- [ ]  Admin CMS unchanged

**New Functionality Works:**

- [ ]  Dashboard shows all published modules
- [ ]  Module page shows lessons in correct order
- [ ]  Lesson page renders TipTap content correctly
- [ ]  isFree lessons show indicator
- [ ]  Unpublished content not visible to users

**Edge Cases:**

- [ ]  Module with no lessons → "Coming soon" message
- [ ]  Invalid module ID → 404 page
- [ ]  Invalid lesson ID → 404 page

---

## Chunk 2.4: ⚙️ Asset Management

**Duration:** 2-3 hours | **Prerequisites:** Chunk 2.3 (lessons exist to attach assets)

### Quick Reference

**Builds:** File upload for lesson assets, download display for users

**Connects:** Vercel Blob → Asset records → Lesson display

**Pattern:** Direct upload to Vercel Blob, store URL in database

**Watch For:** File size limits, mime type validation, signed URLs

### Context

**User Problem:** Lessons need downloadable resources (prompts, templates, PDFs).

**From Module Brief:**

- Upload assets to lessons (admin)
- Display download links (user)
- Store files in Vercel Blob

### What's Changing

**New Additions:**

- File upload component (admin)
- Vercel Blob integration
- Asset list in admin lesson view
- Asset upload API route
- Asset delete functionality
- Download links on user lesson page
- File type icons

**Modifications:**

- Lesson page: Add assets section
- Admin lesson form: Add asset management

**No Changes To:**

- TipTap content
- Module/lesson CRUD

### Data Flow

**Upload Asset:**

1. Admin selects file in lesson edit
2. Client uploads to Vercel Blob (via API route)
3. Blob returns URL
4. Create Asset record with URL, filename, size, type
5. Link to lesson
6. UI updates with new asset

**Delete Asset:**

1. Admin clicks delete on asset
2. Confirm deletion
3. Delete from Vercel Blob
4. Delete Asset record
5. UI updates

**User Downloads:**

1. User views lesson page
2. Assets section shows available downloads
3. User clicks download
4. Browser downloads file from Blob URL

### Things to Watch For

**File Size Limits:**

- Issue: Large files fail to upload
- Manifests: Timeout errors, failed uploads
- Solution: Set reasonable limit (10MB), show error for large files

**Vercel Blob Token:**

- Issue: Missing or invalid `BLOB_READ_WRITE_TOKEN`
- Manifests: Upload fails with auth error
- Solution: Generate token in Vercel dashboard, add to env

**MIME Type Spoofing:**

- Issue: User uploads executable disguised as PDF
- Manifests: Security risk
- Solution: Validate MIME type server-side, allowlist extensions

**Orphan Blob Files:**

- Issue: Asset record deleted but file remains
- Manifests: Storage costs increase
- Solution: Delete from Blob before deleting record

**Blob URL Expiration:**

- Issue: URLs expire and downloads break
- Manifests: Download links stop working
- Solution: Vercel Blob URLs don't expire by default, verify this

**Upload Progress:**

- Issue: No feedback during large uploads
- Manifests: User thinks upload failed, retries
- Solution: Show progress bar during upload

**Concurrent Uploads:**

- Issue: Uploading multiple files at once fails
- Manifests: Some files don't save
- Solution: Queue uploads or handle multiple correctly

### Testing Verification

**Existing Features Still Work:**

- [ ]  Lesson content editing unchanged
- [ ]  Lesson display unchanged

**New Functionality Works:**

- [ ]  Admin can upload file to lesson
- [ ]  Upload progress shown
- [ ]  Asset appears in lesson edit
- [ ]  Admin can delete asset
- [ ]  User sees download links on lesson
- [ ]  Download works correctly

**Edge Cases:**

- [ ]  Large file (>10MB) shows error
- [ ]  Invalid file type rejected
- [ ]  Delete lesson → Assets deleted (cascade)

---

## Module 2 Acceptance Tests

*From Module Brief QA Criteria:*

- [ ]  Create module → Appears in admin list
- [ ]  Create lesson in module → Appears under module
- [ ]  Upload asset to lesson → Download link works
- [ ]  Publish module → Visible to users
- [ ]  Unpublish module → Hidden from users
- [ ]  Reorder lessons → New order persisted
- [ ]  Delete module with lessons → Cascade deletes lessons
- [ ]  Upload large file (>10MB) → Appropriate handling
- [ ]  TipTap content with images → Renders correctly

---

---

# Module 3: Video Integration (Mux)

**Feature:** Video Integration

**Core Problem:** Enable video upload, secure playback, and streaming

**Total Chunks:** 2

**Total Duration:** 6-10 hours

## Chunk Sequence

| Chunk | Name | Category | Duration | Prerequisites |
| --- | --- | --- | --- | --- |
| 3.1 | Mux Upload & Webhooks | 🔌 | 3-5 hrs | Module 2 complete |
| 3.2 | Video Player & Signed URLs | 🎨 | 3-5 hrs | Chunk 3.1 |

---

## Chunk 3.1: 🔌 Mux Upload & Webhooks

**Duration:** 3-5 hours | **Prerequisites:** Module 2 complete (lessons exist)

### Quick Reference

**Builds:** Mux direct upload from admin, webhook handler for processing

**Connects:** Admin upload → Mux → Webhook → Database update

**Pattern:** Direct upload with webhook confirmation

**Watch For:** Webhook signature verification, upload URL expiration, asset states

### Context

**User Problem:** Admin needs to upload videos that are processed and stored securely.

**From Module Brief:**

- Mux direct upload from admin
- Webhook handler for `video.asset.ready`
- Store `muxAssetId`, `muxPlaybackId`, `videoDuration` on Lesson

### What's Changing

**New Additions:**

- Mux SDK integration
- Upload URL generation endpoint
- Video upload component (admin)
- Webhook handler (`/api/webhooks/mux`)
- Upload progress UI
- Processing state display

**Modifications:**

- Lesson model: muxAssetId, muxPlaybackId, videoDuration fields (already in schema)
- Admin lesson form: Add video upload section

**No Changes To:**

- Lesson text content
- Asset (file) management

### Data Flow

**Video Upload:**

1. Admin clicks "Upload video" on lesson
2. Request upload URL from Mux API
3. Mux returns direct upload URL (expires in 1 hour)
4. Client uploads video directly to Mux
5. Show upload progress
6. On complete, store temporary asset ID
7. Update lesson with muxAssetId (status: processing)
8. UI shows "Processing..."

**Webhook: video.asset.ready:**

1. Mux sends webhook to `/api/webhooks/mux`
2. Verify webhook signature
3. Extract asset ID, playback ID, duration
4. Find lesson by muxAssetId
5. Update lesson with muxPlaybackId, videoDuration
6. Video now ready for playback

### Things to Watch For

**Webhook Signature Verification:**

- Issue: Not verifying webhook authenticity
- Manifests: Security vulnerability, fake webhooks
- Solution: Use Mux SDK `Mux.Webhooks.verifyHeader`

**Webhook Not Reaching Local Dev:**

- Issue: Mux can't reach [localhost](http://localhost)
- Manifests: Uploads complete but video never ready
- Solution: Use ngrok or Mux CLI for local testing

**Upload URL Expiration:**

- Issue: User takes too long, URL expires
- Manifests: Upload fails partway through
- Solution: Generate fresh URL just before upload, show expiration warning

**Asset ID vs Playback ID:**

- Issue: Confusing which ID to use where
- Manifests: Wrong ID used, playback fails
- Solution: Asset ID for management, Playback ID for viewing

**Video Processing Time:**

- Issue: Large videos take minutes to process
- Manifests: Admin waits, thinks it's broken
- Solution: Show clear "Processing" state, don't block UI

**Webhook Retry Handling:**

- Issue: Webhook delivered multiple times
- Manifests: Duplicate processing, errors
- Solution: Make handler idempotent (check if already processed)

**Missing Environment Variables:**

- Issue: MUX_TOKEN_ID or MUX_TOKEN_SECRET not set
- Manifests: Mux API calls fail with auth error
- Solution: Verify all 4 Mux env vars are set

**Large Video Upload Timeout:**

- Issue: Very large videos (>1GB) time out
- Manifests: Upload fails, no error
- Solution: Use chunked upload, show progress, handle resume

### Testing Verification

**New Functionality Works:**

- [ ]  Request upload URL succeeds
- [ ]  Video uploads to Mux with progress
- [ ]  Lesson shows "Processing" state
- [ ]  Webhook received and verified
- [ ]  Lesson updated with playbackId and duration
- [ ]  Video ready state shown in admin

**Edge Cases:**

- [ ]  Upload cancelled → Cleanup handled
- [ ]  Webhook fails verification → Rejected with 401
- [ ]  Duplicate webhook → Handled gracefully

### Reference Links

- Mux Direct Uploads: [https://docs.mux.com/guides/direct-upload](https://docs.mux.com/guides/direct-upload)
- Mux Webhooks: [https://docs.mux.com/guides/listen-for-webhooks](https://docs.mux.com/guides/listen-for-webhooks)

---

## Chunk 3.2: 🎨 Video Player & Signed URLs

**Duration:** 3-5 hours | **Prerequisites:** Chunk 3.1 (videos uploaded and ready)

### Quick Reference

**Builds:** Secure video playback with signed URLs and player component

**Connects:** Lesson → Signed URL → Player → Playback

**Pattern:** Server-generated signed URLs, client-side player

**Watch For:** URL expiration handling, player library choice, isFree logic

### Context

**User Problem:** Users need to watch course videos securely.

**From Module Brief:**

- Signed URL generation (1 hour expiry)
- Mux Player or native HLS
- Video 1 = free (isFree flag)
- No video for locked content

### What's Changing

**New Additions:**

- Signed URL generation utility
- Video player component
- Player integration on lesson page
- Video locked state UI
- isFree video access logic

**Modifications:**

- Lesson page: Add video player above content

**No Changes To:**

- Video upload flow
- Mux webhooks

### Data Flow

**Video Playback (Allowed):**

1. User navigates to lesson page
2. Server checks access (isFree OR has subscription — placeholder for now)
3. If allowed, generate signed playback URL
    - Include playback ID
    - Set expiration to 1 hour
    - Sign with Mux signing key
4. Return signed URL to client
5. Player loads and streams video

**Video Playback (Locked):**

1. User navigates to lesson page
2. Server checks access
3. If not allowed, return locked state
4. Show locked video placeholder with paywall prompt

**URL Expiration During Playback:**

1. User watching long video
2. URL expires mid-playback
3. Player requests new segment
4. Request fails (URL expired)
5. Trigger URL refresh
6. Continue playback with new URL

### Things to Watch For

**Signing Key Format:**

- Issue: Using wrong format for private key
- Manifests: Signature generation fails
- Solution: Use base64-encoded private key, not PEM

**Token Expiration Too Short:**

- Issue: URL expires before video finishes
- Manifests: Playback stops partway through
- Solution: Set expiration to 1 hour minimum, handle refresh

**Player Bundle Size:**

- Issue: Mux Player adds significant JS
- Manifests: Slow page loads
- Solution: Lazy load player component, or use lighter HLS.js

**HLS vs Mux Player:**

- Issue: Native HLS doesn't work on all browsers
- Manifests: Video won't play on some devices
- Solution: Use Mux Player (handles compatibility) or HLS.js polyfill

**Signed URL Exposed in Client:**

- Issue: URL visible in network tab
- Manifests: URL could be shared (but expires)
- Solution: Accept this risk, 1-hour expiry limits damage

**isFree Check Location:**

- Issue: Checking isFree only on client
- Manifests: Security bypass possible
- Solution: Check isFree server-side before generating signed URL

**No Video on Lesson:**

- Issue: Lesson without video shows broken player
- Manifests: Error or blank space
- Solution: Only render player if muxPlaybackId exists

**Video Autoplay:**

- Issue: Video autoplays unexpectedly
- Manifests: Poor UX, audio surprise
- Solution: Don't autoplay, require user interaction

**Mobile Fullscreen:**

- Issue: Fullscreen doesn't work on mobile
- Manifests: Poor mobile experience
- Solution: Test fullscreen on iOS Safari and Android Chrome

### UX Specification

**User Flow:**

1. Navigate to lesson → See video player at top
2. Click play → Video starts
3. Use controls (play/pause, seek, volume, fullscreen)
4. Video ends → Show next lesson prompt

**Loading State:**

- Show skeleton with play button overlay
- Player appears when ready

**Error State:**

- "Video unavailable. Please try again."
- Retry button

**Locked State:**

- Blurred thumbnail or grey placeholder
- Lock icon overlay
- "Subscribe to watch" button

### Testing Verification

**Existing Features Still Work:**

- [ ]  Lesson text content displays
- [ ]  Asset downloads work

**New Functionality Works:**

- [ ]  Video player appears on lesson with video
- [ ]  Signed URL generated successfully
- [ ]  Video plays without buffering issues
- [ ]  Free video (isFree=true) playable without subscription
- [ ]  Controls work (play, pause, seek, fullscreen)

**Edge Cases:**

- [ ]  Lesson without video → No player shown
- [ ]  Expired URL → Refresh and continue
- [ ]  Video processing → "Processing" message shown

---

## Module 3 Acceptance Tests

*From Module Brief QA Criteria:*

- [ ]  Upload video → Processing state shown
- [ ]  Video ready → Player appears on lesson
- [ ]  Play video → Streams without buffering issues
- [ ]  Signed URL expired → New URL fetched automatically
- [ ]  Upload cancelled mid-way → Cleanup handled
- [ ]  Very long video (>1hr) → Uploads successfully

---

---

# Module 4: Payments & Access Control

**Feature:** Payments & Access Control

**Core Problem:** Gate content behind subscription paywall with Stripe

**Total Chunks:** 5

**Total Duration:** 12-16 hours

## Chunk Sequence

| Chunk | Name | Category | Duration | Prerequisites |
| --- | --- | --- | --- | --- |
| 4.1 | Stripe Setup & Products | 🔌 | 2-3 hrs | Module 1 complete |
| 4.2 | Checkout Flow | ⚙️ | 3-4 hrs | Chunk 4.1 |
| 4.3 | Webhook Handlers | 🔌 | 3-4 hrs | Chunk 4.2 |
| 4.4 | Access Control Logic | ⚙️ | 2-3 hrs | Chunk 4.3 |
| 4.5 | Billing Portal & UI | 🎨 | 2-3 hrs | Chunk 4.4 |

---

## Chunk 4.1: 🔌 Stripe Setup & Products

**Duration:** 2-3 hours | **Prerequisites:** Module 1 complete (users exist)

### Quick Reference

**Builds:** Stripe SDK integration, products/prices configured

**Connects:** Stripe Dashboard → SDK → Application

**Pattern:** Stripe SDK with environment-based keys

**Watch For:** Test vs live mode, price IDs, webhook endpoint setup

### Context

**User Problem:** Foundation for payment processing before checkout can be built.

**From Module Brief:**

- Monthly: £49/month
- Annual: £399/year
- Stripe Checkout and Customer Portal

### What's Changing

**New Additions:**

- Stripe SDK installation and configuration
- Stripe client utility
- Products and prices created in Stripe Dashboard
- Price ID constants
- Stripe types

**No Changes To:**

- User model (Subscription model already in schema)
- Auth flow

### Data Flow

**Stripe Setup:**

1. Install `stripe` package
2. Create Stripe client with secret key
3. Configure test mode for development
4. Create product in Stripe Dashboard
5. Create monthly price (£49/month recurring)
6. Create annual price (£399/year recurring)
7. Store price IDs in environment variables
8. Configure webhook endpoint URL

### Things to Watch For

**Test Mode vs Live Mode:**

- Issue: Using live keys in development
- Manifests: Real charges, compliance issues
- Solution: Prefix check on keys (`sk_test_` vs `sk_live_`)

**Price ID Hardcoding:**

- Issue: Price IDs hardcoded instead of env vars
- Manifests: Wrong prices in production
- Solution: Use `STRIPE_PRICE_MONTHLY` and `STRIPE_PRICE_ANNUAL` env vars

**Currency Mismatch:**

- Issue: Prices in wrong currency
- Manifests: User sees wrong amount
- Solution: Create prices in GBP, verify in dashboard

**Webhook Endpoint Not Configured:**

- Issue: Forgetting to add webhook URL in Stripe
- Manifests: Payments work but subscriptions not created
- Solution: Add webhook URL now, even if handler not built yet

**API Version:**

- Issue: Using old Stripe API version
- Manifests: Deprecated fields, unexpected behavior
- Solution: Pin to recent stable version in Stripe client

### Testing Verification

**New Functionality Works:**

- [ ]  Stripe SDK initializes without error
- [ ]  Can fetch products from Stripe API
- [ ]  Can fetch prices from Stripe API
- [ ]  Test mode keys being used in development

---

## Chunk 4.2: ⚙️ Checkout Flow

**Duration:** 3-4 hours | **Prerequisites:** Chunk 4.1 (Stripe configured, prices exist)

### Quick Reference

**Builds:** Stripe Checkout session creation, success/cancel handling

**Connects:** Paywall → Checkout Session → Stripe → Redirect back

**Pattern:** Server-side session creation, Stripe-hosted checkout

**Watch For:** Metadata for user linking, success URL params, cancel handling

### Context

**User Problem:** Users need to subscribe after completing Video 1.

**From Module Brief:**

- Paywall after Video 1
- Plan selection (monthly/annual)
- Stripe Checkout redirect
- Success redirect to course

### What's Changing

**New Additions:**

- Paywall component/page
- Plan selection UI
- Checkout session API route
- Success page
- Cancel handling (return to paywall)

**No Changes To:**

- Stripe configuration
- User model

### Data Flow

**Subscribe Flow:**

1. User completes Video 1 → Sees paywall
2. User selects plan (monthly or annual)
3. Click "Subscribe"
4. API creates Stripe Checkout Session
    - Customer email from user
    - Selected price ID
    - Success URL with session ID
    - Cancel URL back to paywall
    - Metadata: userId
5. Redirect to Stripe Checkout
6. User enters payment details
7. Stripe processes payment
8. Redirect to success URL
9. Success page shows confirmation
10. Webhook creates subscription (next chunk)

**Cancel/Back:**

1. User clicks back or closes Checkout
2. Stripe redirects to cancel URL
3. User returns to paywall
4. Can try again

### Things to Watch For

**Missing userId in Metadata:**

- Issue: Can't link Stripe customer to user
- Manifests: Subscription created but not linked
- Solution: Always include `userId` in checkout session metadata

**Customer Already Exists:**

- Issue: Creating new customer for existing subscriber
- Manifests: Duplicate Stripe customers
- Solution: Check for existing stripeCustomerId, reuse if exists

**Success URL Without Verification:**

- Issue: Success page accessible directly
- Manifests: Users bookmark success page, see false success
- Solution: Verify session ID param, check payment status

**Annual Price Display:**

- Issue: Showing £399 without context
- Manifests: Looks expensive compared to £49
- Solution: Show monthly equivalent (£33/mo) and savings (2 months free)

**Checkout Session Expiration:**

- Issue: Session expires before user completes
- Manifests: Payment fails with expired session
- Solution: Sessions expire in 24 hours by default, acceptable

**Mobile Checkout:**

- Issue: Poor experience on mobile
- Manifests: Hard to complete payment
- Solution: Stripe Checkout is mobile-optimized, test it

**Back Button After Success:**

- Issue: User clicks back, sees checkout again
- Manifests: Confusing UX
- Solution: Success page replaces history, or check subscription status

### UX Specification

**Paywall Page:**

- Headline: What they'll get
- Two plan cards: Monthly (£49) and Annual (£399, show savings)
- 90-day guarantee callout
- "Subscribe" button per plan
- Social proof / testimonials if available

**Loading State:**

- "Redirecting to checkout..." with spinner

**Success State:**

- Celebration (confetti)
- "Welcome! You now have full access"
- "Continue to course" button

### Testing Verification

**New Functionality Works:**

- [ ]  Paywall displays after Video 1
- [ ]  Both plans displayed with correct prices
- [ ]  Click subscribe → Checkout session created
- [ ]  Redirect to Stripe Checkout works
- [ ]  Stripe Checkout displays correct price
- [ ]  Cancel → Return to paywall
- [ ]  Success → Success page displayed

**Edge Cases:**

- [ ]  Already subscribed user → Show "Already subscribed"
- [ ]  Invalid price ID → Error handled gracefully

---

## Chunk 4.3: 🔌 Webhook Handlers

**Duration:** 3-4 hours | **Prerequisites:** Chunk 4.2 (checkout creates sessions)

### Quick Reference

**Builds:** Stripe webhook handlers for subscription lifecycle events

**Connects:** Stripe Events → Webhook → Database updates

**Pattern:** Signature verification, event routing, idempotent handlers

**Watch For:** Signature verification, event types, idempotency, error handling

### Context

**User Problem:** Subscription status must stay in sync with Stripe.

**From Module Brief:**

- `checkout.session.completed` → Create subscription
- `invoice.paid` → Extend access
- `invoice.payment_failed` → Soft lock
- `customer.subscription.deleted` → Revoke access

### What's Changing

**New Additions:**

- Webhook endpoint (`/api/webhooks/stripe`)
- Signature verification
- Event handlers for each event type
- Subscription record creation/update logic
- Event tracking for subscription events

**Modifications:**

- Subscription model: Now populated via webhooks

**No Changes To:**

- Checkout flow
- Stripe configuration

### Data Flow

**checkout.session.completed:**

1. Stripe sends webhook
2. Verify signature with webhook secret
3. Extract session data
4. Get userId from metadata
5. Get customer ID and subscription ID from session
6. Create Subscription record
    - Status: ACTIVE
    - Plan: from price ID
    - Period start/end: from subscription
7. Track `subscription_started` event

**invoice.paid:**

1. Stripe sends webhook
2. Verify signature
3. Get subscription ID from invoice
4. Find Subscription record
5. Update currentPeriodEnd from invoice
6. Set status to ACTIVE (in case was PAST_DUE)
7. Track `subscription_renewed` event

**invoice.payment_failed:**

1. Stripe sends webhook
2. Verify signature
3. Get subscription ID from invoice
4. Find Subscription record
5. Set status to PAST_DUE
6. Set paymentFailedAt timestamp
7. (Email sent in Module 6)

**customer.subscription.deleted:**

1. Stripe sends webhook
2. Verify signature
3. Get subscription ID
4. Find Subscription record
5. Set status to CANCELLED
6. Set cancelledAt timestamp
7. Track `subscription_cancelled` event

### Things to Watch For

**Webhook Signature Verification:**

- Issue: Not verifying webhook authenticity
- Manifests: Security vulnerability
- Solution: Use `stripe.webhooks.constructEvent()` with webhook secret

**Raw Body Requirement:**

- Issue: Body parser modifies request body
- Manifests: Signature verification fails
- Solution: Disable body parser for webhook route, use raw body

**Event Order:**

- Issue: Events arrive out of order
- Manifests: subscription.deleted before checkout.completed
- Solution: Handle gracefully, check if record exists

**Idempotency:**

- Issue: Same event processed multiple times
- Manifests: Duplicate records, incorrect data
- Solution: Store event ID, skip if already processed, or use upsert

**Missing Subscription in Database:**

- Issue: Event references subscription not yet created
- Manifests: Error, event lost
- Solution: For invoice events, create subscription if missing

**Test Webhook Secret:**

- Issue: Using wrong webhook secret for environment
- Manifests: All webhooks fail verification
- Solution: Different secrets for test and live, use correct one

**Webhook Timeout:**

- Issue: Handler takes too long, Stripe retries
- Manifests: Duplicate processing attempts
- Solution: Return 200 quickly, process async if needed

**Price ID to Plan Mapping:**

- Issue: Hardcoding price ID checks
- Manifests: Breaks if price IDs change
- Solution: Map price IDs to plans in config, not inline

**customer.subscription.updated:**

- Issue: Not handling plan changes
- Manifests: User upgrades but record not updated
- Solution: Handle this event too, update plan and status

### Testing Verification

**New Functionality Works:**

- [ ]  Webhook signature verified correctly
- [ ]  checkout.session.completed creates subscription
- [ ]  Subscription has correct status, plan, period
- [ ]  invoice.paid updates period end
- [ ]  invoice.payment_failed sets PAST_DUE
- [ ]  customer.subscription.deleted sets CANCELLED
- [ ]  Events tracked for each action

**Edge Cases:**

- [ ]  Duplicate event → Handled without error
- [ ]  Invalid signature → Rejected with 401
- [ ]  Unknown event type → Logged, return 200

### Reference Links

- Stripe Webhook Best Practices: [https://stripe.com/docs/webhooks/best-practices](https://stripe.com/docs/webhooks/best-practices)
- Stripe Webhook Events: [https://stripe.com/docs/api/events/types](https://stripe.com/docs/api/events/types)

---

## Chunk 4.4: ⚙️ Access Control Logic

**Duration:** 2-3 hours | **Prerequisites:** Chunk 4.3 (subscriptions exist in database)

### Quick Reference

**Builds:** Access check logic, soft lock UI, admin override

**Connects:** Subscription status → Access check → Content gating

**Pattern:** Server-side access verification, UI state based on access

**Watch For:** Race conditions, cache invalidation, override logic

### Context

**User Problem:** Gate content based on subscription status, allow admin overrides.

**From Module Brief:**

- Active subscription → Full access
- Past due → Soft lock (see structure, content locked)
- Cancelled → Access until period end
- Admin can override access per user

### What's Changing

**New Additions:**

- `hasAccess()` utility function
- Access check middleware/wrapper
- Soft lock UI component
- Payment update banner
- Admin access override toggle
- Override UI in admin user detail

**Modifications:**

- User model: `accessOverride` field (already in schema)
- Lesson page: Add access check before content
- Video player: Block if no access

**No Changes To:**

- Subscription model
- Webhook handlers

### Data Flow

**Access Check:**

1. User requests protected content
2. Call `hasAccess(user)`
3. Check in order:
    - If `accessOverride === true` → Access granted
    - If subscription status === ACTIVE → Access granted
    - If subscription status === PAST_DUE → Access granted (soft lock UI)
    - If subscription cancelled but `currentPeriodEnd > now` → Access granted
    - Else → Access denied
4. Return access state + reason

**Soft Lock Display:**

1. User with PAST_DUE visits course
2. Access check returns `softLock: true`
3. Content visible but banner shown
4. Banner: "Payment failed. Update your payment method to continue."
5. Link to billing page

**Admin Override:**

1. Admin views user in admin panel
2. Toggles "Grant free access"
3. API updates user.accessOverride = true
4. User immediately has access
5. To revoke: Toggle off

### Things to Watch For

**Period End Timezone:**

- Issue: Comparing dates without timezone awareness
- Manifests: Access cut off at wrong time
- Solution: Store and compare in UTC

**Caching Access State:**

- Issue: Access cached, user subscribes but still blocked
- Manifests: User complains they paid but can't access
- Solution: Don't cache access checks, or invalidate on subscription change

**Override Without Logging:**

- Issue: No record of who granted override when
- Manifests: Can't audit free access grants
- Solution: Log override changes with timestamp and admin ID

**isFree Bypass:**

- Issue: Access check blocks isFree content
- Manifests: Video 1 not accessible to new users
- Solution: Check isFree BEFORE subscription access

**Soft Lock Content Leak:**

- Issue: Content visible in page source even when locked
- Manifests: Users can see content without paying
- Solution: Don't render locked content server-side

**Double Access Check:**

- Issue: Checking access in middleware AND component
- Manifests: Inconsistent behavior, performance hit
- Solution: Check once, pass result down

**Grace Period After Cancel:**

- Issue: Access cut immediately on cancel
- Manifests: User loses access mid-billing period
- Solution: Check `currentPeriodEnd`, not just status

### Testing Verification

**Existing Features Still Work:**

- [ ]  Free video (Video 1) still accessible
- [ ]  Auth flow unchanged

**New Functionality Works:**

- [ ]  Active subscription → Full content access
- [ ]  No subscription → Paywall shown
- [ ]  Past due → Access with soft lock banner
- [ ]  Cancelled + period remaining → Access continues
- [ ]  Cancelled + period ended → Access denied
- [ ]  Admin override → Access regardless of subscription
- [ ]  Remove override → Access based on subscription

**Edge Cases:**

- [ ]  User with override and subscription → Access (no issues)
- [ ]  Period end exactly now → Handle boundary correctly

---

## Chunk 4.5: 🎨 Billing Portal & UI

**Duration:** 2-3 hours | **Prerequisites:** Chunk 4.4 (access logic complete)

### Quick Reference

**Builds:** In-app billing page, Stripe Customer Portal integration

**Connects:** User → Billing page → Stripe Portal → Return

**Pattern:** Server-side portal session creation, embedded UI for status

**Watch For:** Portal configuration, return URL, status display accuracy

### Context

**User Problem:** Users need to view subscription status, update payment, and cancel.

**From Module Brief:**

- Current plan & status
- Next billing date
- Invoice history (via portal)
- Update payment method (via portal)
- Cancel subscription (via portal)

### What's Changing

**New Additions:**

- Billing page (`/dashboard/billing`)
- Subscription status display
- Customer Portal redirect endpoint
- "Manage subscription" button
- "Update payment" button
- Reactivate prompt for cancelled users

**No Changes To:**

- Subscription model
- Webhook handlers

### Data Flow

**View Billing Page:**

1. User navigates to `/dashboard/billing`
2. Fetch subscription record
3. Display:
    - Plan: Monthly or Annual
    - Status: Active, Past Due, Cancelled
    - Next billing date (or cancellation date)
    - Amount per period
4. Show action buttons based on status

**Open Customer Portal:**

1. User clicks "Manage subscription"
2. API creates Stripe billing portal session
    - Customer ID from subscription
    - Return URL back to billing page
3. Redirect to Stripe portal
4. User updates payment / cancels / views invoices
5. Stripe redirects back
6. Page reflects any changes (via webhook)

**Cancel Subscription:**

1. User clicks "Cancel" in portal
2. Stripe sets cancel_at_period_end
3. Webhook updates subscription record
4. Billing page shows "Cancelling on [date]"
5. Access continues until period end

### Things to Watch For

**Portal Configuration:**

- Issue: Portal doesn't show expected features
- Manifests: User can't update payment or cancel
- Solution: Configure portal in Stripe Dashboard with desired features

**No Stripe Customer Yet:**

- Issue: User views billing but never subscribed
- Manifests: Can't create portal session
- Solution: Show "No subscription" state, prompt to subscribe

**Return URL Mismatch:**

- Issue: Portal redirects to wrong page
- Manifests: User lost after portal
- Solution: Use absolute URL with correct domain

**Stale Subscription Display:**

- Issue: User cancels but page shows active
- Manifests: Confusion about status
- Solution: Fetch fresh subscription data, don't cache

**Cancel vs Cancel at Period End:**

- Issue: Showing cancelled when it's cancel_at_period_end
- Manifests: User thinks access is gone
- Solution: Distinguish "cancelling" from "cancelled"

**Invoice History:**

- Issue: Users want to see invoices in-app
- Manifests: Feature requests
- Solution: Stripe portal shows invoices, accept for MVP

**Resubscribe Flow:**

- Issue: Cancelled user wants to resubscribe
- Manifests: Can they use checkout again?
- Solution: Yes, new checkout session, link to existing customer

### UX Specification

**Active Subscription:**

- Status badge: "Active" (green)
- Plan name and price
- "Renews on [date]"
- "Manage subscription" button

**Past Due:**

- Status badge: "Past Due" (red)
- Warning message
- "Update payment method" button (prominent)
- "Manage subscription" button

**Cancelling:**

- Status badge: "Cancelling" (yellow)
- "Access until [date]"
- "Reactivate" option (via portal)

**No Subscription:**

- "No active subscription"
- "Subscribe now" button → Paywall

### Testing Verification

**Existing Features Still Work:**

- [ ]  Dashboard accessible
- [ ]  Access control unchanged

**New Functionality Works:**

- [ ]  Billing page shows correct status
- [ ]  Billing page shows correct plan
- [ ]  Billing page shows next billing date
- [ ]  "Manage subscription" opens portal
- [ ]  Portal return URL works
- [ ]  Cancel in portal → Status updates
- [ ]  Update payment in portal → Card updates

**Edge Cases:**

- [ ]  No subscription → Subscribe prompt shown
- [ ]  Just subscribed → Status reflects immediately (after webhook)

---

## Module 4 Acceptance Tests

*From Module Brief QA Criteria:*

- [ ]  Subscribe monthly → Subscription active, content unlocked
- [ ]  Subscribe annual → Subscription active, content unlocked
- [ ]  Cancel subscription → Access continues until period end
- [ ]  Period ends after cancel → Access revoked
- [ ]  Update payment method → Card updated in Stripe
- [ ]  View billing page → Shows correct status and invoices
- [ ]  Payment fails → Status = PAST_DUE, soft lock shown
- [ ]  Update payment after failure → Access restored
- [ ]  Webhook delivered out of order → Handled correctly
- [ ]  User already subscribed clicks subscribe → Shown existing subscription
- [ ]  Full flow: signup → onboarding → Video 1 → paywall → subscribe → full access
- [ ]  Stripe test mode webhooks fire correctly

---

---

# Batch 1 Summary

## Total Chunks: 15

| Module | Chunks | Hours |
| --- | --- | --- |
| 1: Foundation & Auth | 4 | 10-14 |
| 2: Course Content CMS | 4 | 10-14 |
| 3: Video Integration | 2 | 6-10 |
| 4: Payments & Access | 5 | 12-16 |
| **Total** | **15** | **38-54** |

## Build Order

```
1.1 → 1.2 → 1.3 → 1.4 (Foundation complete)
    ↓
2.1 → 2.2 → 2.3 → 2.4 (Content complete)
    ↓
3.1 → 3.2 (Video complete)

(Can parallel with 2.x after 1.4:)
4.1 → 4.2 → 4.3 → 4.4 → 4.5 (Payments complete)
```

## Parallelisation

After Module 1 is complete:

- **Modules 2 and 4 can be built in parallel**
- Module 3 must wait for Module 2

---

**Next Step:** Run Batch 2 (Modules 5-8) through Build Chunk Generator