import { redirect } from "next/navigation";
import Link from "next/link";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";

// Force dynamic rendering to enable auth() at runtime
export const dynamic = 'force-dynamic';

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  if (session.user.onboardingComplete) {
    redirect("/dashboard");
  }

  let user;
  try {
    user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        userType: true,
        buildGoal: true,
        experienceLevel: true,
      },
    });
  } catch (error) {
    console.error("[Onboarding] Error fetching user:", error);
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Database Error</h1>
          <p className="text-muted-foreground mb-6">
            Unable to load your profile. Please try again.
          </p>
          <Link
            href="/auth/signin"
            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold">AI</span>
          </div>
          <span className="font-semibold text-xl">Systems Architect</span>
        </Link>

        <div className="w-full max-w-lg">
          {/* Progress steps */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-medium">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm text-muted-foreground">Account Created</span>
            </div>
            <div className="w-8 h-0.5 bg-muted" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                2
              </div>
              <span className="text-sm font-medium">Personalize</span>
            </div>
            <div className="w-8 h-0.5 bg-muted" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-medium">
                3
              </div>
              <span className="text-sm text-muted-foreground">Start Learning</span>
            </div>
          </div>

          {/* Card */}
          <div className="rounded-2xl glass-strong p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-emerald-500/5" />
            
            <div className="relative">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold tracking-tight mb-2">
                  Let&apos;s personalize your experience
                </h1>
                <p className="text-muted-foreground">
                  Tell us about yourself so we can customize your learning journey
                </p>
              </div>

              {/* Form */}
              <OnboardingForm
                initialName={user?.name}
                initialUserType={user?.userType}
                initialBuildGoal={user?.buildGoal}
                initialExperienceLevel={user?.experienceLevel}
              />
            </div>
          </div>

          {/* Skip option */}
          <div className="text-center mt-6">
            <form
              action={async () => {
                "use server";
                const { auth } = await import("@/lib/auth");
                const { prisma } = await import("@/lib/prisma");
                const session = await auth();
                if (session?.user) {
                  await prisma.user.update({
                    where: { id: session.user.id },
                    data: { onboardingComplete: true },
                  });
                }
                const { redirect } = await import("next/navigation");
                redirect("/dashboard");
              }}
            >
              <button
                type="submit"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip for now →
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
