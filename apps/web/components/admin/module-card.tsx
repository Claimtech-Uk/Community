"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { EditModuleDialog } from "./edit-module-dialog";
import { DeleteModuleDialog } from "./delete-module-dialog";
import { LessonList } from "./lesson-list";
import { CreateLessonButton } from "./create-lesson-button";

interface Lesson {
  id: string;
  title: string;
  order: number;
  published: boolean;
  isFree: boolean;
}

interface Module {
  id: string;
  title: string;
  description: string | null;
  order: number;
  published: boolean;
  lessons: Lesson[];
}

interface ModuleCardProps {
  module: Module;
}

export function ModuleCard({ module }: ModuleCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: module.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-xl border bg-card shadow-sm hover:shadow-md transition-all ${
        isDragging ? "opacity-50 shadow-lg ring-2 ring-primary/50" : ""
      } ${isExpanded ? "ring-1 ring-primary/20" : ""}`}
    >
      {/* Module Header */}
      <div className="flex items-center gap-4 p-5">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          suppressHydrationWarning
          className="cursor-grab active:cursor-grabbing touch-none p-2 -m-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Drag to reorder"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </button>

        {/* Module Number Badge */}
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <span className="text-lg font-bold text-primary">{module.order}</span>
        </div>

        {/* Module Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate">{module.title}</h3>
          {module.description && (
            <p className="text-sm text-muted-foreground truncate mt-0.5">
              {module.description}
            </p>
          )}
        </div>

        {/* Lesson Count */}
        <div className="hidden sm:flex flex-col items-end text-sm">
          <span className="font-semibold">{module.lessons.length}</span>
          <span className="text-muted-foreground text-xs">
            {module.lessons.length === 1 ? "lesson" : "lessons"}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 border-l pl-4 ml-2">
          {/* Edit */}
          <EditModuleDialog module={module} />

          {/* Delete */}
          <DeleteModuleDialog moduleId={module.id} moduleTitle={module.title} lessonCount={module.lessons.length} />

          {/* Expand/Collapse */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`rounded-lg p-2 transition-all ${
              isExpanded 
                ? "bg-primary/10 text-primary" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <svg
              className={`h-5 w-5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded Lesson List */}
      {isExpanded && (
        <div className="border-t bg-muted/20 p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Lessons in this module
            </h4>
            <CreateLessonButton moduleId={module.id} />
          </div>
          <LessonList moduleId={module.id} initialLessons={module.lessons} />
        </div>
      )}
    </div>
  );
}
