import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const [[countRow]] = (await db.query(
      `SELECT COUNT(*) as cnt FROM partlist_produk` as any,
    )) as any;
    const count = countRow?.cnt ?? null;

    const [sample] = (await db.query(
      `SELECT id, noprod, produk_name, created_at FROM partlist_produk ORDER BY created_at DESC LIMIT 10` as any,
    )) as any;

    return NextResponse.json(
      {
        DB_HOST: process.env.DB_HOST || null,
        count,
        sample,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    console.error("[DEBUG] /api/debug/partlist error:", err);
    return NextResponse.json(
      { error: "Failed to query DB", details: String(err) },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
