import { NextRequest, NextResponse } from "next/server";
import { getDbConnection } from "@/lib/db-simple";

export async function GET(
  request: NextRequest,
  { params }: { params: { noprod: string } },
) {
  try {
    const noprod = params.noprod;
    const db = await getDbConnection();

    console.log(
      "[DEBUG][materials] requested noprod=",
      noprod,
      "DB_HOST=",
      process.env.DB_HOST || "unknown",
    );

    // First get the product name from partlist table using NOPROD
    const [productRows] = (await db.execute(
      "SELECT PRODUK FROM partlist WHERE NOPROD = ?",
      [noprod],
    )) as any[];

    if (productRows.length === 0) {
      return NextResponse.json([], {
        headers: { "Cache-Control": "no-store" },
      });
    }

    const productName = productRows[0].PRODUK;

    // Prefer partlist_produk (per-produk partlist) if exists
    const [produkRows] = (await db.execute(
      "SELECT id FROM partlist_produk WHERE noprod = ? LIMIT 1",
      [noprod],
    )) as any[];

    console.log("[DEBUG][materials] partlist_produk rows:", produkRows.length);

    if (produkRows.length > 0) {
      const produkId = produkRows[0].id;

      const [itemRows] = (await db.execute(
        `SELECT
          id,
          produk_id,
          item_no,
          code,
          nama_bahan,
          spesifikasi,
          keterangan,
          pakai_pc,
          unit,
          BDOWN,
          created_at
        FROM partlist_produk_items
        WHERE produk_id = ?
        ORDER BY item_no ASC`,
        [produkId],
      )) as any[];

      console.log(
        "[DEBUG][materials] partlist_produk_items count=",
        itemRows.length,
      );

      // Map items to expected shape used by the produk UI (partlist_a shape)
      const mapped = itemRows.map((it: any) => ({
        code: it.code || "",
        code_baru: "",
        nama_bahan: it.nama_bahan || "",
        spesifikasi: it.spesifikasi || "",
        unit: it.unit || "",
        PROSES: "",
        BDOWN: it.BDOWN || "",
        RUMUS: "",
        Produk: productName,
        pakaiperpcs: it.pakai_pc || "",
        namawip: "",
        departemen: "",
      }));

      return NextResponse.json(mapped, {
        headers: { "Cache-Control": "no-store" },
      });
    }

    // Fallback: Get materials from partlist_a that are related to this product name
    const [rows] = await db.execute(
      `
      SELECT
        CODE AS code,
        CODE_BARU AS code_baru,
        LNAMA AS nama_bahan,
        SPEK AS spesifikasi,
        UNIT AS unit,
        PROSES,
        BDOWN,
        RUMUS,
        Produk,
        pakaiperpcs,
        namawip,
        departemen
      FROM partlist_a 
      WHERE Produk = ?
      ORDER BY CODE ASC, LNAMA ASC
    `,
      [productName],
    );

    return NextResponse.json(rows, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Error fetching materials for product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
