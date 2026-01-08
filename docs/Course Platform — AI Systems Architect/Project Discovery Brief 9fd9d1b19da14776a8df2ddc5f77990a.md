# Project Discovery Brief

<aside>
✅

**Status:** Confirmed — 23 Dec 2025

</aside>

## 1. The Vision

- **Core Concept:** A self-hosted course delivery platform for AI Systems Architect — own the stack, own the credibility.
- **The North Star:** A complete learning environment where students consume structured content, track progress, and eventually get guided by AI agents (via PreCursor integration) to ship real projects.
- **Target User:**
    - **Solo builders:** Technical founders, indie hackers, PM-engineer hybrids who want to ship faster
    - **Experienced devs:** Engineers who know how to code but want to learn AI-first workflows (Cursor + Claude)
    - **Tech teams:** Development teams adopting AI tools and need a structured methodology
- **Day in the Life:**
    - *Solo:* A founder who's watched 10 tutorials but still can't ship — needs a system, not more content
    - *Team:* A dev team whose AI experiments feel chaotic — need a repeatable process everyone can follow

---

## 2. Scope Definition

### Phase 1 (The MVP)

- Hybrid content delivery (video, text, downloadables, interactive elements)
- Module/lesson structure with progress tracking
- Subscription payments (Stripe)
- Free tier (full or limited access — decision pending)
- Admin panel for content management

### Phase 2 (The Roadmap)

- PreCursor agent integration (guided building)
- Community features (discussions, Q&A)
- Team/seat pricing
- Cohort-based features (if demand emerges)
- Multi-course expansion

*Context:* Phase 2 items are NOT in MVP, but the schema should not block them.

---

## 3. The Conceptual System

### Core "Nouns"

| Entity | Description |
| --- | --- |
| **User** | Authenticated student with subscription status |
| **Course** | The single course (AI Systems Architect) |
| **Module** | Grouped container of lessons (e.g., "Discovery Phase") |
| **Lesson** | Individual content unit (video/text/interactive) |
| **Progress** | Per-user, per-lesson completion tracking |
| **Asset** | Downloadable files (prompts, templates, checklists) |

### Primary User Flow

Sign up → Subscribe (or start free) → Access course → Complete lessons → Track progress → Download assets → *(Future: Use agents to build)*

---

## 4. Success Criteria

- **Success looks like:**
    - User completes a module
    - User generates their first Project Brief (using downloaded prompts)
    - User ships their first chunk to Cursor
- **Constraints:**
    - Web-first (responsive, not native)
    - Stack: likely Next.js, Prisma, PostgreSQL, Stripe (align with existing stack)
    - No agents in MVP — PreCursor handles that layer

---

## 5. Business Model

- **How will this make money?** Subscription (monthly/annual)
- **What's free vs paid?** Free tier included — scope TBD (full trial vs limited access)
- **What does a "successful" user look like?** A user who completes the Discovery module and generates their first Project Brief — they've "gotten it."

---

## 6. Open Questions

*Questions for the next stages to answer:*

- [ ]  **Free tier scope:** Full time-limited trial vs permanently limited access?
- [ ]  **Content hosting:** Self-host video or use a provider (Mux, Bunny, Cloudflare Stream)?
- [ ]  **PreCursor integration:** Embed agents directly or link out to PreCursor app?
- [ ]  **Auth:** Clerk (aligned with other projects) or NextAuth?
- [ ]  **Interactive elements:** What does "interactive" mean in lessons? Quizzes? Embedded code editors?
- [ ]  **Team pricing:** Per-seat model for tech teams?

---

**Next Step:** Feature Architect → Master Spec