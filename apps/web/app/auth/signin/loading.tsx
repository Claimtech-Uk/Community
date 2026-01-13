import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function SignInLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8">
        {/* Logo skeleton */}
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-muted animate-pulse" />
        </div>

        {/* Title skeleton */}
        <div className="text-center mb-8">
          <div className="h-7 w-32 rounded bg-muted animate-pulse mx-auto mb-2" />
          <div className="h-4 w-48 rounded bg-muted animate-pulse mx-auto" />
        </div>

        {/* Form skeleton */}
        <div className="rounded-2xl border bg-card p-6 space-y-4">
          {/* Email field */}
          <div className="space-y-2">
            <div className="h-4 w-12 rounded bg-muted animate-pulse" />
            <div className="h-10 rounded-lg bg-muted animate-pulse" />
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <div className="h-4 w-16 rounded bg-muted animate-pulse" />
            <div className="h-10 rounded-lg bg-muted animate-pulse" />
          </div>

          {/* Submit button */}
          <div className="h-10 rounded-lg bg-muted animate-pulse mt-6" />
        </div>

        {/* Loading indicator */}
        <div className="flex justify-center mt-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <LoadingSpinner size="sm" />
            <span className="text-sm">Loading...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
