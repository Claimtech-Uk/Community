import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";

export default async function OnboardingPage() {
  const session = await auth();

  // Redirect to signin if not authenticated
  if (!session?.user) {
    redirect("/auth/signin");
  }

  // If onboarding is already complete, redirect to dashboard
  if (session.user.onboardingComplete) {
    redirect("/dashboard");
  }

  // Fetch current user data to pre-fill form
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      userType: true,
      buildGoal: true,
      experienceLevel: true,
    },
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome to AI Systems Architect
          </h1>
          <p className="text-muted-foreground mt-2">
            Let&apos;s personalize your learning experience
          </p>
        </div>

        {/* Onboarding form */}
        <OnboardingForm
          initialName={user?.name}
          initialUserType={user?.userType}
          initialBuildGoal={user?.buildGoal}
          initialExperienceLevel={user?.experienceLevel}
        />
      </div>
    </div>
  );
}
