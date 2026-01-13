import Link from "next/link";

interface Lesson {
  id: string;
  title: string;
  order: number;
  isFree: boolean;
  videoDuration?: number | null;
}

interface LessonListProps {
  moduleId: string;
  lessons: Lesson[];
  currentLessonId?: string;
  completedLessonIds?: Set<string>;
}

export function LessonList({
  moduleId,
  lessons,
  currentLessonId,
  completedLessonIds = new Set(),
}: LessonListProps) {
  if (lessons.length === 0) {
    return (
      <div className="rounded-xl glass border-dashed border-2 border-border p-8 text-center">
        <div className="text-muted-foreground">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <p className="font-medium">Content coming soon</p>
          <p className="text-sm mt-1">Lessons are being prepared.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {lessons.map((lesson, index) => (
        <LessonItem
          key={lesson.id}
          lesson={lesson}
          moduleId={moduleId}
          isActive={lesson.id === currentLessonId}
          isCompleted={completedLessonIds.has(lesson.id)}
          index={index}
        />
      ))}
    </div>
  );
}

function LessonItem({
  lesson,
  moduleId,
  isActive,
  isCompleted,
}: {
  lesson: Lesson;
  moduleId: string;
  isActive: boolean;
  isCompleted: boolean;
  index: number;
}) {
  return (
    <Link
      href={`/course/${moduleId}/${lesson.id}`}
      className={`group flex items-center gap-3 rounded-lg p-3 transition-all ${
        isActive
          ? "bg-primary/10 border border-primary/30"
          : "hover:bg-muted/50 border border-transparent"
      }`}
    >
      {/* Lesson number / completion indicator */}
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium shrink-0 transition-colors ${
        isCompleted
          ? "bg-emerald-500/20 text-emerald-400"
          : isActive
            ? "bg-primary text-primary-foreground"
            : "bg-muted/50 text-muted-foreground group-hover:bg-muted"
      }`}>
        {isCompleted ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          lesson.order
        )}
      </div>

      {/* Lesson info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium truncate transition-colors ${
            isActive 
              ? "text-primary" 
              : isCompleted 
                ? "text-emerald-400" 
                : "group-hover:text-foreground"
          }`}>
            {lesson.title}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          {lesson.videoDuration && (
            <span className="text-xs text-muted-foreground">
              {formatDuration(lesson.videoDuration)}
            </span>
          )}
          {lesson.isFree && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary font-medium">
              Free
            </span>
          )}
        </div>
      </div>

      {/* Play indicator */}
      <div className="shrink-0">
        {isActive ? (
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
            <svg className="w-3 h-3 text-primary-foreground ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        ) : isCompleted ? (
          <span className="text-xs text-emerald-400 font-medium">Done</span>
        ) : (
          <svg className="w-5 h-5 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </div>
    </Link>
  );
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
