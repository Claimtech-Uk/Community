import { Suspense } from "react";
import { getAllModulesWithLessons } from "@/lib/data";
import { ModuleList } from "@/components/admin/module-list";
import { CreateModuleButton } from "@/components/admin/create-module-button";

export default async function AdminContentPage() {
  const modules = await getAllModulesWithLessons();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Course Content</h1>
          <p className="text-muted-foreground">
            Manage modules and lessons for your course
          </p>
        </div>
        <CreateModuleButton />
      </div>

      <Suspense fallback={<ModuleListSkeleton />}>
        <ModuleList initialModules={modules} />
      </Suspense>
    </div>
  );
}

function ModuleListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-24 rounded-lg border bg-muted/50 animate-pulse"
        />
      ))}
    </div>
  );
}
