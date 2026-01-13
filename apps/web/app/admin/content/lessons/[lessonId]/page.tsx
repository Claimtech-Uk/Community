import { notFound } from "next/navigation";
import Link from "next/link";
import { getLessonWithAssets } from "@/lib/data";
import { LessonEditor } from "@/components/admin/lesson-editor";

interface LessonEditPageProps {
  params: Promise<{ lessonId: string }>;
}

export default async function LessonEditPage({ params }: LessonEditPageProps) {
  const { lessonId } = await params;
  const lesson = await getLessonWithAssets(lessonId);

  if (!lesson) {
    notFound();
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm">
          <Link 
            href="/admin/content" 
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Content
          </Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">{lesson.module.title}</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-foreground truncate max-w-[200px]">
            {lesson.title}
          </span>
        </nav>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Lesson</h1>
            <p className="text-muted-foreground mt-1">
              Module {lesson.module.order}: {lesson.module.title}
            </p>
          </div>
          <Link
            href="/admin/content"
            className="inline-flex items-center gap-2 rounded-lg border bg-card px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Content
          </Link>
        </div>

        {/* Editor */}
        <LessonEditor lesson={lesson} />
      </div>
    </div>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}
