import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const [countRows] = (await db.query(
      "SELECT COUNT(*) as total FROM partlist_produk",
    )) as any[];
    const total = Number(countRows?.[0]?.total ?? 0);

    const [sampleRows] = (await db.query(
      "SELECT id, noprod, produk_name, satuan, user_id, created_at, updated_at FROM partlist_produk ORDER BY created_at DESC LIMIT 10",
    )) as any[];

    return NextResponse.json(
      {
        DB_HOST: process.env.DB_HOST || "unknown",
        DB_NAME: process.env.DB_NAME || "unknown",
        total,
        sample: sampleRows || [],
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("[DEBUG] /api/debug/partlist error:", error);
    return NextResponse.json(
      {
        error: "Failed to query DB",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
