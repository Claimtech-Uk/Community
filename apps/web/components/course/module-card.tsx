import Link from "next/link";

interface ModuleCardProps {
  module: {
    id: string;
    title: string;
    description: string | null;
    order: number;
    _count?: { lessons: number };
    lessons?: { id: string }[];
  };
  progress?: number;
  completedLessons?: number;
  totalLessons?: number;
  index?: number;
}

export function ModuleCard({
  module,
  progress = 0,
  completedLessons = 0,
  totalLessons,
  index = 0,
}: ModuleCardProps) {
  const lessonCount = totalLessons ?? module._count?.lessons ?? module.lessons?.length ?? 0;
  const isComplete = progress === 100 && lessonCount > 0;
  const isLocked = false; // TODO: Check module unlock status

  return (
    <Link
      href={`/course/${module.id}`}
      className="group block"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className={`relative rounded-xl glass p-5 transition-all duration-300 hover:-translate-y-1 ${
        isComplete 
          ? "border-emerald-500/30 hover:border-emerald-500/50" 
          : "hover:border-primary/50"
      }`}
        style={{ 
          boxShadow: isComplete 
            ? "0 0 20px -5px rgba(16, 185, 129, 0.2)" 
            : undefined 
        }}
      >
        <div className="flex items-start gap-4">
          {/* Module Number / Icon */}
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-mono font-bold text-lg ${
            isComplete
              ? "bg-emerald-500/20 text-emerald-400"
              : "bg-primary/10 text-primary"
          }`}>
            {isComplete ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              module.order.toString().padStart(2, "0")
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                Module {module.order}
              </span>
              {isComplete && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                  <span className="w-1 h-1 rounded-full bg-emerald-400" />
                  Complete
                </span>
              )}
              {isLocked && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Locked
                </span>
              )}
            </div>
            
            <h3 className="text-lg font-semibold group-hover:text-primary transition-colors mb-1 truncate">
              {module.title}
            </h3>
            
            {module.description && (
              <p className="text-sm text-muted-foreground line-clamp-1 mb-3">
                {module.description}
              </p>
            )}

            {/* Progress Bar */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isComplete ? "bg-emerald-500" : "progress-gradient"
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className={`text-xs font-medium tabular-nums ${
                isComplete ? "text-emerald-400" : "text-muted-foreground"
              }`}>
                {completedLessons}/{lessonCount}
              </span>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex items-center self-center">
            <svg
              className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
