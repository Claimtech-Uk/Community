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
  progress?: number; // 0-100, placeholder for now
}

export function ModuleCard({ module, progress = 0 }: ModuleCardProps) {
  const lessonCount = module._count?.lessons ?? module.lessons?.length ?? 0;

  return (
    <Link
      href={`/course/${module.id}`}
      className="group block rounded-xl border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {module.order}
            </span>
            <span className="text-sm text-muted-foreground">
              Module {module.order}
            </span>
          </div>
          <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
            {module.title}
          </h3>
          {module.description && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {module.description}
            </p>
          )}
          <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
            <span>{lessonCount} lesson{lessonCount !== 1 ? "s" : ""}</span>
          </div>
        </div>

        {/* Progress indicator - placeholder for now */}
        <div className="flex flex-col items-end gap-2">
          <div className="text-sm font-medium text-muted-foreground">
            {progress}%
          </div>
          <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Arrow indicator */}
      <div className="mt-4 flex justify-end">
        <svg
          className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </Link>
  );
}
