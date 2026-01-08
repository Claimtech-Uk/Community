# Growth Spec

<aside>
✅

**Status:** Confirmed — 23 Dec 2025

</aside>

## 1. Activation Strategy

**Aha Moment:** User watches the founder intro video and thinks "This is the structured system I've been missing — I need to learn this methodology."

**Time to Value:** Under 10 minutes (signup → onboarding → Video 1 complete)

**First-Run Experience:**

1. Sign up (email/password or Google OAuth)
2. Guided onboarding (name, role, goals, experience level)
3. Land on course dashboard
4. Watch Video 1: Founder intro — what you'll learn, the commitment required, the journey
5. Paywall — subscribe to continue
6. Full course access unlocked

**Why This Works:**

- Video 1 establishes trust (personal brand)
- Shows the transformation possible
- Creates desire before asking for money
- Low friction to first value

---

## 2. Monetization Strategy

**Model:** Subscription (monthly + annual)

**Pricing:**

| Plan | Price | Value Prop |
| --- | --- | --- |
| Monthly | £49/month | Flexibility, cancel anytime |
| Annual | £399/year | 2 months free (~£33/month) |

**Paywall Placement:** After Video 1 (founder intro), before rest of course content

**Free vs Paid:**

| Free | Paid |
| --- | --- |
| Video 1 (founder intro) | Full course (all modules + lessons) |
| Free downloads (lead magnets, external) | Progress tracking |
| — | Email sequences |
| — | PreCursor agent access (when integrated) |

**Upgrade Triggers:**

- Completion of Video 1 → immediate paywall
- Paywall abandonment email sequence (1hr, 24hr, 3 days)
- "PreCursor agents coming" tease throughout marketing

**Guarantee:** 90-day money-back guarantee — full refund if not satisfied with what you've learned. Bold, builds trust, shows confidence in value.

---

## 3. Retention & Engagement

### Return Triggers

| Trigger | Channel | Timing |
| --- | --- | --- |
| Welcome + next steps | Email | Immediately after signup |
| Didn't start Video 1 | Email | 24 hours after signup |
| Completed Video 1, didn't subscribe | Email sequence | 1hr, 24hr, 3 days |
| Module completed | Email + In-app celebration | On completion |
| Inactive (no login) | Email | 7 days since last activity |
| Subscription renewal reminder | Email | 3 days before renewal |
| Payment failed | Email | On failure + 3 days later |

### Paywall Abandonment Sequence

| Email | Timing | Focus |
| --- | --- | --- |
| 1 | 1 hour | "You watched the intro — here's what's waiting" |
| 2 | 24 hours | "Most people fail because they don't have a system" |
| 3 | 3 days | "Last chance: 90-day guarantee means zero risk" |

### Habit Mechanics

- **Module gating** — creates progression, unlocking dopamine
- **Progress celebrations** — share prompts, confetti, "You've completed X!"
- **PreCursor hook** — "Complete the course → early access to agents" (future)

---

## 4. Conversion Funnel

| Stage | Definition | Key Metric |
| --- | --- | --- |
| **Awareness** | Lands on site (organic, paid, referral) | Unique visitors |
| **Signup** | Creates account | Signup rate (% of visitors) |
| **Activation** | Completes onboarding + watches Video 1 | Activation rate (% of signups) |
| **Paywall View** | Sees subscription options | Paywall view rate (% of activated) |
| **Conversion** | Subscribes (monthly or annual) | Conversion rate (% of paywall views) |
| **Retention (M1)** | Still subscribed after 30 days | M1 retention rate |
| **Retention (M3)** | Still subscribed after 90 days | M3 retention rate |
| **Completion** | Finishes full course | Completion rate (% of subscribers) |

### Target Benchmarks (to validate)

| Metric | Target |
| --- | --- |
| Visitor → Signup | 5-10% |
| Signup → Activation | 70%+ |
| Activation → Conversion | 20-30% |
| M1 Retention | 85%+ |
| M3 Retention | 70%+ |

---

## 5. Trust & Credibility Signals

| Signal | Placement |
| --- | --- |
| **90-day money-back guarantee** | Paywall, pricing page, checkout |
| **Founder video intro** | Video 1, landing page |
| **"Built by a builder"** | Landing page — showcase your projects (Total View AI, etc.) |
| **Free downloads** | Lead magnets — prove value before asking for money |
| **Secure payment badges** | Checkout (Stripe badge) |
| **PreCursor coming** | Throughout — "This methodology powers real AI agents" |

### Future Trust Signals (when available)

- Student testimonials / case studies
- "X students have shipped projects using this system"
- Project showcases from students

---

## 6. Analytics Requirements

### Must-Track Events

| Event | Why It Matters |
| --- | --- |
| `signup_started` | Top of funnel |
| `signup_completed` | Signup conversion |
| `onboarding_completed` | Activation step 1 |
| `video_1_started` | Engagement signal |
| `video_1_completed` | Activation complete — ready for paywall |
| `paywall_viewed` | Conversion funnel entry |
| `subscription_started` | Revenue event |
| `subscription_plan_selected` | Monthly vs annual split |
| `lesson_started` | Engagement depth |
| `lesson_completed` | Progress tracking |
| `module_completed` | Milestone tracking |
| `course_completed` | Full completion |
| `subscription_cancelled` | Churn signal |
| `subscription_renewed` | Retention signal |

### Leading Indicators

| Metric | Predicts |
| --- | --- |
| Video 1 completion rate | Paywall conversion |
| Lessons completed in Week 1 | M1 retention |
| Module 1 completion time | Overall completion likelihood |
| Annual vs monthly split | Revenue predictability |

---

## 7. Growth Opportunities (Prioritised)

| Priority | Opportunity | Area | Status |
| --- | --- | --- | --- |
| 1 | Paywall after Video 1 (not Module 1) | Monetization | ✅ Confirmed |
| 2 | Annual pricing (£399/year) | Monetization | ✅ Confirmed |
| 3 | 90-day money-back guarantee | Trust | ✅ Confirmed |
| 4 | Founder intro video as Video 1 | Trust / Activation | ✅ Confirmed |
| 5 | Paywall abandonment email sequence | Monetization | ✅ Confirmed |
| 6 | Progress celebration moments | Retention | ✅ Confirmed |
| 7 | Core analytics events | Analytics | ✅ Confirmed |
| 8 | PreCursor integration hook | Retention / Differentiation | ✅ Pre-launch |

---

## 8. Master Spec Updates Required

*Changes needed before Technical Architecture:*

- [x]  **Section 2.2 (Subscription):** Change free tier from "Module 1" to "Video 1 only"
- [x]  **Section 2.2 (Subscription):** Add annual pricing option (£399/year)
- [x]  **Section 2.2 (Subscription):** Add 90-day money-back guarantee
- [x]  **Section 2.5 (Email Sequences):** Add paywall abandonment sequence (3 emails)
- [x]  **Section 2.4 (Progress Tracking):** Add celebration moments / share prompts
- [x]  **NEW Section:** Add Analytics Requirements with must-track events
- [x]  **Section 5 (User Flows):** Update free user flow to reflect Video 1 only

---

## Revenue Model

### Path to £40k/month

| Scenario | Monthly | Annual | Total Subs | MRR |
| --- | --- | --- | --- | --- |
| **Conservative** | 600 @ £49 | 100 @ £33 | 700 | £32,700 |
| **Target** | 650 @ £49 | 150 @ £33 | 800 | £36,800 |
| **Optimistic** | 700 @ £49 | 200 @ £33 | 900 | £41,000 |

**Key levers:**

- Push annual plans (higher LTV, predictable revenue)
- Reduce churn with progress mechanics + PreCursor hook
- Paywall abandonment sequence recovers fence-sitters

---

**Next Step:** Update Master Spec with these changes → Technical Stack Decisions