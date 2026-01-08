import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getModuleCount, getTotalLessonCount, getPublishedModuleCount, getPublishedLessonCount } from "@/lib/data";

export default async function AdminDashboardPage() {
  // Fetch basic stats
  const [
    userCount,
    subscriberCount,
    eventCount,
    moduleCount,
    lessonCount,
    publishedModules,
    publishedLessons,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.subscription.count({
      where: { status: "ACTIVE" },
    }),
    prisma.event.count(),
    getModuleCount(),
    getTotalLessonCount(),
    getPublishedModuleCount(),
    getPublishedLessonCount(),
  ]);

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground mb-8">
          Overview of your course platform
        </p>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="rounded-lg border bg-card p-6">
            <div className="text-sm font-medium text-muted-foreground">
              Total Users
            </div>
            <div className="text-3xl font-bold mt-2">{userCount}</div>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <div className="text-sm font-medium text-muted-foreground">
              Active Subscribers
            </div>
            <div className="text-3xl font-bold mt-2">{subscriberCount}</div>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <div className="text-sm font-medium text-muted-foreground">
              Total Events
            </div>
            <div className="text-3xl font-bold mt-2">{eventCount}</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Link
            href="/admin/content"
            className="rounded-lg border bg-card p-6 hover:border-primary/50 transition-colors group"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Course Content</h2>
              <svg
                className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Modules</div>
                <div className="font-semibold">
                  {publishedModules} / {moduleCount} published
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Lessons</div>
                <div className="font-semibold">
                  {publishedLessons} / {lessonCount} published
                </div>
              </div>
            </div>
          </Link>

          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Users</h2>
            <p className="text-sm text-muted-foreground">
              User management will be implemented in Module 7
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
