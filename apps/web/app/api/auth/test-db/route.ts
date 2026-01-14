import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Try to connect to database
    await prisma.$connect();
    
    // Count users
    const userCount = await prisma.user.count();
    
    // Check if tables exist by trying to query them
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    return NextResponse.json({
      status: "✓ Database connected",
      userCount,
      tables: tables,
    });
  } catch (error: any) {
    return NextResponse.json({
      status: "✗ Database error",
      error: error.message,
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
