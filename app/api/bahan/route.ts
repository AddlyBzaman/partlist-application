import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT
        id,
        kode_bahan_lama AS code_lama,
        kode_bahan_baru AS code_baru,
        nama_bahan,
        spesifikasi,
        unit,
        currency,
        cost,
        bea_material,
        supplier
      FROM partlist_a
      ORDER BY id DESC
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Gagal ambil data" },
      { status: 500 }
    );
  }
}
