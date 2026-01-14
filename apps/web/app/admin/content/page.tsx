import { Suspense } from "react";
import Link from "next/link";
import { getAllModulesWithLessons } from "@/lib/data";
import { ModuleList } from "@/components/admin/module-list";
import { CreateModuleButton } from "@/components/admin/create-module-button";

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
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

export default async function AdminContentPage() {
  const modules = await getAllModulesWithLessons();

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Course Content</h1>
            <p className="text-muted-foreground mt-1">
              Manage modules and lessons for your course
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/admin/mux-cleanup"
              className="px-4 py-2 rounded-lg border hover:bg-muted text-sm"
            >
              🎬 Manage Videos
            </Link>
            <CreateModuleButton />
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard 
            label="Total Modules" 
            value={modules.length} 
            icon="📚" 
          />
          <StatCard 
            label="Published" 
            value={modules.filter((m: any) => m.published).length} 
            icon="✅" 
          />
          <StatCard 
            label="Total Lessons" 
            value={modules.reduce((acc: number, m: any) => acc + m.lessons.length, 0)} 
            icon="🎬" 
          />
          <StatCard 
            label="Draft" 
            value={modules.filter((m: any) => !m.published).length} 
            icon="📝" 
          />
        </div>

        {/* Module List */}
        <Suspense fallback={<ModuleListSkeleton />}>
          <ModuleList initialModules={modules} />
        </Suspense>
      </div>
    </div>
  );
}
