import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT
        id,
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
      ORDER BY CODE ASC, LNAMA ASC
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
