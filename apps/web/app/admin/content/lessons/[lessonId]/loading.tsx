import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function LessonEditorLoading() {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb skeleton */}
        <div className="flex items-center gap-2 mb-6">
          <div className="h-4 w-16 rounded bg-muted animate-pulse" />
          <span className="text-muted-foreground">/</span>
          <div className="h-4 w-24 rounded bg-muted animate-pulse" />
          <span className="text-muted-foreground">/</span>
          <div className="h-4 w-32 rounded bg-muted animate-pulse" />
        </div>

        {/* Header skeleton */}
        <div className="mb-8">
          <div className="h-8 w-48 rounded bg-muted animate-pulse mb-2" />
          <div className="h-4 w-64 rounded bg-muted animate-pulse" />
        </div>

        <div className="space-y-6">
          {/* Status bar skeleton */}
          <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
            <div className="flex items-center gap-4">
              <div className="h-6 w-16 rounded-full bg-muted animate-pulse" />
              <div className="h-4 w-24 rounded bg-muted animate-pulse" />
            </div>
            <div className="h-8 w-20 rounded-lg bg-muted animate-pulse" />
          </div>

          {/* Title input skeleton */}
          <div className="space-y-2">
            <div className="h-4 w-24 rounded bg-muted animate-pulse" />
            <div className="h-12 rounded-lg border bg-muted animate-pulse" />
          </div>

          {/* Free toggle skeleton */}
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 rounded bg-muted animate-pulse" />
            <div className="h-4 w-48 rounded bg-muted animate-pulse" />
          </div>

          {/* Video upload skeleton */}
          <div className="rounded-lg border p-4">
            <div className="h-4 w-24 rounded bg-muted animate-pulse mb-4" />
            <div className="h-32 rounded-lg border-2 border-dashed bg-muted/30 animate-pulse flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-lg bg-muted mx-auto" />
                <div className="h-4 w-32 rounded bg-muted mx-auto" />
              </div>
            </div>
          </div>

          {/* Content editor skeleton */}
          <div className="space-y-2">
            <div className="h-4 w-28 rounded bg-muted animate-pulse" />
            <div className="h-64 rounded-lg border bg-muted animate-pulse" />
          </div>

          {/* Assets skeleton */}
          <div className="rounded-lg border p-4">
            <div className="h-4 w-20 rounded bg-muted animate-pulse mb-4" />
            <div className="h-20 rounded-lg border-2 border-dashed bg-muted/30 animate-pulse" />
          </div>
        </div>

        {/* Loading indicator */}
        <div className="flex justify-center mt-8">
          <div className="flex items-center gap-3 text-muted-foreground">
            <LoadingSpinner size="sm" />
            <span className="text-sm">Loading lesson editor...</span>
          </div>
        </div>
      </main>
    </div>
  );
}
