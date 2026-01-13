import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function AdminContentLoading() {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Header skeleton */}
        <div className="mb-8 flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 rounded bg-muted animate-pulse" />
            <div className="h-4 w-64 rounded bg-muted animate-pulse" />
          </div>
          <div className="h-10 w-32 rounded-lg bg-muted animate-pulse" />
        </div>

        {/* Module cards skeleton */}
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border bg-card p-5 animate-pulse">
              <div className="flex items-center gap-4">
                {/* Drag handle */}
                <div className="w-5 h-5 rounded bg-muted" />
                
                {/* Module number */}
                <div className="w-12 h-12 rounded-xl bg-muted" />
                
                {/* Module info */}
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-56 rounded bg-muted" />
                  <div className="h-3 w-40 rounded bg-muted" />
                </div>
                
                {/* Lesson count */}
                <div className="space-y-1 text-right">
                  <div className="h-5 w-8 rounded bg-muted ml-auto" />
                  <div className="h-3 w-12 rounded bg-muted ml-auto" />
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-2 border-l pl-4">
                  <div className="w-8 h-8 rounded-lg bg-muted" />
                  <div className="w-8 h-8 rounded-lg bg-muted" />
                  <div className="w-8 h-8 rounded-lg bg-muted" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading indicator */}
        <div className="flex justify-center mt-8">
          <div className="flex items-center gap-3 text-muted-foreground">
            <LoadingSpinner size="sm" />
            <span className="text-sm">Loading content...</span>
          </div>
        </div>
      </main>
    </div>
  );
}
