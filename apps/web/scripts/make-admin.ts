import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function makeAdmin(email: string) {
  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: "ADMIN" },
    });

    console.log(`✅ Successfully set ${user.email} as ADMIN`);
    console.log(`   User ID: ${user.id}`);
    console.log(`   Name: ${user.name || "Not set"}`);
  } catch (error) {
    if ((error as any).code === "P2025") {
      console.error(`❌ User with email "${email}" not found`);
    } else {
      console.error("❌ Error:", error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line argument or use default
const email = process.argv[2] || "harshal@claimtech.io";
makeAdmin(email);
