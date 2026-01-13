import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { checkUserAccess } from "@/lib/access";
import { formatPrice, PRICE_AMOUNTS } from "@/lib/stripe";
import { ManageSubscriptionButton } from "./manage-subscription-button";

export default async function BillingPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const access = await checkUserAccess(session.user.id);
  const { subscription } = access;

  const periodEnd = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass-strong border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-14">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 stagger-children">
          <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
          <p className="text-muted-foreground mt-1">
            Manage your subscription and billing details
          </p>
        </div>

        <div className="grid gap-6">
          {/* Subscription Status Card */}
          <div className="rounded-2xl glass-strong p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-emerald-500/5" />
            
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Subscription Status</h2>
                {subscription && <StatusBadge status={subscription.status} />}
              </div>

              {!subscription || access.reason === "no_access" ? (
                // No subscription
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No Active Subscription</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Subscribe to get full access to all 64+ lessons, downloadable resources, and lifetime updates.
                  </p>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all btn-glow"
                  >
                    View Plans
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              ) : (
                // Has subscription
                <div className="space-y-4">
                  {/* Plan info */}
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl glass">
                      <div className="text-sm text-muted-foreground mb-1">Current Plan</div>
                      <div className="text-xl font-bold gradient-text">
                        {subscription.plan === "ANNUAL" ? "Annual" : "Monthly"}
                      </div>
                    </div>
                    <div className="p-4 rounded-xl glass">
                      <div className="text-sm text-muted-foreground mb-1">Price</div>
                      <div className="text-xl font-bold">
                        {formatPrice(
                          subscription.plan === "ANNUAL"
                            ? PRICE_AMOUNTS.ANNUAL
                            : PRICE_AMOUNTS.MONTHLY
                        )}
                        <span className="text-sm font-normal text-muted-foreground">
                          /{subscription.plan === "ANNUAL" ? "year" : "month"}
                        </span>
                      </div>
                    </div>
                    {periodEnd && (
                      <div className="p-4 rounded-xl glass">
                        <div className="text-sm text-muted-foreground mb-1">
                          {subscription.status === "CANCELLED" ? "Access until" : "Next billing"}
                        </div>
                        <div className="text-xl font-bold">{periodEnd}</div>
                      </div>
                    )}
                  </div>

                  {/* Access override indicator */}
                  {access.reason === "override" && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-emerald-400">Complimentary Access</div>
                        <div className="text-sm text-emerald-400/70">Full access granted by admin</div>
                      </div>
                    </div>
                  )}

                  {/* Soft lock warning */}
                  {access.softLock && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-amber-400">Payment Method Issue</div>
                        <div className="text-sm text-amber-400/70">Please update your payment method to continue uninterrupted access</div>
                      </div>
                    </div>
                  )}

                  {/* Manage button */}
                  <div className="pt-4 border-t border-border/50">
                    <ManageSubscriptionButton />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* What's included */}
          {subscription && (
            <div className="rounded-2xl glass p-6">
              <h2 className="text-lg font-semibold mb-4">What&apos;s Included</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  "All 8 modules (64+ lessons)",
                  "40+ hours of HD video",
                  "Code examples & downloads",
                  "Lifetime access to updates",
                  "Discord community access",
                  "Priority email support",
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Help */}
          <div className="rounded-2xl glass p-6">
            <h2 className="text-lg font-semibold mb-4">Need Help?</h2>
            <p className="text-sm text-muted-foreground mb-4">
              If you have any billing questions or issues, please contact our support team.
            </p>
            <a
              href="mailto:support@example.com"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              support@example.com
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: string | null }) {
  if (!status) return null;

  const styles: Record<string, { bg: string; text: string; dot: string }> = {
    ACTIVE: { bg: "bg-emerald-500/20", text: "text-emerald-400", dot: "bg-emerald-400" },
    PAST_DUE: { bg: "bg-amber-500/20", text: "text-amber-400", dot: "bg-amber-400" },
    CANCELLED: { bg: "bg-red-500/20", text: "text-red-400", dot: "bg-red-400" },
  };

  const labels: Record<string, string> = {
    ACTIVE: "Active",
    PAST_DUE: "Past Due",
    CANCELLED: "Cancelled",
  };

  const style = styles[status] || { bg: "bg-muted", text: "text-muted-foreground", dot: "bg-muted-foreground" };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {labels[status] || status}
    </span>
  );
}
