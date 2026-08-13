import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const [rows] = await db.query(`
      SELECT 
        id,
        noprod,
        produk_name,
        satuan,
        user_id,
        created_at,
        updated_at
      FROM partlist_produk 
      ORDER BY created_at DESC
    `);

    console.log(
      "[DEBUG][partlist_list] rows=",
      Array.isArray(rows) ? rows.length : 0,
      "DB_HOST=",
      process.env.DB_HOST || "unknown",
    );
    return NextResponse.json(rows, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Error fetching part list produk:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
