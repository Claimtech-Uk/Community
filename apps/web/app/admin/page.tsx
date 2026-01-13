import Link from "next/link";
import {
  getDashboardMetrics,
  getConversionFunnel,
  getRecentActivity,
  getContentStats,
  getEmailStats,
} from "@/lib/data";

export default async function AdminDashboardPage() {
  const [metrics, funnel, activity, content, emailStats] = await Promise.all([
    getDashboardMetrics(),
    getConversionFunnel("30d"),
    getRecentActivity("7d"),
    getContentStats(),
    getEmailStats("30d"),
  ]);

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Business metrics and platform overview
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Course
          </Link>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="Monthly Revenue"
            value={metrics.mrrFormatted}
            subtext="MRR"
            icon="💰"
            gradient="from-emerald-500/20 to-emerald-500/5"
          />
          <MetricCard
            title="Active Subscribers"
            value={metrics.activeSubscribers.toString()}
            subtext={`${metrics.conversionRate}% conversion`}
            icon="👥"
            gradient="from-primary/20 to-primary/5"
          />
          <MetricCard
            title="Total Users"
            value={metrics.totalUsers.toString()}
            subtext={`+${activity.newUsers} this week`}
            icon="📈"
            gradient="from-blue-500/20 to-blue-500/5"
          />
          <MetricCard
            title="Avg. Progress"
            value={`${metrics.averageProgress}%`}
            subtext="course completion"
            icon="🎯"
            gradient="from-amber-500/20 to-amber-500/5"
          />
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Conversion Funnel */}
          <div className="lg:col-span-2 rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-6">Conversion Funnel (30 days)</h2>
            <div className="space-y-6">
              <FunnelStep
                label="Signups"
                value={funnel.signups}
                percentage={100}
                color="bg-blue-500"
              />
              <FunnelStep
                label="Activated (video started)"
                value={funnel.activated}
                percentage={funnel.activationRate}
                color="bg-amber-500"
                sublabel={`${funnel.activationRate}% activation rate`}
              />
              <FunnelStep
                label="Converted (subscribed)"
                value={funnel.converted}
                percentage={funnel.overallConversionRate}
                color="bg-emerald-500"
                sublabel={`${funnel.overallConversionRate}% conversion rate`}
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <QuickActionCard
              href="/admin/content"
              title="Course Content"
              description={`${content.publishedModules}/${content.totalModules} modules • ${content.publishedLessons}/${content.totalLessons} lessons`}
              icon="📚"
            />
            <QuickActionCard
              href="/admin/users"
              title="User Management"
              description="View users, subscriptions & access"
              icon="👤"
            />
            <QuickActionCard
              href="/admin/content"
              title="Upload Content"
              description="Add new modules and lessons"
              icon="📤"
            />
          </div>
        </div>

        {/* Activity & Stats */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Recent Activity (7 days)</h2>
            <div className="grid grid-cols-2 gap-3">
              <ActivityStat label="New Users" value={activity.newUsers} icon="👤" color="text-blue-500" />
              <ActivityStat label="New Subs" value={activity.newSubscriptions} icon="⭐" color="text-amber-500" />
              <ActivityStat label="Lessons Done" value={activity.lessonsCompleted} icon="✅" color="text-emerald-500" />
              <ActivityStat label="Modules Done" value={activity.modulesCompleted} icon="🏆" color="text-purple-500" />
            </div>
          </div>

          {/* Email Stats */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Email Stats (30 days)</h2>
            <div className="grid grid-cols-2 gap-3">
              <ActivityStat label="Sent" value={emailStats.sent} icon="✉️" color="text-emerald-500" />
              <ActivityStat label="Pending" value={emailStats.pending} icon="⏳" color="text-amber-500" />
              <ActivityStat label="Failed" value={emailStats.failed} icon="❌" color="text-red-500" />
              <ActivityStat label="Cancelled" value={emailStats.cancelled} icon="🚫" color="text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  subtext,
  icon,
  gradient,
}: {
  title: string;
  value: string;
  subtext: string;
  icon: string;
  gradient: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-50`} />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="text-3xl font-bold tracking-tight mb-1">{value}</div>
        <div className="text-sm font-medium text-foreground/80">{title}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{subtext}</div>
      </div>
    </div>
  );
}

function QuickActionCard({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-xl border bg-card p-5 hover:bg-muted/50 hover:border-primary/50 transition-all shadow-sm hover:shadow-md"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl group-hover:bg-primary/20 group-hover:scale-110 transition-all">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        </div>
        <svg className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}

function FunnelStep({
  label,
  value,
  percentage,
  color,
  sublabel,
}: {
  label: string;
  value: number;
  percentage: number;
  color: string;
  sublabel?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-lg font-bold">{value.toLocaleString()}</span>
      </div>
      <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
        <div
          className={`${color} h-full rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      {sublabel && (
        <span className="text-xs text-muted-foreground mt-1 block">{sublabel}</span>
      )}
    </div>
  );
}

function ActivityStat({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: string;
  color: string;
}) {
  return (
    <div className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{icon}</span>
        <span className="text-sm text-muted-foreground font-medium">{label}</span>
      </div>
      <div className={`text-3xl font-bold tracking-tight ${color}`}>{value.toLocaleString()}</div>
    </div>
  );
}
