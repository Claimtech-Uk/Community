import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { PricingCards } from "@/components/pricing";
import { trackEvent, EVENTS } from "@/lib/tracking";
import { checkUserAccess } from "@/lib/access";

// FAQs
const faqs = [
  {
    question: "Is the first module really free?",
    answer: "Yes! Module 1 is completely free with no credit card required. You'll get full access to all lessons, code examples, and resources in the first module to see if the course is right for you.",
  },
  {
    question: "What if I'm not satisfied?",
    answer: "We offer a 90-day money-back guarantee. If you're not completely satisfied with the course, just reach out and we'll give you a full refund, no questions asked.",
  },
  {
    question: "Do I get lifetime access?",
    answer: "Yes! Once you subscribe, you get lifetime access to all current content plus any future updates. Your access never expires, even if you cancel your subscription later.",
  },
  {
    question: "Can I switch between monthly and annual?",
    answer: "Absolutely. You can switch your plan at any time. If you upgrade from monthly to annual, we'll prorate the difference. If you downgrade, the change takes effect at your next billing cycle.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, debit cards, Apple Pay, and Google Pay through our secure payment processor Stripe. We don't store your payment details.",
  },
  {
    question: "Is there a team or enterprise plan?",
    answer: "Yes! Contact us for team pricing with bulk discounts, centralized billing, and admin dashboards. We offer custom solutions for teams of 5 or more.",
  },
];

// Comparison table
const features = [
  { name: "Module 1 - Foundations", free: true, paid: true },
  { name: "Modules 2-8 - Full Course", free: false, paid: true },
  { name: "HD Video Lessons", free: "Limited", paid: true },
  { name: "Code Examples & Downloads", free: "Limited", paid: true },
  { name: "Future Updates", free: false, paid: true },
  { name: "Discord Community", free: false, paid: true },
  { name: "Priority Support", free: false, paid: true },
  { name: "Completion Certificate", free: false, paid: true },
];

// Testimonials
const testimonials = [
  {
    quote: "Worth every penny. The depth of content is incredible.",
    name: "Alex Rivera",
    role: "ML Engineer @ Meta",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
  },
  {
    quote: "Finally understand how to ship AI to production.",
    name: "Priya Sharma",
    role: "Senior Developer @ Stripe",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face",
  },
  {
    quote: "The best investment I've made in my career.",
    name: "James Chen",
    role: "CTO @ StartupXYZ",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
  },
];

export default async function PricingPage() {
  const session = await auth();

  // If user is already subscribed, redirect to dashboard
  if (session?.user) {
    const accessInfo = await checkUserAccess(session.user.id);
    if (accessInfo.hasAccess) {
      redirect("/dashboard");
    }
    
    // Track page view
    await trackEvent({
      userId: session.user.id,
      event: EVENTS.PAYWALL_VIEWED,
      properties: { source: "pricing_page" },
    });
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">AI</span>
              </div>
              <span className="font-semibold text-lg">Systems Architect</span>
            </Link>
            
            <div className="flex items-center gap-4">
              {session?.user ? (
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/auth/signin"
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="stagger-children">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-sm text-muted-foreground">90-Day Money-Back Guarantee</span>
            </div>
            
            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Invest in Your <span className="gradient-text">AI Career</span>
            </h1>
            
            {/* Subheadline */}
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
              Get complete access to all 8 modules, 64+ lessons, code examples, and lifetime updates. 
              Start free, upgrade when you&apos;re ready.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="relative pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <PricingCards userId={session?.user?.id} />
        </div>
      </section>

      {/* Mini Testimonials */}
      <section className="py-16 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="p-6 rounded-2xl glass text-center">
                <div className="flex justify-center mb-3">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <p className="text-muted-foreground text-sm mb-4">&quot;{testimonial.quote}&quot;</p>
                <div className="flex items-center justify-center gap-3">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <div className="text-left">
                    <div className="text-sm font-medium">{testimonial.name}</div>
                    <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/30 to-transparent" />
        
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 stagger-children">
            <h2 className="text-3xl font-bold mb-4">Free vs Pro</h2>
            <p className="text-muted-foreground">
              See what you get with each plan
            </p>
          </div>
          
          <div className="rounded-2xl glass overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-medium">Feature</th>
                  <th className="p-4 font-medium text-center w-24">Free</th>
                  <th className="p-4 font-medium text-center w-24">
                    <span className="gradient-text">Pro</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature, i) => (
                  <tr key={i} className={i < features.length - 1 ? "border-b border-border/50" : ""}>
                    <td className="p-4 text-sm">{feature.name}</td>
                    <td className="p-4 text-center">
                      {feature.free === true ? (
                        <svg className="w-5 h-5 text-emerald-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : feature.free === false ? (
                        <svg className="w-5 h-5 text-muted-foreground/50 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      ) : (
                        <span className="text-xs text-muted-foreground">{feature.free}</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {feature.paid === true ? (
                        <svg className="w-5 h-5 text-emerald-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-xs text-muted-foreground">{feature.paid}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-20 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 stagger-children">
            <h2 className="text-3xl font-bold mb-4">Everything You Get</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              A complete toolkit to master AI systems architecture
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "🎬", title: "64+ HD Lessons", desc: "40+ hours of content" },
              { icon: "💻", title: "Code Examples", desc: "Production-ready code" },
              { icon: "📥", title: "Downloads", desc: "Templates & resources" },
              { icon: "🔄", title: "Lifetime Updates", desc: "All future content" },
              { icon: "💬", title: "Discord Community", desc: "Network with peers" },
              { icon: "📧", title: "Priority Support", desc: "Direct email access" },
              { icon: "🏆", title: "Certificate", desc: "Show your skills" },
              { icon: "⚡", title: "Early Access", desc: "New modules first" },
            ].map((item, i) => (
              <div key={i} className="p-5 rounded-xl glass text-center card-hover">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/30 to-transparent" />
        
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 stagger-children">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">
              Got questions? We&apos;ve got answers.
            </p>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="group rounded-xl glass overflow-hidden"
              >
                <summary className="flex items-center justify-between p-5 cursor-pointer list-none font-medium hover:bg-muted/30 transition-colors">
                  {faq.question}
                  <svg className="w-5 h-5 text-muted-foreground group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 pb-5 text-muted-foreground text-sm">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl glass-strong p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-emerald-500/10" />
            
            <div className="relative stagger-children">
              <h2 className="text-3xl font-bold mb-4">
                Start Learning Today
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                Join 10,000+ engineers who are building the future with AI. 
                First module is free — no credit card required.
              </p>
              
              <Link
                href={session?.user ? "/dashboard" : "/auth/signup"}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-lg hover:opacity-90 transition-all btn-glow"
              >
                {session?.user ? "Go to Dashboard" : "Get Started Free"}
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">AI</span>
              </div>
              <span className="font-semibold">Systems Architect</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Contact</Link>
            </div>
            
            <div className="text-sm text-muted-foreground">
              © 2026 AI Systems Architect
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
