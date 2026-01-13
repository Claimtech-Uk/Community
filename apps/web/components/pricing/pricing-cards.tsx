"use client";

import { useState } from "react";
import {
  PRICE_AMOUNTS,
  formatPrice,
  calculateAnnualSavings,
} from "@/lib/stripe";

interface PricingCardsProps {
  userId?: string;
}

export function PricingCards({ userId }: PricingCardsProps) {
  const [loading, setLoading] = useState<"monthly" | "annual" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { savings, monthsFree } = calculateAnnualSavings();

  async function handleSubscribe(plan: "monthly" | "annual") {
    setLoading(plan);
    setError(null);

    // Track plan selection
    if (userId) {
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "subscription_plan_selected",
          properties: { plan },
        }),
      }).catch(() => {});
    }

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(null);
    }
  }

  // Features list for both plans
  const features = [
    "All 8 modules (64+ lessons)",
    "40+ hours of HD video",
    "Code examples & downloads",
    "Lifetime access to updates",
    "Discord community access",
    "Completion certificate",
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {error && (
        <div className="mb-6 rounded-xl glass border border-destructive/30 p-4 text-center text-destructive flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Monthly Plan */}
        <div className="relative rounded-2xl glass p-8 card-hover">
          <div className="mb-8">
            <h3 className="text-lg font-medium text-muted-foreground mb-4">
              Monthly
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold gradient-text">
                {formatPrice(PRICE_AMOUNTS.MONTHLY)}
              </span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Billed monthly. Cancel anytime.
            </p>
          </div>

          {/* Features */}
          <ul className="space-y-3 mb-8">
            {features.map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-sm">
                <svg className="w-5 h-5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-muted-foreground">{feature}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={() => handleSubscribe("monthly")}
            disabled={loading !== null}
            className="w-full rounded-xl border-2 border-primary px-6 py-3.5 font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading === "monthly" ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing...
              </span>
            ) : (
              "Get Started"
            )}
          </button>
        </div>

        {/* Annual Plan */}
        <div className="relative rounded-2xl gradient-border p-8 card-hover">
          {/* Best Value Badge */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-emerald-500 px-4 py-1.5 text-sm font-semibold text-primary-foreground shadow-glow">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
              </svg>
              Best Value
            </span>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-medium text-muted-foreground mb-4">
              Annual
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold gradient-text">
                {formatPrice(PRICE_AMOUNTS.ANNUAL)}
              </span>
              <span className="text-muted-foreground">/year</span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {formatPrice(PRICE_AMOUNTS.MONTHLY_EQUIVALENT_ANNUAL)}/mo
              </span>
              <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400">
                Save {formatPrice(savings)} ({monthsFree} months free)
              </span>
            </div>
          </div>

          {/* Features */}
          <ul className="space-y-3 mb-8">
            {features.map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-sm">
                <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={() => handleSubscribe("annual")}
            disabled={loading !== null}
            className="w-full rounded-xl bg-gradient-to-r from-primary to-emerald-500 px-6 py-3.5 font-semibold text-primary-foreground hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed btn-glow"
          >
            {loading === "annual" ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing...
              </span>
            ) : (
              `Get Started — Save ${formatPrice(savings)}`
            )}
          </button>
        </div>
      </div>

      {/* Trust badges */}
      <div className="flex flex-wrap items-center justify-center gap-8 mt-12 pt-8 border-t border-border/50">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          90-Day Money-Back Guarantee
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Secure Payment via Stripe
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Cancel Anytime
        </div>
      </div>
    </div>
  );
}
