import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const [rows] = await db.query(`
      SELECT
        p.id,
        p.noprod,
        p.produk_name,
        p.satuan,
        p.user_id,
        p.created_at,
        p.updated_at,
        COUNT(pi.id) AS item_count
      FROM partlist_produk p
      LEFT JOIN partlist_produk_items pi ON pi.produk_id = p.id
      GROUP BY p.id, p.noprod, p.produk_name, p.satuan, p.user_id, p.created_at, p.updated_at
      HAVING item_count > 0
      ORDER BY p.created_at DESC
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
