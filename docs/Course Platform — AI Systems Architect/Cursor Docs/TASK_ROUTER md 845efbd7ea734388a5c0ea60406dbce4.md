# TASK_ROUTER.md

Copy this entire page content into a file named `TASK_[ROUTER.md](http://ROUTER.md)` in your project root.

---

# Task Router

Navigation from implementation chunk to relevant documentation.

---

## Module 1: Foundation & Auth

| Chunk | Key Docs |
| --- | --- |
| 1: Database Setup | DATABASE_[SCHEMA.md](http://SCHEMA.md) → User, Account, Session |
| 2: NextAuth Config | [ARCHITECTURE.md](http://ARCHITECTURE.md) → Authentication section |
| 3: Onboarding Flow | DATABASE_[SCHEMA.md](http://SCHEMA.md) → User (onboarding fields) |
| 4: Protected Routes | .cursorrules → Security Rules |

---

## Module 2: Course Content CMS

| Chunk | Key Docs |
| --- | --- |
| 5: Content Schema | DATABASE_[SCHEMA.md](http://SCHEMA.md) → Module, Lesson, Asset |
| 6: Admin CRUD | .cursorrules → File Organisation |
| 7: Content Display | [ARCHITECTURE.md](http://ARCHITECTURE.md) → Content Strategy |
| 8: Asset Management | .cursorrules → Common Mistakes |

---

## Module 3: Video Integration

| Chunk | Key Docs |
| --- | --- |
| 9: Mux Upload | API_[CONTRACTS.md](http://CONTRACTS.md) → Mux Direct Upload |
| 10: Video Playback | API_[CONTRACTS.md](http://CONTRACTS.md) → Mux Signed URLs |

---

## Module 4: Payments & Access

| Chunk | Key Docs |
| --- | --- |
| 11: Stripe Checkout | API_[CONTRACTS.md](http://CONTRACTS.md) → Stripe Checkout |
| 12: Webhook Handlers | API_[CONTRACTS.md](http://CONTRACTS.md) → Stripe Webhooks |
| 13: Access Control | [ARCHITECTURE.md](http://ARCHITECTURE.md) → Access Control Logic |
| 14: Billing Page | API_[CONTRACTS.md](http://CONTRACTS.md) → Customer Portal |
| 15: Soft Lock UI | .cursorrules → CRITICAL RULES #1, #4 |

---

## Module 5: Progress & Engagement

| Chunk | Key Docs |
| --- | --- |
| 16: Progress Data | DATABASE_[SCHEMA.md](http://SCHEMA.md) → LessonProgress |
| 17: Completion UI | .cursorrules → CRITICAL RULES #9 |
| 18: Module Gating | [ARCHITECTURE.md](http://ARCHITECTURE.md) → Module Gating logic |
| 19: Celebrations | .cursorrules → Common Mistakes |

---

## Module 6: Email System

| Chunk | Key Docs |
| --- | --- |
| 20: Email Infra | API_[CONTRACTS.md](http://CONTRACTS.md) → Mailgun |
| 21: Queue System | DATABASE_[SCHEMA.md](http://SCHEMA.md) → EmailQueue |
| 22: Triggers | API_[CONTRACTS.md](http://CONTRACTS.md) → Email Templates |
| 23: Unsubscribe | .cursorrules → CRITICAL RULES #8 |

---

## Module 7: Admin Dashboard

| Chunk | Key Docs |
| --- | --- |
| 24: Metrics | [ARCHITECTURE.md](http://ARCHITECTURE.md) → Analytics section |
| 25: User Management | DATABASE_[SCHEMA.md](http://SCHEMA.md) → User, Subscription |
| 26: Access Override | .cursorrules → CRITICAL RULES #4 |

---

## Module 8: Polish & Launch

| Chunk | Key Docs |
| --- | --- |
| 27: Event Verification | [ARCHITECTURE.md](http://ARCHITECTURE.md) → 14 Must-Track Events |
| 28: Error Handling | .cursorrules → Security Rules |
| 29: Final QA | All docs — full review |

---

## Quick Reference

| Question | Go To |
| --- | --- |
| Check if user has access? | [ARCHITECTURE.md](http://ARCHITECTURE.md) → Access Control Logic |
| Create Stripe checkout? | API_[CONTRACTS.md](http://CONTRACTS.md) → Stripe Checkout |
| Generate video URL? | API_[CONTRACTS.md](http://CONTRACTS.md) → Mux Signed URLs |
| Send an email? | API_[CONTRACTS.md](http://CONTRACTS.md) → Mailgun |
| Track an event? | DATABASE_[SCHEMA.md](http://SCHEMA.md) → Event model |
| Check module unlock? | [ARCHITECTURE.md](http://ARCHITECTURE.md) → Module Gating |
| Handle webhook? | API_[CONTRACTS.md](http://CONTRACTS.md) → relevant service |
| Avoid common mistake? | .cursorrules → Common Mistakes |