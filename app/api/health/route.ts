import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { columns } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export function GET() {
  try {
    db.select({ n: sql<number>`1` }).from(columns).limit(1).all();
    return NextResponse.json({ status: "ok" });
  } catch {
    return NextResponse.json({ status: "error" }, { status: 503 });
  }
}
