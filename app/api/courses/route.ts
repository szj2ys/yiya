import { NextResponse } from "next/server";

import db from "@/db/drizzle";
import { assertAdmin } from "@/lib/admin-guard";
import { courses } from "@/db/schema";

export const GET = async () => {
  const forbidden = await assertAdmin();
  if (forbidden) return forbidden;

  const data = await db.query.courses.findMany();

  return NextResponse.json(data);
};

export const POST = async (req: Request) => {
  const forbidden = await assertAdmin();
  if (forbidden) return forbidden;

  const body = await req.json();

  const data = await db.insert(courses).values({
    title: body.title,
    imageSrc: body.imageSrc,
  }).returning();

  return NextResponse.json(data[0]);
};
