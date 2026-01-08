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
import { ModuleCard } from "./module-card";
import { reorderModulesAction } from "@/app/actions";

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

interface ModuleListProps {
  initialModules: Module[];
}

export function ModuleList({ initialModules }: ModuleListProps) {
  const [modules, setModules] = useState(initialModules);
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
      const oldIndex = modules.findIndex((m) => m.id === active.id);
      const newIndex = modules.findIndex((m) => m.id === over.id);

      // Optimistic update
      const newModules = arrayMove(modules, oldIndex, newIndex);
      setModules(newModules);
      setIsReordering(true);

      // Persist to server
      const orderedIds = newModules.map((m) => m.id);
      const result = await reorderModulesAction(orderedIds);

      if (result.error) {
        // Rollback on error
        setModules(modules);
        console.error("Failed to reorder:", result.error);
      }

      setIsReordering(false);
    }
  }

  if (modules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          <svg
            className="h-10 w-10 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <h3 className="mt-4 text-lg font-semibold">No modules yet</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            Create your first module to start building your course.
          </p>
        </div>
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
        items={modules.map((m) => m.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {isReordering && (
            <div className="text-sm text-muted-foreground animate-pulse">
              Saving new order...
            </div>
          )}
          {modules.map((module) => (
            <ModuleCard key={module.id} module={module} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
