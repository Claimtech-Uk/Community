import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function CourseLessonLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation skeleton */}
      <nav className="sticky top-0 z-50 glass-strong border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded bg-muted animate-pulse" />
              <div className="h-4 w-48 rounded bg-muted animate-pulse" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-20 rounded-lg bg-muted animate-pulse" />
              <div className="h-8 w-20 rounded-lg bg-muted animate-pulse" />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8 lg:flex lg:gap-8">
        {/* Main content */}
        <div className="flex-1">
          {/* Video player skeleton */}
          <div className="aspect-video rounded-2xl bg-muted animate-pulse mb-6 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-muted-foreground/20 mx-auto mb-4 flex items-center justify-center">
                <LoadingSpinner size="lg" />
              </div>
              <div className="h-4 w-32 rounded bg-muted-foreground/20 mx-auto" />
            </div>
          </div>

          {/* Lesson title skeleton */}
          <div className="mb-6">
            <div className="h-8 w-3/4 rounded bg-muted animate-pulse mb-2" />
            <div className="flex items-center gap-4">
              <div className="h-4 w-24 rounded bg-muted animate-pulse" />
              <div className="h-4 w-20 rounded bg-muted animate-pulse" />
            </div>
          </div>

          {/* Content skeleton */}
          <div className="space-y-4 mb-8">
            <div className="h-4 w-full rounded bg-muted animate-pulse" />
            <div className="h-4 w-5/6 rounded bg-muted animate-pulse" />
            <div className="h-4 w-4/5 rounded bg-muted animate-pulse" />
            <div className="h-4 w-full rounded bg-muted animate-pulse" />
            <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
          </div>

          {/* Mark complete button skeleton */}
          <div className="h-12 w-40 rounded-xl bg-muted animate-pulse" />
        </div>

        {/* Sidebar skeleton */}
        <div className="hidden lg:block w-80">
          <div className="rounded-xl border bg-card p-4 space-y-4">
            <div className="h-5 w-32 rounded bg-muted animate-pulse" />
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <div className="w-6 h-6 rounded-full bg-muted animate-pulse" />
                <div className="flex-1 h-4 rounded bg-muted animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
