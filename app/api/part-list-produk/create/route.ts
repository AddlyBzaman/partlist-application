import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Node.js runtime for database operations
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { noprod, produk_name, satuan, bahan_items, user_id } = body;

    console.log("[DEBUG][create] incoming partlist", {
      noprod,
      produk_name,
      satuan,
      items: Array.isArray(bahan_items) ? bahan_items.length : 0,
      user_id,
      env_DB_HOST: process.env.DB_HOST || "unknown",
    });

    // Validate required fields
    if (
      !noprod ||
      !produk_name ||
      !satuan ||
      !bahan_items ||
      bahan_items.length === 0
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Start transaction
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      // Insert main produk record
      const [produkResult] = await connection.execute(
        "INSERT INTO partlist_produk (noprod, produk_name, satuan, user_id) VALUES (?, ?, ?, ?)",
        [noprod, produk_name, satuan, user_id],
      );

      const produkId = (produkResult as any).insertId;

      // Insert bahan items
      for (const item of bahan_items) {
        // Fetch BDOWN from partlist_a based on code
        let bdownValue = "";
        if (item.code) {
          const [bahanRows] = await connection.execute(
            "SELECT BDOWN FROM partlist_a WHERE CODE = ? LIMIT 1",
            [item.code],
          );
          const bahanData = bahanRows as any[];
          if (bahanData.length > 0) {
            bdownValue = bahanData[0].BDOWN || "";
          }
        }

        await connection.execute(
          `INSERT INTO partlist_produk_items 
           (produk_id, item_no, code, nama_bahan, spesifikasi, keterangan, pakai_pc, unit, BDOWN) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            produkId,
            item.no,
            item.code || "",
            item.nama_bahan || "",
            item.spesifikasi || "",
            item.keterangan || "",
            item.pakai_pc || "",
            item.unit || "",
            bdownValue,
          ],
        );
      }

      await connection.commit();

      const savedData = {
        produkId,
        noprod,
        produk_name,
        satuan,
        user_id,
        items_count: bahan_items.length,
        created_at: new Date().toISOString(),
      };

      console.log("Part List Produk saved successfully:", savedData);

      return NextResponse.json(
        {
          message: "Part List Produk berhasil disimpan",
          data: {
            produkId,
            noprod,
            produk_name,
            satuan,
            user_id,
            items_count: bahan_items.length,
            created_at: new Date().toISOString(),
          },
        },
        { status: 200 },
      );
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error saving part list produk:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
