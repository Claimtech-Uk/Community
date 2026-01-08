"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Enum values matching Prisma schema
const USER_TYPES = [
  { value: "SOLO_BUILDER", label: "Solo Builder", description: "Building products on my own" },
  { value: "EXPERIENCED_DEV", label: "Experienced Developer", description: "Professional developer expanding skills" },
  { value: "TECH_TEAM", label: "Tech Team Member", description: "Part of a development team" },
] as const;

const EXPERIENCE_LEVELS = [
  { value: "BEGINNER", label: "Beginner", description: "New to AI systems" },
  { value: "INTERMEDIATE", label: "Intermediate", description: "Some experience with AI" },
  { value: "ADVANCED", label: "Advanced", description: "Significant AI experience" },
] as const;

interface OnboardingFormProps {
  initialName?: string | null;
  initialUserType?: string | null;
  initialBuildGoal?: string | null;
  initialExperienceLevel?: string | null;
}

interface FormData {
  name: string;
  userType: string;
  buildGoal: string;
  experienceLevel: string;
}

const STORAGE_KEY = "onboarding_progress";

export function OnboardingForm({
  initialName,
  initialUserType,
  initialBuildGoal,
  initialExperienceLevel,
}: OnboardingFormProps) {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: initialName || "",
    userType: initialUserType || "",
    buildGoal: initialBuildGoal || "",
    experienceLevel: initialExperienceLevel || "",
  });

  // Load progress from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData((prev) => ({
          name: parsed.name || prev.name,
          userType: parsed.userType || prev.userType,
          buildGoal: parsed.buildGoal || prev.buildGoal,
          experienceLevel: parsed.experienceLevel || prev.experienceLevel,
        }));
        if (parsed.currentStep) {
          setCurrentStep(parsed.currentStep);
        }
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Save progress to localStorage on change
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...formData, currentStep })
    );
  }, [formData, currentStep]);

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim().length >= 2;
      case 2:
        return formData.userType !== "";
      case 3:
        return formData.buildGoal.trim().length >= 10;
      case 4:
        return formData.experienceLevel !== "";
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed() && currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    localStorage.removeItem(STORAGE_KEY);
    router.push("/dashboard");
  };

  const handleSubmit = async () => {
    if (!canProceed()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setIsSubmitting(false);
        return;
      }

      // Clear localStorage on success
      localStorage.removeItem(STORAGE_KEY);

      // Update session to reflect new onboardingComplete status
      await updateSession();

      // Redirect to dashboard
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                step === currentStep
                  ? "bg-primary text-primary-foreground"
                  : step < currentStep
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step < currentStep ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step
              )}
            </div>
          ))}
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Step content */}
      <div className="min-h-[300px]">
        {/* Step 1: Name */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">What should we call you?</h2>
              <p className="text-muted-foreground mt-2">
                This helps us personalize your experience
              </p>
            </div>
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Your name
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                className="w-full rounded-md border border-input bg-background px-4 py-3 text-lg placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Enter your name"
                autoFocus
              />
              {formData.name.length > 0 && formData.name.length < 2 && (
                <p className="text-sm text-destructive mt-2">Name must be at least 2 characters</p>
              )}
            </div>
          </div>
        )}

        {/* Step 2: User Type */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">What describes you best?</h2>
              <p className="text-muted-foreground mt-2">
                Help us understand your background
              </p>
            </div>
            <div className="space-y-3">
              {USER_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => updateField("userType", type.value)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                    formData.userType === type.value
                      ? "border-primary bg-primary/5"
                      : "border-input hover:border-primary/50"
                  }`}
                >
                  <div className="font-medium">{type.label}</div>
                  <div className="text-sm text-muted-foreground">{type.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Build Goal */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">What do you want to build?</h2>
              <p className="text-muted-foreground mt-2">
                Tell us about your AI project goals
              </p>
            </div>
            <div>
              <label htmlFor="buildGoal" className="block text-sm font-medium mb-2">
                Your goal
              </label>
              <textarea
                id="buildGoal"
                value={formData.buildGoal}
                onChange={(e) => updateField("buildGoal", e.target.value)}
                rows={4}
                maxLength={500}
                className="w-full rounded-md border border-input bg-background px-4 py-3 placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                placeholder="e.g., I want to build an AI-powered customer support system for my SaaS..."
                autoFocus
              />
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>
                  {formData.buildGoal.length < 10 && formData.buildGoal.length > 0
                    ? "Please write at least 10 characters"
                    : " "}
                </span>
                <span>{formData.buildGoal.length}/500</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Experience Level */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">What&apos;s your AI experience?</h2>
              <p className="text-muted-foreground mt-2">
                We&apos;ll tailor the content to your level
              </p>
            </div>
            <div className="space-y-3">
              {EXPERIENCE_LEVELS.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => updateField("experienceLevel", level.value)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                    formData.experienceLevel === level.value
                      ? "border-primary bg-primary/5"
                      : "border-input hover:border-primary/50"
                  }`}
                >
                  <div className="font-medium">{level.label}</div>
                  <div className="text-sm text-muted-foreground">{level.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="mt-8 flex items-center justify-between">
        <div>
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSkip}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Skip for now
            </button>
          )}
        </div>

        <div>
          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceed()}
              className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Completing..." : "Complete Setup"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
