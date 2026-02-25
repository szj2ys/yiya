import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import db from "@/db/drizzle";
import { lessons } from "@/db/schema";
import { assertAdmin } from "@/lib/admin-guard";

export const GET = async (
  req: Request,
  { params }: { params: { lessonId: number } },
) => {
  const forbidden = await assertAdmin();
  if (forbidden) return forbidden;

  const data = await db.query.lessons.findFirst({
    where: eq(lessons.id, params.lessonId),
  });

  return NextResponse.json(data);
};

export const PUT = async (
  req: Request,
  { params }: { params: { lessonId: number } },
) => {
  const forbidden = await assertAdmin();
  if (forbidden) return forbidden;

  const body = await req.json();
  const data = await db.update(lessons).set({
    title: body.title,
    unitId: body.unitId,
    order: body.order,
  }).where(eq(lessons.id, params.lessonId)).returning();

  return NextResponse.json(data[0]);
};

export const DELETE = async (
  req: Request,
  { params }: { params: { lessonId: number } },
) => {
  const forbidden = await assertAdmin();
  if (forbidden) return forbidden;

  const data = await db.delete(lessons)
    .where(eq(lessons.id, params.lessonId)).returning();

  return NextResponse.json(data[0]);
};
