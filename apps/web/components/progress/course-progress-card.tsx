"use client";

import Link from "next/link";
import type { CourseProgress, NextLesson } from "@/lib/data";

interface CourseProgressCardProps {
  progress: CourseProgress;
  nextLesson?: NextLesson | null;
}

export function CourseProgressCard({ progress, nextLesson }: CourseProgressCardProps) {
  const {
    completedModules,
    totalModules,
    completedLessons,
    totalLessons,
    percentage,
    isComplete,
  } = progress;
  
  const hasStarted = completedLessons > 0;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="rounded-2xl glass-strong p-6 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-emerald-500/5" />
      
      <div className="relative">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          {/* Progress Circle */}
          <div className="flex items-center justify-center lg:justify-start">
            <div className="relative">
              <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-muted/30"
                />
                {/* Progress circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="url(#progressGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="hsl(142 76% 36%)" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Center content */}
              <div className="absolute inset-0 flex items-center justify-center">
                {isComplete ? (
                  <div className="text-center">
                    <span className="text-3xl">🎉</span>
                  </div>
                ) : (
                  <div className="text-center">
                    <span className="text-3xl font-bold gradient-text">{percentage}</span>
                    <span className="text-lg text-muted-foreground">%</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats & Info */}
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-xl font-semibold mb-1">
                {isComplete ? "Course Complete!" : "Your Progress"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isComplete
                  ? "Congratulations on completing the entire course!"
                  : hasStarted
                    ? `You're making great progress. Keep going!`
                    : "Start your journey to AI mastery"}
              </p>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <div className="text-lg font-bold tabular-nums">
                    {completedLessons}<span className="text-muted-foreground font-normal">/{totalLessons}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Lessons</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <div className="text-lg font-bold tabular-nums">
                    {completedModules}<span className="text-muted-foreground font-normal">/{totalModules}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Modules</div>
                </div>
              </div>
            </div>
          </div>

          {/* Resume/Start button */}
          {!isComplete && nextLesson && (
            <div className="lg:ml-auto">
              <Link
                href={`/course/${nextLesson.moduleId}/${nextLesson.id}`}
                className="group flex items-center gap-4 p-4 rounded-xl glass hover:bg-muted/50 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">
                    {hasStarted ? "Continue" : "Start"}
                  </div>
                  <div className="font-medium text-sm max-w-[200px] truncate">
                    {nextLesson.title}
                  </div>
                </div>
                <svg className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}

          {/* Completion badge */}
          {isComplete && (
            <div className="lg:ml-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">Completed</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
