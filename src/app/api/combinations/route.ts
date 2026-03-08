import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

// GET /api/combinations?prefix=MMK
export async function GET(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const prefix = searchParams.get("prefix") ?? "";

  const combinations = await prisma.combination.findMany({
    where: prefix
      ? { sequence: { startsWith: prefix } }
      : {},
    orderBy: { count: "desc" },
  });

  return NextResponse.json(combinations);
}

// POST /api/combinations  { sequence: "MMKMK", action: "increment" | "create" }
export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  const { sequence, action } = await req.json();

  if (!sequence || sequence.length !== 5) {
    return NextResponse.json({ error: "Geçersiz kombinasyon." }, { status: 400 });
  }

  const upper = (sequence as string).toUpperCase();
  if (!/^[MK]{5}$/.test(upper)) {
    return NextResponse.json({ error: "Kombinasyon sadece M ve K içermelidir." }, { status: 400 });
  }

  if (action === "increment") {
    const updated = await prisma.combination.update({
      where: { sequence: upper },
      data: { count: { increment: 1 }, lastSeen: new Date() },
    });
    return NextResponse.json(updated);
  }

  if (action === "create") {
    const created = await prisma.combination.upsert({
      where: { sequence: upper },
      update: { count: { increment: 1 }, lastSeen: new Date() },
      create: { sequence: upper, count: 1, lastSeen: new Date() },
    });
    return NextResponse.json(created);
  }

  return NextResponse.json({ error: "Geçersiz işlem." }, { status: 400 });
}
