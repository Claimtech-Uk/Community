import { redirect } from "next/navigation";
import Link from "next/link";

import { requireAdmin } from "@/lib/admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side role check - redirects if not admin
  const admin = await requireAdmin();

  if (!admin) {
    redirect("/unauthorized");
  }

  return (
    <div className="min-h-screen">
      {/* Admin header */}
      <header className="border-b bg-card">
        <div className="flex h-16 items-center px-6">
          <Link href="/admin" className="font-semibold text-lg">
            Admin Panel
          </Link>
          <nav className="ml-8 flex items-center gap-6 text-sm">
            <Link
              href="/admin"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/users"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Users
            </Link>
            <Link
              href="/admin/content"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Content
            </Link>
          </nav>
          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {admin.email}
            </span>
            <Link
              href="/dashboard"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back to App
            </Link>
          </div>
        </div>
      </header>

      {/* Admin content */}
      <main>{children}</main>
    </div>
  );
}
