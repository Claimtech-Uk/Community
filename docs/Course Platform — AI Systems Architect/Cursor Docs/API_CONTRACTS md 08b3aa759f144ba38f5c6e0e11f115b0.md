# API_CONTRACTS.md

Copy this entire page content into a file named `API_[CONTRACTS.md](http://CONTRACTS.md)` in your project root.

---

# External API Contracts

## Stripe

### Products & Prices

| Product | Price ID | Amount | Interval |
| --- | --- | --- | --- |
| AI Systems Architect | price_monthly_xxx | 4900 | month |
| AI Systems Architect | price_annual_xxx | 39900 | year |

### Checkout Session

**Create:**

```
POST /v1/checkout/sessions
{
  mode: 'subscription',
  customer: stripeCustomerId || undefined,
  customer_email: [user.email](http://user.email) (if no customer),
  line_items: [{ price: priceId, quantity: 1 }],
  success_url: APP_URL/dashboard?session_id={CHECKOUT_SESSION_ID},
  cancel_url: APP_URL/pricing,
  metadata: { userId: [user.id](http://user.id) }
}
```

### Webhooks to Handle

| Event | Action |
| --- | --- |
| checkout.session.completed | Create Subscription record, link stripeCustomerId |
| invoice.paid | Update currentPeriodEnd, set status ACTIVE |
| invoice.payment_failed | Set status PAST_DUE, set paymentFailedAt, trigger emails |
| customer.subscription.updated | Sync status, plan changes |
| customer.subscription.deleted | Set status CANCELLED |

**Webhook Signature Verification:**

```tsx
const event = stripe.webhooks.constructEvent(
  body,
  signature,
  STRIPE_WEBHOOK_SECRET
);
```

### Customer Portal

**Create Session:**

```
POST /v1/billing_portal/sessions
{
  customer: stripeCustomerId,
  return_url: APP_URL/dashboard/billing
}
```

---

## Mux

### Direct Upload (Admin)

**Create Upload URL:**

```
POST /video/v1/uploads
{
  new_asset_settings: {
    playback_policy: ['signed'],
    encoding_tier: 'baseline'
  },
  cors_origin: APP_URL
}
→ Returns: { url: 'upload-url', id: 'upload-id' }
```

Client uploads directly to returned URL.

### Webhooks

| Event | Action |
| --- | --- |
| video.asset.ready | Update Lesson with muxAssetId, muxPlaybackId, videoDuration |
| video.asset.errored | Log error, notify admin |

### Signed Playback URL

**Generate:**

```tsx
const token = Mux.JWT.signPlaybackId(playbackId, {
  keyId: MUX_SIGNING_KEY,
  keySecret: MUX_SIGNING_KEY_PRIVATE,
  expiration: '1h'
});
const url = `[https://stream.mux.com/${playbackId}.m3u8?token=${token}`](https://stream.mux.com/${playbackId}.m3u8?token=${token}`);
```

**Constraints:**

- Token expires in 1 hour
- Generate fresh on each lesson load
- Never cache or store signed URLs

---

## Mailgun

### Send Email

```
POST /v3/{domain}/messages
{
  from: 'AI Systems Architect <[noreply@yourdomain.com](mailto:noreply@yourdomain.com)>',
  to: [user.email](http://user.email),
  subject: 'Welcome to AI Systems Architect',
  html: renderedTemplate,
  text: plainTextVersion
}
```

### Email Templates

| Template | Type | Trigger |
| --- | --- | --- |
| WELCOME | Transactional | Signup |
| START_JOURNEY | Marketing | 24hr no Video 1 |
| ABANDONMENT_1 | Marketing | 1hr after Video 1, no sub |
| ABANDONMENT_2 | Marketing | 24hr after Video 1, no sub |
| ABANDONMENT_3 | Marketing | 3 days after Video 1, no sub |
| MODULE_COMPLETE | Marketing | Module completion |
| INACTIVE_NUDGE | Marketing | 7 days inactive |
| RENEWAL_REMINDER | Transactional | 3 days before renewal |
| PAYMENT_FAILED | Transactional | Immediate on failure |
| PAYMENT_FAILED_FINAL | Transactional | 3 days after first failure |

**Marketing vs Transactional:**

- Marketing: Respect marketingOptOut flag
- Transactional: ALWAYS send (payment, auth related)

---

## Vercel Cron

### Email Queue Processor

**Endpoint:** `POST /api/cron/process-emails`

**Schedule:** Every 5 minutes

**Authentication:** Verify header `Authorization: Bearer ${CRON_SECRET}`

**Process:**

1. Query EmailQueue WHERE status=PENDING AND scheduledFor <= now
2. Limit to 100 per run
3. For each: check user state, send if appropriate, update status
4. Log batch completion