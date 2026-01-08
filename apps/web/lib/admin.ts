import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Check if the current user has ADMIN role
 * Always checks the database for the most up-to-date role
 */
export async function isAdmin(): Promise<boolean> {
  const session = await auth();
  
  if (!session?.user?.id) {
    return false;
  }

  // Check database for current role (handles role changes after session creation)
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  return user?.role === "ADMIN";
}

/**
 * Get current user with role verification
 * Returns null if user is not authenticated or not an admin
 */
export async function requireAdmin() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  if (user?.role !== "ADMIN") {
    return null;
  }

  return user;
}
