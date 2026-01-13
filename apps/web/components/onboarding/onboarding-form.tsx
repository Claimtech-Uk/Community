"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const USER_TYPES = [
  { value: "SOLO_BUILDER", label: "Solo Builder", description: "Building products on my own", icon: "🚀" },
  { value: "EXPERIENCED_DEV", label: "Experienced Developer", description: "Professional developer expanding skills", icon: "💻" },
  { value: "TECH_TEAM", label: "Tech Team Member", description: "Part of a development team", icon: "👥" },
] as const;

const EXPERIENCE_LEVELS = [
  { value: "BEGINNER", label: "Beginner", description: "New to AI systems", icon: "🌱" },
  { value: "INTERMEDIATE", label: "Intermediate", description: "Some experience with AI", icon: "📈" },
  { value: "ADVANCED", label: "Advanced", description: "Significant AI experience", icon: "⚡" },
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

      localStorage.removeItem(STORAGE_KEY);
      await updateSession();
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`h-2 rounded-full transition-all duration-300 ${
              step === currentStep
                ? "w-8 bg-primary"
                : step < currentStep
                  ? "w-2 bg-emerald-500"
                  : "w-2 bg-muted"
            }`}
          />
        ))}
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive flex items-center gap-3">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Step content */}
      <div className="min-h-[320px]">
        {/* Step 1: Name */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold">What should we call you?</h2>
            </div>
            <div>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-4 py-4 text-lg placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
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
          <div className="space-y-4 animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold">What describes you best?</h2>
            </div>
            <div className="space-y-3">
              {USER_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => updateField("userType", type.value)}
                  className={`w-full text-left p-4 rounded-xl transition-all ${
                    formData.userType === type.value
                      ? "glass border-primary/50 bg-primary/5"
                      : "glass hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{type.icon}</span>
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-sm text-muted-foreground">{type.description}</div>
                    </div>
                    {formData.userType === type.value && (
                      <svg className="w-5 h-5 text-primary ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Build Goal */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold">What do you want to build?</h2>
            </div>
            <div>
              <textarea
                value={formData.buildGoal}
                onChange={(e) => updateField("buildGoal", e.target.value)}
                rows={4}
                maxLength={500}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-colors"
                placeholder="e.g., I want to build an AI-powered customer support system..."
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
          <div className="space-y-4 animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold">What&apos;s your AI experience?</h2>
            </div>
            <div className="space-y-3">
              {EXPERIENCE_LEVELS.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => updateField("experienceLevel", level.value)}
                  className={`w-full text-left p-4 rounded-xl transition-all ${
                    formData.experienceLevel === level.value
                      ? "glass border-primary/50 bg-primary/5"
                      : "glass hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{level.icon}</span>
                    <div>
                      <div className="font-medium">{level.label}</div>
                      <div className="text-sm text-muted-foreground">{level.description}</div>
                    </div>
                    {formData.experienceLevel === level.value && (
                      <svg className="w-5 h-5 text-primary ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="mt-8 flex items-center justify-between">
        <div>
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          )}
        </div>

        <div>
          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 btn-glow transition-all"
            >
              Continue
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-emerald-500 text-primary-foreground font-medium hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 btn-glow transition-all"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Completing...
                </>
              ) : (
                <>
                  Start Learning
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
