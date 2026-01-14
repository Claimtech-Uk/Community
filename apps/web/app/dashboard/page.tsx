import { redirect } from "next/navigation";
import Link from "next/link";

import { auth } from "@/lib/auth";
import { OnboardingBanner } from "@/components/onboarding";
import { ModuleCard } from "@/components/course";
import { CourseProgressCard } from "@/components/progress";
import {
  getCourseProgress,
  getNextIncompleteLesson,
  getModulesWithProgress,
} from "@/lib/data";
import { checkUserAccess } from "@/lib/access";

// Force dynamic rendering to enable auth() at runtime
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Check if user needs onboarding first
  if (!session.user.onboardingComplete) {
    redirect("/onboarding");
  }

  const isAdmin = session.user.role === "ADMIN";
  
  let courseProgress, nextLesson, modulesWithProgress, accessInfo;
  
  try {
    [courseProgress, nextLesson, modulesWithProgress, accessInfo] = await Promise.all([
      getCourseProgress(session.user.id),
      getNextIncompleteLesson(session.user.id),
      getModulesWithProgress(session.user.id),
      checkUserAccess(session.user.id),
    ]);
  } catch (error) {
    console.error("[Dashboard] Error fetching data:", error);
    // If data fetching fails, show an error page
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Unable to Load Dashboard</h1>
          <p className="text-muted-foreground mb-6">
            There was an error loading your dashboard. This might be a temporary issue.
          </p>
          <Link
            href="/auth/signin"
            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
          >
            Try Again
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass-strong border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">AI</span>
              </div>
              <span className="font-semibold text-lg hidden sm:inline">Systems Architect</span>
            </Link>
            
            <div className="flex items-center gap-4">
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/dashboard/billing"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Billing
              </Link>
              <form
                action={async () => {
                  "use server";
                  const { signOut } = await import("@/lib/auth");
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign out
                </button>
              </form>
              
              {/* User avatar */}
              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
                {session.user.name?.charAt(0) || session.user.email?.charAt(0) || "U"}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Onboarding banner */}
        {!session.user.onboardingComplete && <OnboardingBanner />}

        {/* Welcome Header */}
        <div className="mb-8 stagger-children">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Welcome back{session.user.name ? `, ${session.user.name.split(" ")[0]}` : ""}! 👋
              </h1>
              <p className="text-muted-foreground mt-1">
                Continue your journey to becoming an AI Systems Architect
              </p>
            </div>
            
            {nextLesson && (
              <Link
                href={`/course/${nextLesson.moduleId}/${nextLesson.id}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-all btn-glow shrink-0"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Continue Learning
              </Link>
            )}
          </div>
        </div>

        {/* Progress Card */}
        <div className="mb-8">
          <CourseProgressCard progress={courseProgress} nextLesson={nextLesson} />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { 
              label: "Modules Completed", 
              value: modulesWithProgress.filter(m => m.percentage === 100).length,
              total: modulesWithProgress.length,
              icon: "📚"
            },
            { 
              label: "Lessons Done", 
              value: courseProgress.completedLessons,
              total: courseProgress.totalLessons,
              icon: "✅"
            },
            { 
              label: "Course Progress", 
              value: `${courseProgress.percentage}%`,
              icon: "📈"
            },
            { 
              label: "Status", 
              value: accessInfo.hasAccess ? "Pro" : "Free",
              icon: accessInfo.hasAccess ? "⭐" : "🆓"
            },
          ].map((stat, i) => (
            <div key={i} className="p-4 rounded-xl glass card-hover">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{stat.icon}</div>
                <div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                  <div className="text-xl font-bold">
                    {stat.value}
                    {stat.total !== undefined && (
                      <span className="text-sm font-normal text-muted-foreground">/{stat.total}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Course Modules */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Course Modules</h2>
            <span className="text-sm text-muted-foreground">
              {modulesWithProgress.length} module{modulesWithProgress.length !== 1 ? "s" : ""}
            </span>
          </div>

          {modulesWithProgress.length === 0 ? (
            <div className="rounded-2xl glass border-dashed border-2 border-border p-12 text-center">
              <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">No content yet</h3>
                <p className="text-sm text-muted-foreground">
                  Course content is being prepared. Check back soon!
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {modulesWithProgress.map((moduleData, index) => (
                <ModuleCard
                  key={moduleData.id}
                  module={moduleData}
                  progress={moduleData.percentage}
                  completedLessons={moduleData.completedCount}
                  totalLessons={moduleData.lessonCount}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>

        {/* Upgrade Banner (if not subscribed) */}
        {!accessInfo.hasAccess && modulesWithProgress.length > 0 && (
          <div className="mt-12 rounded-2xl glass-strong p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-emerald-500/10" />
            
            <div className="relative flex flex-col sm:flex-row items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center shrink-0">
                <svg className="w-8 h-8 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-xl font-bold mb-1">Unlock All Modules</h3>
                <p className="text-muted-foreground text-sm">
                  Get access to all 8 modules, 64+ lessons, downloadable resources, and lifetime updates.
                </p>
              </div>
              
              <Link
                href="/pricing"
                className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all btn-glow shrink-0"
              >
                Upgrade to Pro
              </Link>
            </div>
          </div>
        )}

        {/* Account Details (Collapsed) */}
        <div className="mt-12 pt-8 border-t border-border/50">
          <details className="group">
            <summary className="flex cursor-pointer items-center justify-between text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Account Details
              </span>
              <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            
            <div className="mt-4 rounded-xl glass p-6">
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <dt className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Email</dt>
                  <dd className="text-sm font-medium">{session.user.email}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Role</dt>
                  <dd className="text-sm font-medium">
                    {isAdmin ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Admin
                      </span>
                    ) : (
                      <span className="capitalize">{session.user.role?.toLowerCase()}</span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Subscription</dt>
                  <dd className="text-sm font-medium">
                    {accessInfo.hasAccess ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        {accessInfo.reason === "override" ? "Override" : "Active"}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs font-semibold">
                        Free
                      </span>
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </details>
        </div>
      </main>
    </div>
  );
}
