import { notFound, redirect } from "next/navigation";
import Link from "next/link";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPlaybackToken } from "@/lib/mux";
import { checkLessonAccess } from "@/lib/access";
import { getLessonProgress, getCompletedLessonIds } from "@/lib/data";
import { trackEventOnce, EVENTS } from "@/lib/tracking";
import { 
  TipTapRenderer, 
  LessonList, 
  AssetList,
  VideoPlayer,
  VideoLocked,
  VideoPlaceholder,
  LockedModulePage,
} from "@/components/course";
import { SoftLockBanner } from "@/components/billing";
import { MarkCompleteButton } from "@/components/progress";
import type { JSONContent } from "@tiptap/react";

// Force dynamic rendering to enable auth() at runtime
export const dynamic = 'force-dynamic';

interface LessonPageProps {
  params: Promise<{ moduleId: string; lessonId: string }>;
}

export default async function LessonPage({ params }: LessonPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const { moduleId, lessonId } = await params;

  // Fetch lesson with module info and assets
  const lesson = await prisma.lesson.findFirst({
    where: {
      id: lessonId,
      moduleId: moduleId,
      published: true,
      module: {
        published: true,
      },
    },
    include: {
      module: {
        include: {
          lessons: {
            where: { published: true },
            orderBy: { order: "asc" },
            select: {
              id: true,
              title: true,
              order: true,
              isFree: true,
              videoDuration: true,
            },
          },
        },
      },
      assets: {
        select: {
          id: true,
          filename: true,
          url: true,
          size: true,
          mimeType: true,
        },
      },
    },
  });

  if (!lesson) {
    notFound();
  }

  // Check access using proper access control logic (includes module gating)
  const access = await checkLessonAccess(session.user.id, lessonId);
  const hasAccess = access.hasAccess;

  // Track lesson_started event (deduplicated)
  trackEventOnce({
    userId: session.user.id,
    event: lesson.isFree ? EVENTS.VIDEO_1_STARTED : EVENTS.LESSON_STARTED,
    properties: {
      lessonId,
      moduleId,
      lessonTitle: lesson.title,
      moduleTitle: lesson.module.title,
      isFree: lesson.isFree,
    },
    windowMinutes: 5,
  });

  // If module is locked, show the locked page
  if (!access.moduleUnlocked && access.lockedByModule) {
    return (
      <LockedModulePage
        moduleTitle={lesson.module.title}
        moduleOrder={lesson.module.order}
        lockedBy={access.lockedByModule}
      />
    );
  }

  // Get completion status and next module info
  const [progress, completedLessonIds, nextModule] = await Promise.all([
    getLessonProgress(session.user.id, lessonId),
    getCompletedLessonIds(session.user.id),
    prisma.module.findFirst({
      where: {
        published: true,
        order: { gt: lesson.module.order },
      },
      orderBy: { order: "asc" },
      select: {
        id: true,
        title: true,
        order: true,
      },
    }),
  ]);
  const isCompleted = progress?.completed ?? false;

  // Find next/prev lessons
  const currentIndex = lesson.module.lessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? lesson.module.lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < lesson.module.lessons.length - 1 ? lesson.module.lessons[currentIndex + 1] : null;

  // Calculate progress
  const completedCount = lesson.module.lessons.filter(l => completedLessonIds.includes(l.id)).length;
  const progressPercentage = Math.round((completedCount / lesson.module.lessons.length) * 100);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 glass-strong border-b border-border/50">
        <div className="flex items-center justify-between h-14 px-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Back to Course</span>
          </Link>
          
          <div className="flex items-center gap-4">
            {/* Progress indicator */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-32 h-1.5 rounded-full bg-muted overflow-hidden">
                <div 
                  className="h-full progress-gradient transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {completedCount}/{lesson.module.lessons.length}
              </span>
            </div>
            
            {/* User avatar */}
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
              {session.user.name?.charAt(0) || session.user.email?.charAt(0) || "U"}
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:block w-80 border-r border-border/50 glass min-h-[calc(100vh-56px)] sticky top-14 overflow-y-auto">
          <div className="p-6">
            {/* Module info */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium">
                  Module {lesson.module.order}
                </span>
                {progressPercentage === 100 && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                    Complete
                  </span>
                )}
              </div>
              <h2 className="font-semibold text-lg">{lesson.module.title}</h2>
              
              {/* Mini progress bar */}
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                  <div 
                    className="h-full progress-gradient transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{progressPercentage}%</span>
              </div>
            </div>

            {/* Lesson list */}
            <LessonList
              moduleId={moduleId}
              lessons={lesson.module.lessons}
              currentLessonId={lessonId}
              completedLessonIds={new Set(completedLessonIds)}
            />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Mobile module selector */}
            <div className="lg:hidden mb-6">
              <Link
                href={`/course/${moduleId}`}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {lesson.module.title}
              </Link>
            </div>

            {/* Lesson header */}
            <div className="mb-8 stagger-children">
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-3">
                <span className="px-2 py-0.5 rounded-md bg-muted">
                  Lesson {lesson.order} of {lesson.module.lessons.length}
                </span>
                {lesson.isFree && (
                  <span className="px-2 py-0.5 rounded-md bg-primary/20 text-primary font-medium">
                    🎁 Free
                  </span>
                )}
                {isCompleted && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-medium flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Completed
                  </span>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{lesson.title}</h1>
            </div>

            {/* Soft lock banner */}
            {hasAccess && (access.reason === "past_due" || access.reason === "grace_period") && (
              <div className="mb-6">
                <SoftLockBanner 
                  reason={access.reason as "past_due" | "grace_period"} 
                  periodEnd={access.subscription?.currentPeriodEnd} 
                />
              </div>
            )}

            {hasAccess ? (
              <>
                {/* Video player */}
                <div className="mb-8 rounded-2xl overflow-hidden gradient-border">
                  {lesson.muxPlaybackId ? (
                    (() => {
                      const playbackToken = getPlaybackToken(lesson.muxPlaybackId);
                      return playbackToken ? (
                        <VideoPlayer
                          playbackId={lesson.muxPlaybackId}
                          playbackToken={playbackToken}
                          title={lesson.title}
                        />
                      ) : (
                        <VideoPlaceholder />
                      );
                    })()
                  ) : (
                    <VideoPlaceholder />
                  )}
                </div>

                {/* Lesson content */}
                <div className="prose prose-invert prose-lg max-w-none mb-8">
                  <TipTapRenderer content={lesson.content as JSONContent | null} />
                </div>

                {/* Assets/Resources */}
                {lesson.assets.length > 0 && (
                  <div className="mb-8 p-6 rounded-2xl glass">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Resources
                    </h3>
                    <AssetList assets={lesson.assets} />
                  </div>
                )}

                {/* Mark complete */}
                <div className="p-6 rounded-2xl glass-strong mb-8">
                  <MarkCompleteButton
                    lessonId={lessonId}
                    isComplete={isCompleted}
                    moduleTitle={lesson.module.title}
                    moduleOrder={lesson.module.order}
                    nextModuleId={nextModule?.id}
                    nextModuleTitle={nextModule?.title}
                  />
                </div>
              </>
            ) : (
              /* Paywall */
              <div className="space-y-6">
                <VideoLocked />
                <div className="rounded-2xl glass-strong p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Premium Content</h2>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Subscribe to unlock this lesson and get access to all 64+ lessons, code examples, and downloadable resources.
                  </p>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all btn-glow"
                  >
                    View Plans
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            )}

            {/* Navigation */}
            <nav className="flex items-center justify-between pt-6 border-t border-border/50">
              {prevLesson ? (
                <Link
                  href={`/course/${moduleId}/${prevLesson.id}`}
                  className="group flex items-center gap-3 p-3 -m-3 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <svg className="h-5 w-5 text-muted-foreground group-hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-xs text-muted-foreground">Previous</div>
                    <div className="font-medium text-sm line-clamp-1">{prevLesson.title}</div>
                  </div>
                </Link>
              ) : (
                <div />
              )}
              
              {nextLesson ? (
                <Link
                  href={`/course/${moduleId}/${nextLesson.id}`}
                  className="group flex items-center gap-3 p-3 -m-3 rounded-xl hover:bg-muted/50 transition-colors text-right"
                >
                  <div className="hidden sm:block">
                    <div className="text-xs text-muted-foreground">Next</div>
                    <div className="font-medium text-sm line-clamp-1">{nextLesson.title}</div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ) : nextModule ? (
                <Link
                  href={`/course/${nextModule.id}`}
                  className="group flex items-center gap-3 p-3 -m-3 rounded-xl hover:bg-muted/50 transition-colors text-right"
                >
                  <div className="hidden sm:block">
                    <div className="text-xs text-muted-foreground">Next Module</div>
                    <div className="font-medium text-sm line-clamp-1">{nextModule.title}</div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
                    <svg className="h-5 w-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ) : (
                <div />
              )}
            </nav>
          </div>
        </main>
      </div>
    </div>
  );
}
