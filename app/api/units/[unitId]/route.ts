import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import db from "@/db/drizzle";
import { units } from "@/db/schema";
import { assertAdmin } from "@/lib/admin-guard";

export const GET = async (
  req: Request,
  { params }: { params: { unitId: number } },
) => {
  const forbidden = await assertAdmin();
  if (forbidden) return forbidden;

  const data = await db.query.units.findFirst({
    where: eq(units.id, params.unitId),
  });

  return NextResponse.json(data);
};

export const PUT = async (
  req: Request,
  { params }: { params: { unitId: number } },
) => {
  const forbidden = await assertAdmin();
  if (forbidden) return forbidden;

  const body = await req.json();
  const data = await db.update(units).set({
    title: body.title,
    description: body.description,
    courseId: body.courseId,
    order: body.order,
  }).where(eq(units.id, params.unitId)).returning();

  return NextResponse.json(data[0]);
};

export const DELETE = async (
  req: Request,
  { params }: { params: { unitId: number } },
) => {
  const forbidden = await assertAdmin();
  if (forbidden) return forbidden;

  const data = await db.delete(units)
    .where(eq(units.id, params.unitId)).returning();

  return NextResponse.json(data[0]);
};
