import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma, UserType, ExperienceLevel } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, userType, buildGoal, experienceLevel } = body;

    // Validate required fields
    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Name must be at least 2 characters" },
        { status: 400 }
      );
    }

    if (!userType || !["SOLO_BUILDER", "EXPERIENCED_DEV", "TECH_TEAM"].includes(userType)) {
      return NextResponse.json(
        { error: "Invalid user type" },
        { status: 400 }
      );
    }

    if (!buildGoal || buildGoal.trim().length < 10) {
      return NextResponse.json(
        { error: "Build goal must be at least 10 characters" },
        { status: 400 }
      );
    }

    if (buildGoal.length > 500) {
      return NextResponse.json(
        { error: "Build goal must be 500 characters or less" },
        { status: 400 }
      );
    }

    if (!experienceLevel || !["BEGINNER", "INTERMEDIATE", "ADVANCED"].includes(experienceLevel)) {
      return NextResponse.json(
        { error: "Invalid experience level" },
        { status: 400 }
      );
    }

    // Update user with onboarding data
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name.trim(),
        userType: userType as UserType,
        buildGoal: buildGoal.trim(),
        experienceLevel: experienceLevel as ExperienceLevel,
        onboardingComplete: true,
      },
      select: {
        id: true,
        name: true,
        onboardingComplete: true,
      },
    });

    // Track onboarding_completed event
    await prisma.event.create({
      data: {
        userId: session.user.id,
        name: "onboarding_completed",
        properties: {
          userType,
          experienceLevel,
          buildGoalLength: buildGoal.trim().length,
        },
      },
    });

    return NextResponse.json(
      { message: "Onboarding completed successfully", user },
      { status: 200 }
    );
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
