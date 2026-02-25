import { NextResponse } from "next/server";

import db from "@/db/drizzle";
import { assertAdmin } from "@/lib/admin-guard";
import { units } from "@/db/schema";

export const GET = async () => {
  const forbidden = await assertAdmin();
  if (forbidden) return forbidden;

  const data = await db.query.units.findMany();

  return NextResponse.json(data);
};

export const POST = async (req: Request) => {
  const forbidden = await assertAdmin();
  if (forbidden) return forbidden;

  const body = await req.json();

  const data = await db.insert(units).values({
    title: body.title,
    description: body.description,
    courseId: body.courseId,
    order: body.order,
  }).returning();

  return NextResponse.json(data[0]);
};
