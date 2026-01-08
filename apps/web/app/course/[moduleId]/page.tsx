import { notFound, redirect } from "next/navigation";
import Link from "next/link";

import { auth } from "@/lib/auth";
import { getPublishedModuleWithLessons } from "@/lib/data";
import { LessonList } from "@/components/course";

interface ModulePageProps {
  params: Promise<{ moduleId: string }>;
}

export default async function ModulePage({ params }: ModulePageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const { moduleId } = await params;
  const module = await getPublishedModuleWithLessons(moduleId);

  if (!module) {
    notFound();
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/dashboard" className="hover:text-foreground">
            Course
          </Link>
          <span>/</span>
          <span className="text-foreground">{module.title}</span>
        </nav>

        {/* Module Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
              {module.order}
            </span>
            <span className="text-sm text-muted-foreground">
              Module {module.order}
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{module.title}</h1>
          {module.description && (
            <p className="text-muted-foreground mt-2 text-lg">
              {module.description}
            </p>
          )}
        </div>

        {/* Progress bar placeholder */}
        <div className="mb-8 rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium">Your Progress</span>
            <span className="text-muted-foreground">0% Complete</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-primary w-0 transition-all" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            0 of {module.lessons.length} lessons completed
          </p>
        </div>

        {/* Lessons */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            Lessons ({module.lessons.length})
          </h2>
          <LessonList moduleId={module.id} lessons={module.lessons} />
        </div>

        {/* Back to course */}
        <div className="mt-8 pt-6 border-t">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Course Overview
          </Link>
        </div>
      </div>
    </div>
  );
}
