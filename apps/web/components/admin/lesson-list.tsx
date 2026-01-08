"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { LessonItem } from "./lesson-item";
import { reorderLessonsAction } from "@/app/actions";

interface Lesson {
  id: string;
  title: string;
  order: number;
  published: boolean;
  isFree: boolean;
}

interface LessonListProps {
  moduleId: string;
  initialLessons: Lesson[];
}

export function LessonList({ moduleId, initialLessons }: LessonListProps) {
  const [lessons, setLessons] = useState(initialLessons);
  const [isReordering, setIsReordering] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = lessons.findIndex((l) => l.id === active.id);
      const newIndex = lessons.findIndex((l) => l.id === over.id);

      // Optimistic update
      const newLessons = arrayMove(lessons, oldIndex, newIndex);
      setLessons(newLessons);
      setIsReordering(true);

      // Persist to server
      const orderedIds = newLessons.map((l) => l.id);
      const result = await reorderLessonsAction(moduleId, orderedIds);

      if (result.error) {
        // Rollback on error
        setLessons(lessons);
        console.error("Failed to reorder:", result.error);
      }

      setIsReordering(false);
    }
  }

  if (lessons.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
        No lessons yet. Click &quot;Add Lesson&quot; to create one.
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={lessons.map((l) => l.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {isReordering && (
            <div className="text-xs text-muted-foreground animate-pulse">
              Saving new order...
            </div>
          )}
          {lessons.map((lesson, index) => (
            <LessonItem
              key={lesson.id}
              lesson={lesson}
              moduleId={moduleId}
              index={index}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
