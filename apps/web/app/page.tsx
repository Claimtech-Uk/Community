import Link from "next/link";

import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          AI Systems Architect
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Master the art of building AI systems from the ground up
        </p>

        <div className="flex gap-4 justify-center">
          {session?.user ? (
            <Link
              href="/dashboard"
              className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/auth/signup"
                className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Get Started
              </Link>
              <Link
                href="/auth/signin"
                className="rounded-md border border-input bg-background px-6 py-3 text-sm font-medium hover:bg-accent"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
