import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation skeleton */}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-muted animate-pulse" />
              <div className="w-40 h-5 rounded bg-muted animate-pulse" />
            </div>
            <div className="flex items-center gap-4">
              <div className="w-20 h-4 rounded bg-muted animate-pulse" />
              <div className="w-20 h-4 rounded bg-muted animate-pulse" />
              <div className="w-9 h-9 rounded-full bg-muted animate-pulse" />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="h-8 w-48 rounded bg-muted animate-pulse mb-2" />
          <div className="h-4 w-80 rounded bg-muted animate-pulse" />
        </div>

        {/* Stats cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border bg-card p-6 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 w-20 rounded bg-muted" />
                <div className="w-10 h-10 rounded-lg bg-muted" />
              </div>
              <div className="h-8 w-16 rounded bg-muted mb-2" />
              <div className="h-3 w-24 rounded bg-muted" />
            </div>
          ))}
        </div>

        {/* Quick actions skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border bg-card p-6 animate-pulse">
              <div className="w-12 h-12 rounded-lg bg-muted mb-4" />
              <div className="h-5 w-28 rounded bg-muted mb-2" />
              <div className="h-4 w-36 rounded bg-muted" />
            </div>
          ))}
        </div>

        {/* Loading indicator */}
        <div className="flex justify-center mt-12">
          <div className="flex items-center gap-3 text-muted-foreground">
            <LoadingSpinner size="sm" />
            <span className="text-sm">Loading admin dashboard...</span>
          </div>
        </div>
      </main>
    </div>
  );
}
