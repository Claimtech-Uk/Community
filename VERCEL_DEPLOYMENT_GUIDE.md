# Vercel Deployment Guide - Community Platform

## ✅ Build Status
The project builds successfully locally. All TypeScript errors have been resolved.

## 🚀 Deployment Steps

### 1. Environment Variables (CRITICAL)

Add these environment variables in your Vercel Project Settings → Environment Variables:

#### **Database (Required)**
```bash
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
DIRECT_URL="postgresql://user:password@host:5432/database?sslmode=require"
```

#### **Authentication (Required)**
```bash
# Generate with: openssl rand -base64 32
AUTH_SECRET="your-auth-secret-here"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-your-secret"
```

#### **Stripe Payments (Required)**
```bash
STRIPE_SECRET_KEY="sk_test_..." # or sk_live_...
STRIPE_PUBLISHABLE_KEY="pk_test_..." # or pk_live_...
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_MONTHLY_PRICE_ID="price_..."
STRIPE_ANNUAL_PRICE_ID="price_..."
```

#### **Mux Video (Required)**
```bash
MUX_TOKEN_ID="your-mux-token-id"
MUX_TOKEN_SECRET="your-mux-token-secret"
MUX_SIGNING_KEY_ID="your-signing-key-id"
MUX_SIGNING_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
MUX_WEBHOOK_SECRET="your-webhook-secret"
```

#### **AWS S3 (Required)**
```bash
AWS_ACCESS_KEY_ID="AKIA..."
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="eu-west-2"
AWS_S3_BUCKET="your-bucket-name"
```

#### **Mailgun Email (Required)**
```bash
MAILGUN_API_KEY="key-..."
MAILGUN_DOMAIN="your-domain.com"
```

#### **Application (Required)**
```bash
NEXT_PUBLIC_APP_URL="https://your-project.vercel.app"
```

#### **Cron Jobs (Required)**
```bash
# Generate with: openssl rand -base64 32
CRON_SECRET="your-cron-secret"
```

### 2. Project Settings

#### Build Configuration
- **Framework Preset:** Next.js
- **Root Directory:** `apps/web`
- **Build Command:** `cd ../.. && npm install && npm run build --workspace=@repo/web`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

#### Environment Variables Scope
Set all environment variables for:
- ✅ Production
- ✅ Preview  
- ✅ Development

### 3. Turbo Configuration

The `turbo.json` has been updated to include all required environment variables:

```json
{
  "env": [
    "AUTH_SECRET",
    "DATABASE_URL",
    "DIRECT_URL",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "MAILGUN_API_KEY",
    "MAILGUN_DOMAIN",
    "STRIPE_SECRET_KEY",
    "STRIPE_PUBLISHABLE_KEY",
    "STRIPE_MONTHLY_PRICE_ID",
    "STRIPE_ANNUAL_PRICE_ID",
    "MUX_TOKEN_ID",
    "MUX_TOKEN_SECRET",
    "MUX_SIGNING_KEY_ID",
    "MUX_SIGNING_PRIVATE_KEY",
    "MUX_WEBHOOK_SECRET",
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "AWS_REGION",
    "AWS_S3_BUCKET",
    "NEXT_PUBLIC_APP_URL"
  ]
}
```

### 4. Post-Deployment Setup

After successful deployment:

#### a. Database Migration
```bash
# Run from the packages/database directory
npx prisma migrate deploy
```

#### b. Configure Webhooks

**Stripe Webhooks:**
- URL: `https://your-domain.vercel.app/api/webhooks/stripe`
- Events: `checkout.session.completed`, `customer.subscription.*`

**Mux Webhooks:**
- URL: `https://your-domain.vercel.app/api/webhooks/mux`
- Events: `video.asset.ready`, `video.upload.asset_created`

#### c. Verify Cron Job
- Navigate to Vercel Dashboard → Cron Jobs
- Verify `/api/cron/process-emails` is scheduled for `*/5 * * * *`

### 5. Common Issues & Solutions

#### Build Error: "Cannot find module '@prisma/client'"
**Solution:** Run Prisma generate during build
```bash
cd packages/database && npx prisma generate
```

#### Build Error: "auth() cannot be called during build"
**Solution:** Already fixed! Pages using `auth()` now have `export const dynamic = 'force-dynamic'`

#### Build Error: "Parameter 'm' implicitly has an 'any' type"
**Solution:** Already fixed! TypeScript strict mode issues resolved

#### Runtime Error: "Prisma Client not initialized"
**Solution:** Ensure `DATABASE_URL` and `DIRECT_URL` are set in Vercel

### 6. Verification Checklist

After deployment, verify:

- [ ] Homepage loads successfully
- [ ] Sign in with Google works
- [ ] Database connections work
- [ ] Environment variables are accessible
- [ ] Stripe checkout redirects correctly
- [ ] Mux video player loads
- [ ] Email sending works (check logs)
- [ ] File uploads to S3 work
- [ ] Cron job executes successfully

## 🔧 Troubleshooting

### Check Build Logs
```bash
# In Vercel Dashboard
Deployments → Click deployment → Building
```

### Check Runtime Logs
```bash
# In Vercel Dashboard
Deployments → Click deployment → Runtime Logs
```

### Test Environment Variables
Create a test API route:
```typescript
// apps/web/app/api/test-env/route.ts
export async function GET() {
  return Response.json({
    hasDatabase: !!process.env.DATABASE_URL,
    hasAuth: !!process.env.AUTH_SECRET,
    hasStripe: !!process.env.STRIPE_SECRET_KEY,
    hasMux: !!process.env.MUX_TOKEN_ID,
    hasAWS: !!process.env.AWS_ACCESS_KEY_ID,
    hasMailgun: !!process.env.MAILGUN_API_KEY,
  });
}
```

## 📞 Support

If deployment continues to fail:
1. Check build logs for specific errors
2. Verify all environment variables are set
3. Ensure database is accessible from Vercel
4. Check that OAuth redirect URLs include Vercel domain

---

**Last Updated:** January 2026
**Build Status:** ✅ Passing locally
**Deployment Status:** Ready for Vercel
