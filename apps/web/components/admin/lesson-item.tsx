"use client";

import { useState } from "react";
import Link from "next/link";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toggleLessonFreeAction, deleteLessonAction } from "@/app/actions";
import { useRouter } from "next/navigation";

interface Lesson {
  id: string;
  title: string;
  order: number;
  published: boolean;
  isFree: boolean;
}

interface LessonItemProps {
  lesson: Lesson;
  moduleId: string;
  index: number;
}

export function LessonItem({ lesson, moduleId, index }: LessonItemProps) {
  const router = useRouter();
  const [isFree, setIsFree] = useState(lesson.isFree);
  const [isToggling, setIsToggling] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  async function handleToggleFree() {
    setIsToggling(true);
    const previousState = isFree;
    setIsFree(!isFree);

    const result = await toggleLessonFreeAction(lesson.id);

    if (result.error) {
      setIsFree(previousState);
      console.error("Failed to toggle:", result.error);
    }

    setIsToggling(false);
  }

  async function handleDelete() {
    setIsDeleting(true);
    const result = await deleteLessonAction(lesson.id);

    if (result.error) {
      console.error("Failed to delete:", result.error);
      setIsDeleting(false);
      return;
    }

    router.refresh();
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-3 rounded-lg border bg-background p-4 transition-all hover:border-primary/30 hover:shadow-sm ${
        isDragging ? "opacity-50 shadow-md ring-2 ring-primary/50" : ""
      }`}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        suppressHydrationWarning
        className="cursor-grab active:cursor-grabbing touch-none p-1.5 -m-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
        aria-label="Drag to reorder"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </button>

      {/* Lesson Number */}
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-sm font-semibold">
        {index + 1}
      </span>

      {/* Lesson Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Link 
            href={`/admin/content/lessons/${lesson.id}`}
            className="font-medium truncate hover:text-primary transition-colors"
          >
            {lesson.title}
          </Link>
          {isFree && (
            <span className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              Free
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Toggle Free */}
        <button
          onClick={handleToggleFree}
          disabled={isToggling}
          className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
            isFree
              ? "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          } disabled:opacity-50`}
          title={isFree ? "Make paid" : "Make free"}
        >
          {isFree ? "Paid" : "Free"}
        </button>

        {/* Edit */}
        <Link
          href={`/admin/content/lessons/${lesson.id}`}
          className="rounded-lg p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
          title="Edit lesson"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </Link>

        {/* Delete */}
        {showDeleteConfirm ? (
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded-md bg-destructive px-2.5 py-1 text-xs font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
            >
              {isDeleting ? "..." : "Delete"}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            title="Delete lesson"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
