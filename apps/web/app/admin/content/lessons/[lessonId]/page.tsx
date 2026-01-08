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
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin/content" className="hover:text-foreground">
          Content
        </Link>
        <span>/</span>
        <span>{lesson.module.title}</span>
        <span>/</span>
        <span className="text-foreground">{lesson.title}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Lesson</h1>
          <p className="text-muted-foreground">
            Module {lesson.module.order}: {lesson.module.title}
          </p>
        </div>
        <Link
          href="/admin/content"
          className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
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
  );
}
