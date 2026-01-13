import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation skeleton */}
      <nav className="sticky top-0 z-50 glass-strong border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 animate-pulse" />
              <div className="w-32 h-4 rounded bg-muted animate-pulse" />
            </div>
            <div className="w-9 h-9 rounded-full bg-muted animate-pulse" />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="h-8 w-64 rounded bg-muted animate-pulse mb-2" />
          <div className="h-4 w-48 rounded bg-muted animate-pulse" />
        </div>

        {/* Progress card skeleton */}
        <div className="mb-8 rounded-2xl border bg-card p-6 animate-pulse">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-muted" />
            <div className="flex-1 space-y-3">
              <div className="h-4 w-32 rounded bg-muted" />
              <div className="h-2 rounded-full bg-muted" />
              <div className="h-3 w-24 rounded bg-muted" />
            </div>
          </div>
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 rounded-xl glass animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted" />
                <div className="space-y-2">
                  <div className="h-3 w-16 rounded bg-muted" />
                  <div className="h-5 w-12 rounded bg-muted" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modules section header */}
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 w-32 rounded bg-muted animate-pulse" />
          <div className="h-4 w-20 rounded bg-muted animate-pulse" />
        </div>

        {/* Module cards skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border bg-card p-6 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-48 rounded bg-muted" />
                  <div className="h-3 w-32 rounded bg-muted" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-24 rounded-full bg-muted" />
                  <div className="h-4 w-8 rounded bg-muted" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading indicator */}
        <div className="flex justify-center mt-8">
          <div className="flex items-center gap-3 text-muted-foreground">
            <LoadingSpinner size="sm" />
            <span className="text-sm">Loading your dashboard...</span>
          </div>
        </div>
      </main>
    </div>
  );
}
