import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const produkId = params.id;

    // Start transaction
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      // Delete items first (due to foreign key constraint)
      await connection.execute(
        "DELETE FROM partlist_produk_items WHERE produk_id = ?",
        [produkId],
      );

      // Delete main produk record
      await connection.execute("DELETE FROM partlist_produk WHERE id = ?", [
        produkId,
      ]);

      await connection.commit();

      console.log("Part List Produk deleted successfully:", { produkId });

      return NextResponse.json(
        { message: "Part List Produk berhasil dihapus" },
        { status: 200 },
      );
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error deleting part list produk:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
