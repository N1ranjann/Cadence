import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createHabitSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  emoji: z.string().optional().default("✅"),
  color: z.string().optional().default("#2dd4bf"),
  targetDaysPerWeek: z.number().int().min(1).max(7).default(7),
});

export async function GET() {
  const userId = await getSessionUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const habits = await prisma.habit.findMany({
      where: { userId, isArchived: false },
      orderBy: { createdAt: "asc" },
      include: {
        logs: {
          orderBy: { completedAt: "desc" },
          take: 30, // Get last 30 logs for the heatmap/streak calculation
        },
      },
    });

    return NextResponse.json(habits);
  } catch (error) {
    console.error("Failed to fetch habits:", error);
    return NextResponse.json(
      { error: "Failed to fetch habits" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const userId = await getSessionUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = createHabitSchema.parse(body);

    const habit = await prisma.habit.create({
      data: {
        ...data,
        userId,
      },
    });

    return NextResponse.json(habit, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Failed to create habit:", error);
    return NextResponse.json(
      { error: "Failed to create habit" },
      { status: 500 }
    );
  }
}
