import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const toggleLogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD"),
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const userId = await getSessionUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { date } = toggleLogSchema.parse(body);

    // Verify ownership
    const habit = await prisma.habit.findUnique({
      where: { id: params.id },
    });

    if (!habit || habit.userId !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const completedAt = new Date(`${date}T00:00:00Z`);

    // Check if log exists
    const existingLog = await prisma.habitLog.findUnique({
      where: {
        habitId_completedAt: {
          habitId: params.id,
          completedAt,
        },
      },
    });

    if (existingLog) {
      // Toggle off: delete the log
      await prisma.habitLog.delete({
        where: { id: existingLog.id },
      });
      return NextResponse.json({ status: "removed" });
    } else {
      // Toggle on: create the log
      const log = await prisma.habitLog.create({
        data: {
          habitId: params.id,
          userId,
          completedAt,
        },
      });
      return NextResponse.json({ status: "added", log });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Failed to toggle habit log:", error);
    return NextResponse.json(
      { error: "Failed to toggle habit log" },
      { status: 500 }
    );
  }
}
