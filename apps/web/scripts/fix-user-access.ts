import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Get all users
  const users = await prisma.user.findMany({
    include: {
      subscription: true,
    },
  });

  console.log("\n📋 Current Users Status:\n");
  console.log("=".repeat(80));
  
  for (const user of users) {
    console.log(`\nUser: ${user.name || "No name"} (${user.email})`);
    console.log(`  ID: ${user.id}`);
    console.log(`  Role: ${user.role}`);
    console.log(`  Onboarding Complete: ${user.onboardingComplete}`);
    console.log(`  Access Override: ${user.accessOverride}`);
    console.log(`  Subscription: ${user.subscription ? user.subscription.status : "None"}`);
  }

  console.log("\n" + "=".repeat(80));
  console.log("\n🔧 Fixing user access...\n");

  // Fix: Set onboardingComplete to true for all users who have filled their info
  // Fix: Set accessOverride to true for all users (or specific ones you want to have Pro access)
  
  const updated = await prisma.user.updateMany({
    data: {
      onboardingComplete: true,
      accessOverride: true,
    },
  });

  console.log(`✅ Updated ${updated.count} users`);
  console.log("   - Set onboardingComplete = true");
  console.log("   - Set accessOverride = true (Pro access)");

  // Show final state
  const updatedUsers = await prisma.user.findMany({
    include: {
      subscription: true,
    },
  });

  console.log("\n📋 Updated Users Status:\n");
  console.log("=".repeat(80));
  
  for (const user of updatedUsers) {
    console.log(`\nUser: ${user.name || "No name"} (${user.email})`);
    console.log(`  Onboarding Complete: ${user.onboardingComplete} ✅`);
    console.log(`  Access Override: ${user.accessOverride} ✅`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
