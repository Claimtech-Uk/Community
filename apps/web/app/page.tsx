import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";

// Force dynamic rendering to enable auth() at runtime
export const dynamic = 'force-dynamic';

// Feature data
const features = [
  {
    icon: "🧠",
    title: "System Architecture",
    description: "Design scalable AI systems from first principles with production-ready patterns.",
  },
  {
    icon: "⚡",
    title: "Real-Time Processing",
    description: "Build streaming pipelines that handle millions of events per second.",
  },
  {
    icon: "🔒",
    title: "Enterprise Security",
    description: "Implement authentication, authorization, and data protection at scale.",
  },
  {
    icon: "📊",
    title: "Advanced Analytics",
    description: "Create dashboards and metrics that drive business decisions.",
  },
  {
    icon: "🚀",
    title: "Deployment Mastery",
    description: "Ship to production with CI/CD, Docker, and Kubernetes.",
  },
  {
    icon: "💡",
    title: "Best Practices",
    description: "Learn battle-tested patterns from real-world AI applications.",
  },
];

// Testimonials
const testimonials = [
  {
    name: "Sarah Chen",
    role: "Senior ML Engineer",
    company: "Google",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    quote: "This course transformed how I think about AI architecture. The module on system design alone was worth 10x the price.",
  },
  {
    name: "Marcus Johnson",
    role: "CTO",
    company: "TechStartup",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    quote: "Finally, a course that bridges the gap between theory and production. Our team's velocity doubled after implementing these patterns.",
  },
  {
    name: "Emily Watson",
    role: "AI Architect",
    company: "Microsoft",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    quote: "The depth of content here is incredible. From data pipelines to deployment, everything is covered with real code examples.",
  },
];

// Module curriculum
const modules = [
  { number: 1, title: "Foundations & Architecture", lessons: 8 },
  { number: 2, title: "Data Pipeline Design", lessons: 10 },
  { number: 3, title: "Model Integration", lessons: 9 },
  { number: 4, title: "API Development", lessons: 7 },
  { number: 5, title: "Real-Time Systems", lessons: 8 },
  { number: 6, title: "Security & Auth", lessons: 6 },
  { number: 7, title: "Observability", lessons: 7 },
  { number: 8, title: "Production Deploy", lessons: 9 },
];

export default async function Home() {
  const session = await auth();

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">AI</span>
              </div>
              <span className="font-semibold text-lg">Systems Architect</span>
            </div>
            
            <div className="flex items-center gap-4">
              {session?.user ? (
                <Link
                  href="/dashboard"
                  className="px-5 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity btn-glow"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="px-5 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity btn-glow"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto stagger-children">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm text-muted-foreground">New: Module 8 - Production Deployment is live</span>
            </div>
            
            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Become an{" "}
              <span className="gradient-text">AI Systems</span>
              <br />
              Architect
            </h1>
            
            {/* Subheadline */}
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Master the art of building production-ready AI systems. From architecture to deployment, 
              learn everything you need to ship AI at scale.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link
                href="/auth/signup"
                className="group px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-lg hover:opacity-90 transition-all btn-glow flex items-center gap-2"
              >
                Start Learning Free
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="#preview"
                className="px-8 py-4 rounded-xl glass font-semibold text-lg hover:bg-muted/50 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Watch Preview
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-3xl mx-auto">
              {[
                { value: "8", label: "Modules" },
                { value: "64+", label: "Lessons" },
                { value: "40h", label: "Content" },
                { value: "4.9", label: "Rating" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold gradient-text mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Video Preview Section */}
      <section id="preview" className="py-20 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 stagger-children">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">See What You&apos;ll Build</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Get a sneak peek at the real-world AI systems you&apos;ll create throughout the course.
            </p>
          </div>
          
          {/* Video Embed */}
          <div className="relative rounded-2xl overflow-hidden gradient-border glow-lg group">
            <div className="aspect-video bg-card relative">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/aircAruvnKk?rel=0&modestbranding=1"
                title="Course Preview - Neural Networks Explained"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
          
          {/* Video caption */}
          <p className="text-center text-sm text-muted-foreground mt-4">
            Sample preview video • Full course includes 40+ hours of content
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/30 to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 stagger-children">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need to <span className="gradient-text">Master AI</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Comprehensive curriculum designed by industry experts to take you from beginner to production-ready.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl glass card-hover"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum Section */}
      <section className="py-20 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 stagger-children">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Complete Curriculum</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              8 comprehensive modules taking you from foundations to production deployment.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-4">
            {modules.map((module, index) => (
              <div
                key={module.number}
                className="group p-5 rounded-xl glass card-hover flex items-center gap-4"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center font-mono font-bold text-primary shrink-0">
                  {module.number.toString().padStart(2, "0")}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{module.title}</h3>
                  <p className="text-sm text-muted-foreground">{module.lessons} lessons</p>
                </div>
                <svg className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/30 to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 stagger-children">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Loved by <span className="gradient-text">Engineers</span> Worldwide
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Join thousands of developers who have transformed their AI skills.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.name}
                className="p-6 rounded-2xl glass card-hover"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 text-sm leading-relaxed">&quot;{testimonial.quote}&quot;</p>
                <div className="flex items-center gap-3">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div>
                    <div className="font-medium text-sm">{testimonial.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {testimonial.role} @ {testimonial.company}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl glass-strong p-8 sm:p-12 text-center relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-emerald-500/10" />
            
            <div className="relative stagger-children">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to Build the Future?
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                Join thousands of engineers who are mastering AI systems architecture. 
                Start your journey today with Module 1 completely free.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/auth/signup"
                  className="group px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-lg hover:opacity-90 transition-all btn-glow flex items-center gap-2"
                >
                  Start Learning Free
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link
                  href="/pricing"
                  className="px-8 py-4 rounded-xl glass font-semibold text-lg hover:bg-muted/50 transition-colors"
                >
                  View Pricing
                </Link>
              </div>
              
              {/* Trust badges */}
              <div className="flex flex-wrap items-center justify-center gap-6 mt-10 pt-8 border-t border-border/50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  90-Day Guarantee
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Lifetime Access
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Discord Community
                </div>
              </div>
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
              <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Contact</Link>
            </div>
            
            <div className="text-sm text-muted-foreground">
              © 2026 AI Systems Architect. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
