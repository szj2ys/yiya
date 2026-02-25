import { NextResponse } from "next/server";

import db from "@/db/drizzle";
import { assertAdmin } from "@/lib/admin-guard";
import { challengeOptions } from "@/db/schema";

export const GET = async () => {
  const forbidden = await assertAdmin();
  if (forbidden) return forbidden;

  const data = await db.query.challengeOptions.findMany();

  return NextResponse.json(data);
};

export const POST = async (req: Request) => {
  const forbidden = await assertAdmin();
  if (forbidden) return forbidden;

  const body = await req.json();

  const data = await db.insert(challengeOptions).values({
    challengeId: body.challengeId,
    text: body.text,
    correct: body.correct,
    imageSrc: body.imageSrc,
    audioSrc: body.audioSrc,
  }).returning();

  return NextResponse.json(data[0]);
};
